import { Event, getEventHash, Kind, Relay, relayInit, signEvent, UnsignedEvent, validateEvent, verifySignature } from 'nostr-tools';
import { NostrUser } from './nostr-user';

export class RelaysService {

  private connectionReady: Promise<void>;
  private relays: Relay[] = [];

  constructor(private relayUrlList: string[]) {
    this.connectionReady = this.connect();
  }

  publish(user: NostrUser, message: string): void {
    const event = this.createEvent(user, message);
    const ok = validateEvent(event);
    const veryOk = verifySignature(event);
    console.info(`event created: ${JSON.stringify(event)}, validate: ${ok}, signatura: ${veryOk}`);

    if (!ok || !veryOk) {
      console.error('event is not valid... aborting...');
      return;
    }

    this.connectionReady.finally(() => {
      this.relays.forEach(relay => {
        const subscription = relay.publish(event);
        subscription.on('ok', () => {
          console.log(`${relay.url} has accepted our event`);
        });

        subscription.on('failed', (reason: unknown) => {
          console.error(`failed to publish to ${relay.url}: ${reason}`);
        });
      });
    });
  }

  private connect(): Promise<void> {
    const promises = this.relayUrlList.map(relayAddress => this.launchRelay(relayAddress));
    this.connectionReady = Promise.all(promises).then(() => Promise.resolve());
    return this.connectionReady;
  }

  private async launchRelay(relayAddress: string): Promise<void> {
    console.info(`init relay: ${relayAddress}`);
    const relay = relayInit(relayAddress);
    relay.on('connect', () => {
      console.log(`connected to ${relay.url}`)
    });

    relay.on('error', () => {
      console.error(`failed to connect to ${relay.url}`)
    });

    try {
      await relay.connect();
    } catch {
      //  if it does not connect I just ignore and continue
      return Promise.resolve();
    }

    this.relays.push(relay);
    return Promise.resolve();
  }

  private createEvent(user: NostrUser, message: string): Event {
    const unsignedEvent: UnsignedEvent = {
      kind: Kind.Text,
      pubkey: user.publicKeyHex,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      created_at: this.getCurrentTimestamp(),
      tags: [],
      content: message
    }
    const id = getEventHash(unsignedEvent)
    const sig = signEvent(unsignedEvent, user.privateKeyHex)

    return { id, sig, ...unsignedEvent };
  }

  private getCurrentTimestamp(): number {
    const oneMillisecond = 1000;
    return Math.floor(Date.now() / oneMillisecond);
  }
}


