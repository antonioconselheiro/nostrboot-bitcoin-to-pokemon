import { NostrUser } from './nostr-user';
import { RelaysService } from './relays.service';
import * as fs from 'fs';
import { nip19 } from 'nostr-tools';

export class NostrBoot {
  private readonly NOSTR_PRIVATE_NSEC_FILE = process.env['NOSTR_PRIVATE_NSEC_FILE'] || '';
  private readonly NOSTR_RELAYS = process.env['NOSTR_RELAYS'] || '';
  private nsec = '';
  private relayUrlList: string[] = [];

  constructor() {
    this.loadNSecFile();
    this.loadRelaysUrl();
  }

  private loadNSecFile(): void {
    const exists = fs.existsSync(this.NOSTR_PRIVATE_NSEC_FILE);
    const hexEncodeLength = 64;
    if (!exists) {
      throw new Error('nsec file does not exists, check your secrets file on docker-compose.yml');
    }

    this.nsec = fs.readFileSync(this.NOSTR_PRIVATE_NSEC_FILE).toString();
    const {type, data} = nip19.decode(this.nsec);

    if (type !== 'nsec') {
      throw new Error('invalid nsec given on secret file');
    }

    if (data.toString().length !== hexEncodeLength) {
      throw new Error('invalid nsec given on secret file');
    }
  }

  private loadRelaysUrl(): void {
    const validRelaysEnv = /^(wss:\/\/[^;]+)(;wss:\/\/[^;]+)*$/;
    const isValid = validRelaysEnv.test(this.NOSTR_RELAYS);

    if (!isValid) {
      throw new Error('invalid relays env, you must use ; as separator');
    }

    this.relayUrlList = this.NOSTR_RELAYS.split(';');
  }

  publish(message: string): void {
    const user = new NostrUser(this.nsec);
    const relays = new RelaysService(this.relayUrlList);
    //  como eu sei se ele já executou todas tentativas de emissão
    //  do evento para que eu possa desconectar os relays?
    relays.publish(user, message);
  }
}
