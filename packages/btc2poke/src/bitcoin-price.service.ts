import axios from 'axios';
import * as fs from 'fs';
import { BitcoinPriceResultset } from './bitcoin-price.resultset';

export class BitcoinPriceService {

  private readonly COINAPI_PRIVATE_KEY_FILE = process.env['COINAPI_PRIVATE_KEY_FILE'] || '';
  private coinApiSecret: string;

  static getInstance(): BitcoinPriceService {
    if (!this.instance) {
      this.instance = new BitcoinPriceService();
    }

    return this.instance;
  }

  private static instance: BitcoinPriceService | null = null;
  private constructor() {
    this.coinApiSecret = this.readCoinApiSecret();
  }

  async getBitcoinPrice(to: 'USD' | 'XAUT'): Promise<BitcoinPriceResultset> {
    return axios({
      method: 'GET',
      baseURL: process.env['COINAPI_BASE_URL'],
      url: `/v1/exchangerate/BTC/${to}/`,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'X-CoinAPI-Key': this.coinApiSecret
      },
      params: {
        time: new Date().toISOString()
      }
    }).then(response => response.data);
  }

  private readCoinApiSecret(): string {
    const exists = fs.existsSync(this.COINAPI_PRIVATE_KEY_FILE);
    if (!exists) {
      throw new Error('coinapi file does not exists, check your secrets file on docker-compose.yml');
    }

    return fs.readFileSync(this.COINAPI_PRIVATE_KEY_FILE).toString();
  }
}