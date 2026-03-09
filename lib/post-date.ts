import { format } from 'date-fns'
import { formatDate } from 'notion-utils'

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
  const normalizedDate = DATE_ONLY_PATTERN.test(dateString)
    ? format(parsePostDate(dateString), 'yyyy-MM-dd')
    : dateString

  return formatDate(normalizedDate, {
    month: 'long'
  })
}

export function comparePostDatesDesc(leftDate: string, rightDate: string): number {
  return parsePostDate(rightDate).getTime() - parsePostDate(leftDate).getTime()
}
