import { BitcoinPriceResultset } from './bitcoin-price.resultset';
import * as pokelist from './pokelist.json';
import { PokemonResultset } from './pokemon.resultset';

export class BitcoinToPokemonService {

  private readonly missigno: PokemonResultset = {
    id: null,
    name: 'Missingno',
    types: ['Out of Range Exception'],
    img: 'i/nostr.build_5c7ec7bfa80f772e300198d6202d59ff819b91066366521ea90fe49d8a7efacc.gif'
  };

  static getInstance(): BitcoinToPokemonService {
    if (!this.instance) {
      this.instance = new BitcoinToPokemonService();
    }

    return this.instance;
  }

  private static instance: BitcoinToPokemonService | null = null;

  convert(bitcoinPrice: BitcoinPriceResultset): PokemonResultset {
    const baseThousand = 1000;
    const pokenumber = Math.floor(bitcoinPrice.rate / baseThousand);
    const pokeindex = String(pokenumber) as keyof typeof pokelist;
    if (pokelist[pokeindex]) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return { id: Number(pokeindex), ...pokelist[pokeindex] } as PokemonResultset;
    } else {
      return this.missigno;
    }

  }
}