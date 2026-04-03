const BASE_URL = 'https://api.jquants.com/v2'

function apiKey(): string {
  const key = process.env['JQUANTS_API_KEY']
  if (!key) throw new Error('JQUANTS_API_KEY is not set')
  return key
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function listFiles(endpoint: string, from: string, to: string): Promise<string[]> {
  const params = new URLSearchParams({ endpoint, from, to })
  const res = await fetch(`${BASE_URL}/bulk/list?${params}`, {
    headers: { 'x-api-key': apiKey() },
  })
  if (!res.ok) {
    throw new Error(`listFiles failed: ${res.status} ${await res.text()}`)
  }
  const json = await res.json() as { data: { Key: string }[] }
  return json.data.map(f => f.Key)
}

export async function getDownloadUrl(key: string): Promise<string> {
  const params = new URLSearchParams({ key })
  const res = await fetch(`${BASE_URL}/bulk/get?${params}`, {
    headers: { 'x-api-key': apiKey() },
  })
  if (!res.ok) {
    throw new Error(`getDownloadUrl failed: ${res.status} ${await res.text()}`)
  }
  const json = await res.json() as { url: string }
  return json.url
}

// レート制限: 100 req/min → 600ms ウェイト
export const RATE_LIMIT_MS = 600

export { sleep }
