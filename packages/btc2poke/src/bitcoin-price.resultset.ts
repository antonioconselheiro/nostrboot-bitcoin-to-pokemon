export interface BitcoinPriceResultset {
  readonly time: string,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly asset_id_base: 'BTC',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly asset_id_quote: 'USD' | 'XAUT',
  // USD format example: 27933.7491211105
  // XAUT format example: 20.618489926641793730922817107
  readonly rate: number
}
