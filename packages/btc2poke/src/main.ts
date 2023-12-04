import { BitcoinPriceService } from './bitcoin-price.service';
import { BitcoinToPokemonService } from './bitcoin-to-pokemon.service';
import { NostrBoot } from './nostr-boot';
import { PublishMemoryService } from './publish-memory.service';
import * as schedule from 'node-schedule';
import { BitcoinPriceResultset } from './bitcoin-price.resultset';
import { PokemonResultset } from './pokemon.resultset';
import { PostContentStatus } from './post-content-status.enum';

// o nostr-tools usa o objeto global WebSocket, que não existe no nodejs
Object.assign(global, { WebSocket: require('ws') });

class main {
  private readonly bitcoinPriceService = BitcoinPriceService.getInstance();
  private readonly bitcoinToPokemonService = BitcoinToPokemonService.getInstance();
  private readonly publishMemoryService = PublishMemoryService.getInstance();
  private readonly scheduleTimes = [
    '00 5 * * *', '00 6 * * *', '00 7 * * *', '00 8 * * *', '00 9 * * *', '00 10 * * *',
    '00 11 * * *', '00 12 * * *', '00 13 * * *', '00 14 * * *', '00 15 * * *', '00 16 * * *',
    '00 17 * * *', '00 18 * * *', '00 19 * * *', '00 20 * * *', '08 21 * * *', '00 22 * * *',
    '00 23 * * *', '00 00 * * *', '00 01 * * *', '00 02 * * *', '00 03 * * *', '00 04 * * *'
  ];

  constructor() {
    this.start();
  }

  start(): void {
    const nostrBoot = new NostrBoot();

    this.scheduleTimes.forEach(time => {
      console.info('scheduling', time);
      schedule.scheduleJob(time, () => {
        this.checkDolar(nostrBoot).catch(e => console.error(e));
        this.checkGold(nostrBoot).catch(e => console.error(e));
      });
    });
  }

  async checkGold(nostrBoot: NostrBoot): Promise<void> {
    console.info('bitcoin price checking in gold...');
    const bitcoinPrice = await this.bitcoinPriceService.getBitcoinPrice('XAUT');
    console.info('bitcoin price: ', bitcoinPrice);
    const pokemon = this.bitcoinToPokemonService.convertFromGold(bitcoinPrice);
    const status = this.publishMemoryService.getStatus(pokemon.id, 'gold');
    let message = '';

    if (status === PostContentStatus.NOT_PUBLISHED_RECENTLY) {
      message = this.generateDolarMessage(pokemon, bitcoinPrice);
    } else if (status === PostContentStatus.RECENT_POST) {
      message = this.generateDolarMessage(pokemon, bitcoinPrice, true);
    } else if (status === PostContentStatus.LAST_POST) {
      console.info('already posted this, ignoring...', pokemon);
    }

    if (message) {
      this.publishMemoryService.register(pokemon.id, 'gold');
      console.info(message);
      nostrBoot.publish(message);
    }

    return Promise.resolve();
  }

  async checkDolar(nostrBoot: NostrBoot): Promise<void> {
    console.info('bitcoin price checking in usd...');
    const bitcoinPrice = await this.bitcoinPriceService.getBitcoinPrice('USD');
    console.info('bitcoin price: ', bitcoinPrice);
    const pokemon = this.bitcoinToPokemonService.convertFromDolar(bitcoinPrice);
    const status = this.publishMemoryService.getStatus(pokemon.id, 'dolar');
    let message = '';

    if (status === PostContentStatus.NOT_PUBLISHED_RECENTLY) {
      message = this.generateDolarMessage(pokemon, bitcoinPrice);
    } else if (status === PostContentStatus.RECENT_POST) {
      message = this.generateDolarMessage(pokemon, bitcoinPrice, true);
    } else if (status === PostContentStatus.LAST_POST) {
      console.info('already posted this, ignoring...', pokemon);
    }

    if (message) {
      this.publishMemoryService.register(pokemon.id, 'dolar');
      console.info(message);
      nostrBoot.publish(message);
    }

    return Promise.resolve();
  }

  private generateGoldMessage(
    pokemon: PokemonResultset,
    bitcoinPrice: BitcoinPriceResultset,
    hasRecentlyPosted = false
  ): string {
    const hundred = 100;
    const formattedValue = Math.floor(bitcoinPrice.rate * hundred) / hundred;
    let message = '';
    
    if (pokemon.id) {
      const ascended = this.publishMemoryService.hasAscended(pokemon.id, 'gold');
      if (ascended === true) {
        message = 'Bitcoin has INCREASED in GOLD. ';
      } else if (ascended === false) {
        message = 'Bitcoin has DECREASED in GOLD. ';
      }

      message += `The current price is ${formattedValue} troy ounce, the pokémon #${pokemon.id} is ${pokemon.name} ${hasRecentlyPosted ? 'again ': ' '}(${pokemon.types.join(', ')}) #bitcoin #pokemon #zap https://nostr.build/${pokemon.img}`;
    } else {
      if (bitcoinPrice.rate < 1) {
        message += 'It was an honor to break together ladies and gentlemen. ';
      } else {
        message += 'Well, Bitcoin grow faster than Nintendo was able to launch pokémons. '
      }

      message += `The current price is ${formattedValue}, the pokémon is ${pokemon.name} (${pokemon.types.join(', ')}) #bitcoin #pokemon #zap https://nostr.build/${pokemon.img}`;
    }

    return message;
  }

  private generateDolarMessage(
    pokemon: PokemonResultset,
    bitcoinPrice: BitcoinPriceResultset,
    hasRecentlyPosted = false
  ): string {
    const thousand = 1000;
    const formattedValue = this.formatBtcValueInDolar(bitcoinPrice);
    let message = '';
    
    if (pokemon.id) {
      const ascended = this.publishMemoryService.hasAscended(pokemon.id, 'dolar');
      if (ascended === true) {
        message = 'Bitcoin has INCREASED in DOLLAR. ';
      } else if (ascended === false) {
        message = 'Bitcoin has DECREASED in DOLLAR. ';
      }

      message += `The current price is ${formattedValue}, the pokémon #${pokemon.id} is ${pokemon.name} ${hasRecentlyPosted ? 'again ': ' '}(${pokemon.types.join(', ')}) #bitcoin #pokemon #zap https://nostr.build/${pokemon.img}`;
    } else {
      if (bitcoinPrice.rate < thousand) {
        message += 'It was an honor to break together ladies and gentlemen. ';
      } else {
        message += 'Well, Bitcoin grow faster than Nintendo was able to launch pokémons. '
      }

      message += `The current price is ${formattedValue}, the pokémon is ${pokemon.name} (${pokemon.types.join(', ')}) #bitcoin #pokemon #zap https://nostr.build/${pokemon.img}`;
    }

    return message;
  }

  formatBtcValueInDolar(bitcoinPrice: BitcoinPriceResultset): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: bitcoinPrice.asset_id_quote,
    }).format(bitcoinPrice.rate);
  }
}

new main();
