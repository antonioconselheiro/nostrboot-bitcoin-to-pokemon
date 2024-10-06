import { Event, getEventHash, getSignature, nip19, Relay, relayInit, UnsignedEvent, validateEvent, verifySignature } from 'nostr-tools';
import { NostrUser } from './nostr-user';
import { exec } from 'child_process';

export class RelaysService {

  private connectionReady: Promise<void>;
  private relays: Relay[] = [];

  constructor(private relayUrlList: string[]) {
    this.connectionReady = this.connect();
  }

  async publish(user: NostrUser, message: string): Promise<void> {
    const event = this.createEvent(user, message);
    const ok = validateEvent(event);
    const veryOk = verifySignature(event);
    console.info(`event created: ${JSON.stringify(event)}, validate: ${ok}, signature: ${veryOk}`);

    if (!ok || !veryOk) {
      console.error('event is not valid... aborting...');
      return;
    }

    const command = `echo '${JSON.stringify(event)}' | torsocks nak event ${this.relayUrlList.join(' ')}`;
    console.log(`${command}`);
    await new Promise<void>(resolve => exec(command, err => {
      // eslint-disable-next-line no-unused-expressions
      err && console.error(err);
      resolve();
    } ))

    const publishKey = nip19.noteEncode(event.id);
    console.info(`published: https://primal.net/e/${publishKey}`);
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
      kind: 1,
      pubkey: user.publicKeyHex,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      created_at: this.getCurrentTimestamp(),
      tags: Array.from(message.match(/#[^\s]+\w/g) || [])
      .map(hashtag => ['t', hashtag.replace(/^#/, '')]),
      content: message
    };

    const event: Event = unsignedEvent as Event;

    event.id = getEventHash(unsignedEvent);
    event.sig = getSignature(event, user.privateKeyHex);

    return event;
  }

  private getCurrentTimestamp(): number {
    const oneMillisecond = 1000;
    return Math.floor(Date.now() / oneMillisecond);
  }
}


