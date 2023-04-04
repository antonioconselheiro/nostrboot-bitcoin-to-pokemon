import { getPublicKey, nip19 } from 'nostr-tools';

export class NostrUser {

  readonly privateKeyHex: string;
  readonly publicKeyHex: string;
  readonly nostrPublic: string;
  
  constructor(public readonly privateNostrSecret: string) {
    const { data } = nip19.decode(privateNostrSecret);
    this.privateKeyHex = data.toString();
    this.publicKeyHex = getPublicKey(this.privateKeyHex);
    this.nostrPublic = nip19.npubEncode(this.publicKeyHex);

    if (this.nostrPublic) {
      console.log(`connected with https://primal.net/profile/${this.nostrPublic}`);
    }
  }
}