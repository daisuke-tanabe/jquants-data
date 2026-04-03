export type Dataset = {
  endpoint: string
  dir: string
  from: string  // 初期ダウンロードの開始月 (YYYY-MM)
  to: string    // 初期ダウンロードの終了月 (YYYY-MM)
}

export const DATASETS: Dataset[] = [
  { endpoint: '/equities/bars/daily',       dir: 'equities_bars_daily',       from: '2016-01', to: '2025-12' },
  { endpoint: '/equities/bars/minute',      dir: 'equities_bars_minute',      from: '2024-01', to: '2025-12' },
  { endpoint: '/equities/trades',           dir: 'equities_trades',           from: '2024-01', to: '2025-12' },
  { endpoint: '/indices/bars/daily/topix',  dir: 'indices_bars_daily_topix',  from: '2016-01', to: '2025-12' },
  { endpoint: '/indices/bars/daily',        dir: 'indices_bars_daily',        from: '2016-01', to: '2025-12' },
  { endpoint: '/fins/summary',              dir: 'fins_summary',              from: '2016-01', to: '2025-12' },
  { endpoint: '/equities/investor-types',   dir: 'equities_investor_types',   from: '2016-01', to: '2025-12' },
  { endpoint: '/markets/margin-interest',   dir: 'markets_margin_interest',   from: '2016-01', to: '2025-12' },
  { endpoint: '/markets/short-ratio',       dir: 'markets_short_ratio',       from: '2016-01', to: '2025-12' },
  { endpoint: '/markets/short-sale-report', dir: 'markets_short_sale_report', from: '2016-01', to: '2025-12' },
  { endpoint: '/markets/margin-alert',      dir: 'markets_margin_alert',      from: '2016-01', to: '2025-12' },
  { endpoint: '/equities/master',           dir: 'equities_master',           from: '2016-01', to: '2025-12' },
]
