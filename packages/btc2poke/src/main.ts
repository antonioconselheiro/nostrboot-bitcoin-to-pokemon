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
      schedule.scheduleJob(time, () => this.run(nostrBoot).catch(e => console.error(e)));
    });
  }

  async run(nostrBoot: NostrBoot): Promise<void> {
    console.info('bitcoin price checking...');
    const bitcoinPrice = await this.bitcoinPriceService.getBitcoinUSDPrice();
    console.info('bitcoin price: ', bitcoinPrice);
    const pokemon = this.bitcoinToPokemonService.convert(bitcoinPrice);
    const status = this.publishMemoryService.getStatus(pokemon.id);
    let message = '';

    if (status === PostContentStatus.NOT_PUBLISHED_RECENTLY) {
      message = this.generateMessage(pokemon, bitcoinPrice);
    } else if (status === PostContentStatus.RECENT_POST) {
      message = this.generateMessage(pokemon, bitcoinPrice, true);
    } else if (status === PostContentStatus.LAST_POST) {
      console.info('already posted this, ignoring...', pokemon);
    }

    if (message) {
      this.publishMemoryService.register(pokemon.id);
      console.info(message);
      nostrBoot.publish(message);
    }

    return Promise.resolve();
  }

  private generateMessage(
    pokemon: PokemonResultset,
    bitcoinPrice: BitcoinPriceResultset,
    hasRecentlyPosted = false
  ): string {
    const thousand = 1000;
    const formattedValue = this.formateBtcValue(bitcoinPrice);
    let message = '';
    
    //Qual a cotação do bitcoin em pokémons, considerando somente os digitos dos milhares, na cotação do dólar
    if (pokemon.id) {
      const ascended = this.publishMemoryService.hasAscended(pokemon.id);
      if (ascended === true) {
        message = 'Bitcoin value went up. ';
      } else if (ascended === false) {
        message = 'Bitcoin value decreased. ';
      }

      message += `The current price is ${formattedValue}, the pokémon #${pokemon.id} is ${pokemon.name} ${hasRecentlyPosted ? 'again ': ' '}(${pokemon.types.join(', ')}) #bitcoin #pokemon #zap https://nostr.build/${pokemon.img}`;
    } else {
      if (bitcoinPrice.rate < thousand) {
        message += 'It was an honor to break together ladies and gentlemen. ';
      } else {
        message += 'Well, it seems to me that Bitcoin rose faster than nintendo was able to launch pokemons. '
      }

      message += `The current price is ${formattedValue}, the pokémon is ${pokemon.name} (${pokemon.types.join(', ')}) #bitcoin #pokemon #zap https://nostr.build/${pokemon.img}`;
    }

    return message;
  }

  formateBtcValue(bitcoinPrice: BitcoinPriceResultset): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: bitcoinPrice.asset_id_quote,
  }).format(bitcoinPrice.rate);
  }
}

new main();
