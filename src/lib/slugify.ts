import slugifyLib from 'slugify'
import { nanoid } from 'nanoid'

export function slugify(str: string): string {
  return slugifyLib(str, { lower: true, strict: true, locale: 'fr' })
}

export function uniqueSlug(str: string): string {
  return `${slugify(str)}-${nanoid(6)}`
}

export function certNumber(churchPrefix = 'CMD'): string {
  const year = new Date().getFullYear()
  const rand = String(Math.floor(Math.random() * 9000) + 1000)
  return `${churchPrefix}-${year}-${rand}`
}
