import { useEffect, useRef } from 'react'

// Chrome 离线小恐龙跑酷：Canvas 像素绘制，无图片素材
// 空格 / 点击跳跃，本地保存最高分，配色跟随主题变量

const CELL = 2 // 每个像素块的逻辑尺寸
const W = 760
const H = 150
const GROUND_Y = 122
const DINO_X = 36
const DINO_W = 36
const DINO_H = 42

// 像素精灵（'#' = 着色块）
const DINO_BODY = [
  '...........#####',
  '..........#######',
  '..........##.####',
  '..........#######',
  '..........#####',
  '..........########',
  '..........##',
  '#.........###',
  '##.......####',
  '###.....######',
  '####...#######..##',
  '######.#########.#',
  '##############',
  '.############',
  '..##########',
  '....######',
  '.....####'
]
const DINO_LEGS = [
  // 跑步帧 A
  ['.....#....#', '.....#....#', '.....#....#', '.....##...##'],
  // 跑步帧 B
  ['......#...#', '......#...#', '......#...#', '.....##...##'],
  // 跳跃 / 站立
  ['.....#....#', '.....#....#', '.....#....#', '.....##...##']
]
const CACTI = [
  [
    '....##',
    '....##',
    '....##',
    '#...##...#',
    '#...##...#',
    '##..##..##',
    '##..##..##',
    '##..##..##',
    '###.##.###',
    '.######.##',
    '....##',
    '....##',
    '....##',
    '....##',
    '....##',
    '....##'
  ],
  [
    '...##',
    '...##',
    '#..##..#',
    '##.##.##',
    '##.##.##',
    '#####.##',
    '..####',
    '...##',
    '...##',
    '...##',
    '...##',
    '...##'
  ]
]

