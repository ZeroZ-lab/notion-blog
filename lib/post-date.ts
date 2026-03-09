import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function parsePostDate(dateString: string): Date {
  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(dateString)

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch

    // Pin date-only strings to UTC noon so the calendar date stays stable.
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12))
  }

  const parsedDate = new Date(dateString)

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date(Date.UTC(1970, 0, 1, 12))
  }

  return parsedDate
}

export function formatPostDate(dateString: string): string {
  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(dateString)

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    return `${year}年${Number(month)}月${Number(day)}日`
  }

  return format(parsePostDate(dateString), 'yyyy年M月d日')
}

export function formatRelativePostDate(dateString: string): string {
  return formatDistanceToNow(parsePostDate(dateString), {
    addSuffix: true,
    locale: zhCN
  })
}

export function formatPostDateWithRelative(dateString: string): string {
  return `${formatPostDate(dateString)} · ${formatRelativePostDate(dateString)}`
}

export function comparePostDatesDesc(leftDate: string, rightDate: string): number {
  return parsePostDate(rightDate).getTime() - parsePostDate(leftDate).getTime()
}
