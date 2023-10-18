export interface BitcoinPriceResultset {
  readonly time: string,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly asset_id_base: 'BTC',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly asset_id_quote: 'USD',
  // format example: 27933.7491211105
  readonly rate: number
}
