import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encodeImagePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

// 新粗野主义贴纸配色：按字符串哈希稳定取色（同一分类颜色固定）
const BRUTAL_ACCENTS = [
  '#3b82f6',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#ec4899',
  '#a855f7'
] as const

export function brutalAccent(key: string): { bg: string; fg: string } {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + (key.codePointAt(i) ?? 0)) >>> 0
  }
  const bg = BRUTAL_ACCENTS[hash % BRUTAL_ACCENTS.length]
  return { bg, fg: bg === '#facc15' ? '#000000' : '#ffffff' }
}
