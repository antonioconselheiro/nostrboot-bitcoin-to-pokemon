import { exec } from 'child_process';
import { BitcoinPriceResultset } from './bitcoin-price.resultset';

export class BitcoinPriceService {

  static getInstance(): BitcoinPriceService {
    if (!this.instance) {
      this.instance = new BitcoinPriceService();
    }

    return this.instance;
  }

  private static instance: BitcoinPriceService | null = null;

  async getBitcoinPrice(to: 'USD' | 'XAUT'): Promise<BitcoinPriceResultset> {
    const api: {
      'USD': string;
      'XAUT': string;
    } = {
      ['USD']: 'https://api.coinpaprika.com/v1/price-converter?base_currency_id=btc-bitcoin&quote_currency_id=usd-us-dollars&amount=1',
      ['XAUT']: 'https://api.coinpaprika.com/v1/price-converter?base_currency_id=btc-bitcoin&quote_currency_id=xaut-tether-gold&amount=1'
    };

    const command = `curl --request GET --url '${api[to]}' --header 'Content-Type: application/json'`;
    console.log(`${command}`);
    return new Promise<BitcoinPriceResultset>(resolve => exec(command, (err, out) => {
      // eslint-disable-next-line no-unused-expressions
      err && console.error(err);

      try {
        console.info('response: ', out);
        const outParsed = JSON.parse(out);
        resolve(outParsed);
      } catch (e) {
        console.error('error on parsing response: ', e);
        console.error('response: ', out);
      }
    }));
  }
}