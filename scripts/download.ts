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
  from: string,
  to: string,
): Promise<void> {
  console.log(`\n▶ ${endpoint}  (${from} 〜 ${to})`)

  const fullDir = path.join(DATA_DIR, dir)
  ensureDir(fullDir)

  let keys: string[]
  try {
    keys = await listFiles(endpoint, from, to)
  } catch (err) {
    console.error(`  [ERROR] ファイル一覧取得失敗: ${err}`)
    return
  }

  if (keys.length === 0) {
    console.log('  ファイルなし')
    return
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!
    const dest = destPath(dir, key)

    if (fileExists(dest)) {
      console.log(`  [${i + 1}/${keys.length}] スキップ: ${path.basename(dest)}`)
      continue
    }

    console.log(`  [${i + 1}/${keys.length}] ダウンロード: ${path.basename(dest)}`)

    try {
      const url = await getDownloadUrl(key)
      await sleep(RATE_LIMIT_MS)
      await downloadAndDecompress(url, dest)
    } catch (err) {
      console.error(`  [ERROR] ${path.basename(dest)}: ${err}`)
    }

    await sleep(RATE_LIMIT_MS)
  }
}

async function main(): Promise<void> {
  const mode = parseMode()
  const toMonth = currentMonth()

  console.log(`=== jquants-data ダウンロード (mode: ${mode}, to: ${toMonth}) ===`)

  for (const dataset of DATASETS) {
    let fromMonth: string

    if (mode === 'full') {
      fromMonth = dataset.from
    } else {
      // update モード: 最終取得済み月の翌月 から ダウンロード
      const lastMonth = getLastDownloadedMonth(dataset.dir)
      fromMonth = lastMonth ? nextMonth(lastMonth) : dataset.from
    }

    // from > to の場合はスキップ（すべて最新）
    if (fromMonth > toMonth) {
      console.log(`\n▶ ${dataset.endpoint}  → 最新 (スキップ)`)
      continue
    }

    await processDataset(dataset.endpoint, dataset.dir, fromMonth, toMonth)
  }

  console.log('\n=== 完了 ===')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
