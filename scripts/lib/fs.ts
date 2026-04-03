import { createWriteStream, existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { pipeline, Readable } from 'node:stream'
import { promisify } from 'node:util'
import zlib from 'node:zlib'

const pipelineAsync = promisify(pipeline)

export const DATA_DIR = new URL('../../data', import.meta.url).pathname

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

export function destPath(dir: string, key: string): string {
  const csvName = path.basename(key).replace(/\.gz$/, '')
  return path.join(DATA_DIR, dir, csvName)
}

export function fileExists(dest: string): boolean {
  return existsSync(dest)
}

export async function downloadAndDecompress(url: string, dest: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok || !res.body) {
    throw new Error(`Download failed: ${res.status} ${url}`)
  }
  const gunzip = zlib.createGunzip()
  const out = createWriteStream(dest)
  await pipelineAsync(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), gunzip, out)
}

/**
 * ディレクトリ内の CSV ファイルから最終取得月を検出する。
 * ファイル名形式: {name}_YYYYMM.csv
 * 見つからなければ null を返す。
 */
export function getLastDownloadedMonth(dir: string): string | null {
  const fullDir = path.join(DATA_DIR, dir)
  if (!existsSync(fullDir)) return null

  const files = readdirSync(fullDir).filter((f: string) => f.endsWith('.csv'))
  if (files.length === 0) return null

  // YYYYMM を抽出してソートし、最大値を取得
  const months = files
    .map((f: string) => f.match(/_(\d{6})\.csv$/)?.[1])
    .filter((m): m is string => m !== undefined)
    .sort()

  if (months.length === 0) return null

  const last = months[months.length - 1]!
  const year = last.slice(0, 4)
  const month = last.slice(4, 6)
  return `${year}-${month}`
}

/**
 * YYYY-MM 形式の月に1ヶ月加算して返す。
 */
export function nextMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-').map(Number) as [number, number]
  const date = new Date(y, m - 1 + 1, 1)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * 当月を YYYY-MM 形式で返す。
 */
export function currentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
