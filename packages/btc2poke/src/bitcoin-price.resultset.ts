/* eslint-disable @typescript-eslint/naming-convention */
export interface BitcoinPriceResultset {

  // USD format example: 106560.79499500302
  // XAUT format example: 39.668638671182094
  readonly price: number;

  readonly base_currency_id: "btc-bitcoin";
  readonly quote_currency_id: "usd-us-dollars" | "xaut-tether-gold";
  readonly quote_price_last_updated: string;
}
