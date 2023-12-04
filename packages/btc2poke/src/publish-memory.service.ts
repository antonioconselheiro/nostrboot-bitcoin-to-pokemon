import * as fs from 'fs';
import { PostContentStatus } from './post-content-status.enum';
import { IRecentPublishedMemory } from './recent-published-memory.interface';

export class PublishMemoryService {
  static getInstance(): PublishMemoryService {
    if (!this.instance) {
      this.instance = new PublishMemoryService();
    }

    return this.instance;
  }

  private static instance: PublishMemoryService | null = null;

  private filename = process.env['APP_JSON_FILE_DATABASE'] || 'default.json';
  private memory: IRecentPublishedMemory = {
    dolar: [],
    gold: []
  };
  private constructor() {
    this.loadFile();
  }

  private loadFile(): void {
    const exists = fs.existsSync(this.filename);
    if (!exists) {
      fs.writeFileSync(this.filename, JSON.stringify(this.memory));
    } else {
      this.memory = JSON.parse(fs.readFileSync(this.filename).toString());
    }
  }

  register(pokeid: number | null, asset: 'dolar' | 'gold'): void {
    this.memory[asset].shift();
    if (pokeid) {
      this.memory[asset].push(pokeid);
    }
    fs.writeFileSync(this.filename, JSON.stringify(this.memory));
  }

  getStatus(pokeid: number | null, asset: 'dolar' | 'gold'): PostContentStatus {
    const lastPublishIndex = this.memory[asset].length - 1;
    if (!this.memory[asset].length) {
      return PostContentStatus.NOT_PUBLISHED_RECENTLY;
    } else if (this.memory[asset][lastPublishIndex] === pokeid) {
      return PostContentStatus.LAST_POST;
    } else if (this.memory[asset][0] === pokeid) {
      return PostContentStatus.RECENT_POST;
    }

    return PostContentStatus.NOT_PUBLISHED_RECENTLY;
  }

  hasAscended(newPokeId: number, asset: 'dolar' | 'gold'): boolean | null {
    const lastPublishIndex = this.memory[asset].length - 1;
    const lastValue = this.memory[asset][lastPublishIndex];
    if (lastValue === null) {
      return null;
    }

    if (lastValue < newPokeId) {
      return true;
    }

    return false;
  }
}