export function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 白色线稿，直接融入 hero 的蓝色底
    const palette = { fg: '#ffffff', muted: 'rgba(255,255,255,0.55)' }

    type Phase = 'idle' | 'run' | 'over'
    interface Obstacle {
      x: number
      sprite: string[]
      w: number
      h: number
    }

    let phase: Phase = 'idle'
    let dinoY = 0 // 离地高度
    let dinoVY = 0
    let speed = 0
    let distance = 0
    let score = 0
    let hi = Number(localStorage.getItem('dino-hi') ?? 0) || 0
    let obstacles: Obstacle[] = []
    const clouds = [
      { x: 180, y: 26 },
      { x: 420, y: 44 },
      { x: 640, y: 20 }
    ]
    let gapLeft = 0
    let pebbleOffset = 0
    let runTime = 0
    let rafId = 0
    let lastT = 0

    const drawSprite = (
      sprite: string[],
      x: number,
      y: number,
      color: string
    ) => {
      ctx.fillStyle = color
      for (const [r, row] of sprite.entries()) {
        for (const [c, ch] of [...row].entries()) {
          if (ch === '#') {
            ctx.fillRect(x + c * CELL, y + r * CELL, CELL, CELL)
          }
        }
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // 云
      ctx.globalAlpha = 0.3
      ctx.fillStyle = palette.muted
      for (const cl of clouds) {
        ctx.fillRect(cl.x, cl.y, 30, 8)
        ctx.fillRect(cl.x + 7, cl.y - 6, 16, 7)
        ctx.fillRect(cl.x + 20, cl.y + 2, 14, 6)
      }
      ctx.globalAlpha = 1

      // 地面 + 石子
      ctx.fillStyle = palette.fg
      ctx.fillRect(0, GROUND_Y, W, 3)
      ctx.fillStyle = palette.muted
      for (let x = -pebbleOffset; x < W; x += 90) {
        ctx.fillRect(x, GROUND_Y + 9, 9, 3)
      }

      // 恐龙
      const top = GROUND_Y - DINO_H - dinoY
      drawSprite(DINO_BODY, DINO_X, top, palette.fg)
      const legs =
        phase === 'run' && dinoY === 0
          ? DINO_LEGS[Math.floor(runTime / 0.09) % 2]
          : DINO_LEGS[2]
      drawSprite(legs, DINO_X, top + 17 * CELL, palette.fg)

      // 仙人掌
      for (const ob of obstacles) {
        drawSprite(ob.sprite, ob.x, GROUND_Y - ob.h, palette.fg)
      }

      // 分数
      ctx.font = '700 14px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.textAlign = 'right'
      ctx.fillStyle = palette.muted
      ctx.fillText(`HI ${String(hi).padStart(5, '0')}`, W - 90, 24)
      ctx.fillStyle = palette.fg
      ctx.fillText(String(score).padStart(5, '0'), W - 16, 24)

      // 状态提示
      ctx.textAlign = 'center'
      if (phase === 'idle') {
        ctx.fillStyle = palette.muted
        ctx.fillText('按空格 / 点击开跑', W / 2, 40)
      } else if (phase === 'over') {
        ctx.fillStyle = palette.fg
        ctx.font = '900 18px ui-monospace, SFMono-Regular, Menlo, monospace'
        ctx.fillText('GAME OVER', W / 2, 34)
        ctx.font = '700 14px ui-monospace, SFMono-Regular, Menlo, monospace'
        ctx.fillStyle = palette.muted
        ctx.fillText('空格 / 点击重来', W / 2, 56)
      }
    }

    const die = () => {
      phase = 'over'
      if (score > hi) {
        hi = score
        localStorage.setItem('dino-hi', String(hi))
      }
      draw()
    }

    const reset = () => {
      dinoY = 0
      dinoVY = 0
      speed = 280
      distance = 0
      score = 0
      obstacles = []
      gapLeft = 500
      runTime = 0
    }

    const spawnCactus = () => {
      const sprite = CACTI[Math.random() < 0.6 ? 0 : 1]
      const w = Math.max(...sprite.map((r) => r.length)) * CELL
      obstacles.push({ x: W + 20, sprite, w, h: sprite.length * CELL })
      gapLeft = (320 + Math.random() * 380) * (speed / 280)
    }

    const update = (dt: number) => {
      runTime += dt
      speed = Math.min(280 + distance * 0.012, 640)
      distance += speed * dt
      score = Math.floor(distance / 22)

      // 跳跃物理
      if (dinoY > 0 || dinoVY !== 0) {
        dinoY += dinoVY * dt
        dinoVY -= 2100 * dt
        if (dinoY <= 0) {
          dinoY = 0
          dinoVY = 0
        }
      }

      // 障碍生成与移动
      gapLeft -= speed * dt
      if (gapLeft <= 0) spawnCactus()
      for (const ob of obstacles) ob.x -= speed * dt
      obstacles = obstacles.filter((ob) => ob.x + ob.w > -20)

      // 云与石子的视差滚动
      for (const cl of clouds) {
        cl.x -= speed * 0.22 * dt
        if (cl.x < -50) {
          cl.x = W + 30
          cl.y = 16 + Math.random() * 40
        }
      }
      pebbleOffset = (pebbleOffset + speed * dt) % 90

      // 碰撞（判定盒内缩，更宽容）
      const dl = DINO_X + 6
      const dr = DINO_X + DINO_W - 6
      const dt2 = GROUND_Y - DINO_H - dinoY + 4
      const db = GROUND_Y - dinoY
      for (const ob of obstacles) {
        const ol = ob.x + 3
        const or = ob.x + ob.w - 3
        const ot = GROUND_Y - ob.h + 2
        if (dr > ol && dl < or && db > ot && dt2 < GROUND_Y) {
          die()
          return
        }
      }
    }

    const loop = (t: number) => {
      const dt = Math.min((t - lastT) / 1000, 0.032)
      lastT = t
      update(dt)
      draw()
      if (phase === 'run') rafId = requestAnimationFrame(loop)
    }

    const start = () => {
      reset()
      phase = 'run'
      lastT = performance.now()
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(loop)
    }

    const action = () => {
      if (phase === 'run') {
        if (dinoY === 0) dinoVY = 560
      } else {
        start()
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
        e.preventDefault()
        action()
      }
    }
    const onPointerDown = () => {
      wrap.focus()
      action()
    }
    wrap.addEventListener('keydown', onKeyDown)
    wrap.addEventListener('pointerdown', onPointerDown)

    draw()

    return () => {
      wrap.removeEventListener('keydown', onKeyDown)
      wrap.removeEventListener('pointerdown', onPointerDown)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      role='button'
      aria-label='小恐龙跑酷游戏：按空格或点击跳跃'
      className='mt-6 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
    >
      <canvas ref={canvasRef} width={W} height={H} className='block w-full' />
    </div>
  )
}
