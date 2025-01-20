import { exec } from 'child_process';
import { Event, getEventHash, getSignature, nip19, UnsignedEvent, validateEvent, verifySignature } from 'nostr-tools';
import { NostrUser } from './nostr-user';

export class RelaysService {

  constructor(
    private relayUrlList: string[]
  ) { }

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
    }));

    const publishKey = nip19.noteEncode(event.id);
    console.info(`published: https://primal.net/e/${publishKey}`);
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


