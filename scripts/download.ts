import path from 'node:path'
import { listFiles, getDownloadUrl, sleep, RATE_LIMIT_MS } from './lib/api.ts'
import { DATASETS } from './lib/datasets.ts'
import {
  DATA_DIR,
  ensureDir,
  destPath,
  fileExists,
  downloadAndDecompress,
  getLastDownloadedMonth,
  nextMonth,
  currentMonth,
} from './lib/fs.ts'

type Mode = 'full' | 'update'

type DatasetResult = {
  endpoint: string
  downloaded: string[]
  errors: string[]
}

function parseMode(): Mode {
  const arg = process.argv.find((a: string) => a.startsWith('--mode='))
  const value = arg?.split('=')[1]
  if (value === 'full' || value === 'update') return value
  console.error('Usage: --mode=full | --mode=update')
  return process.exit(1)
}

async function processDataset(
  endpoint: string,
  dir: string,
  from?: string,
  to?: string,
): Promise<DatasetResult> {
  const range = from ? `${from} 〜 ${to ?? ''}` : '全期間'
  console.log(`\n▶ ${endpoint}  (${range})`)

  const result: DatasetResult = { endpoint, downloaded: [], errors: [] }
  const fullDir = path.join(DATA_DIR, dir)
  ensureDir(fullDir)

  let keys: string[]
  try {
    keys = await listFiles(endpoint, from, to)
  } catch (err) {
    console.error(`  [ERROR] ファイル一覧取得失敗: ${err}`)
    result.errors.push(String(err))
    return result
  }

  if (keys.length === 0) {
    console.log('  ファイルなし')
    return result
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!
    const dest = destPath(dir, key)
    const name = path.basename(dest)

    if (fileExists(dest)) {
      console.log(`  [${i + 1}/${keys.length}] スキップ: ${name}`)
      continue
    }

    console.log(`  [${i + 1}/${keys.length}] ダウンロード: ${name}`)

    try {
      const url = await getDownloadUrl(key)
      await sleep(RATE_LIMIT_MS)
      await downloadAndDecompress(url, dest)
      result.downloaded.push(name)
    } catch (err) {
      console.error(`  [ERROR] ${name}: ${err}`)
      result.errors.push(name)
    }

    await sleep(RATE_LIMIT_MS)
  }

  return result
}

function printSummary(results: DatasetResult[]): void {
  const totalDownloaded = results.reduce((n, r) => n + r.downloaded.length, 0)
  const totalErrors = results.reduce((n, r) => n + r.errors.length, 0)

  console.log('\n=== サマリー ===')
  for (const r of results) {
    if (r.downloaded.length > 0) {
      const files = r.downloaded.map(f => f.replace(/\.csv$/, '').split('_').at(-1) ?? f)
      console.log(`  ✓ ${r.endpoint.padEnd(35)} +${r.downloaded.length} 件 (${files.join(', ')})`)
    } else if (r.errors.length > 0) {
      console.log(`  ✗ ${r.endpoint.padEnd(35)} エラー ${r.errors.length} 件`)
    } else {
      console.log(`  - ${r.endpoint.padEnd(35)} 新規なし`)
    }
  }
  console.log(`\n合計: ${totalDownloaded} 件ダウンロード${totalErrors > 0 ? ` / ${totalErrors} 件エラー` : ''}`)
}

async function main(): Promise<void> {
  const mode = parseMode()
  const toMonth = currentMonth()

  console.log(`=== jquants-data ダウンロード (mode: ${mode}, to: ${toMonth}) ===`)

  const results: DatasetResult[] = []

  for (const dataset of DATASETS) {
    if (mode === 'full') {
      // full モード: from/to 指定なし → サブスクリプション期間全体を API に委ねる
      results.push(await processDataset(dataset.endpoint, dataset.dir))
    } else {
      // update モード: 最終取得済み月の翌月 から ダウンロード
      const lastMonth = getLastDownloadedMonth(dataset.dir)
      const fromMonth = lastMonth ? nextMonth(lastMonth) : dataset.from

      // from > to の場合はスキップ（すべて最新）
      if (fromMonth > toMonth) {
        console.log(`\n▶ ${dataset.endpoint}  → 最新 (スキップ)`)
        results.push({ endpoint: dataset.endpoint, downloaded: [], errors: [] })
        continue
      }

      results.push(await processDataset(dataset.endpoint, dataset.dir, fromMonth, toMonth))
    }
  }

  printSummary(results)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
