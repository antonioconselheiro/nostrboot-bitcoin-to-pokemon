import * as fs from 'fs';
import { PostContentStatus } from './post-content-status.enum';

export class PublishMemoryService {
  static getInstance(): PublishMemoryService {
    if (!this.instance) {
      this.instance = new PublishMemoryService();
    }

    return this.instance;
  }

  private static instance: PublishMemoryService | null = null;

  private filename = process.env['APP_JSON_FILE_DATABASE'] || 'default.json';
  private memory: (number | null)[] = [];
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

  register(pokeid: number | null): void {
    this.memory.shift();
    this.memory.push(pokeid);
    fs.writeFileSync(this.filename, JSON.stringify(this.memory));
  }

  getStatus(pokeid: number | null): PostContentStatus {
    const lastPublishIndex = this.memory.length - 1;
    if (!this.memory.length) {
      return PostContentStatus.NOT_PUBLISHED_RECENTLY;
    } else if (this.memory[lastPublishIndex] === pokeid) {
      return PostContentStatus.LAST_POST;
    } else if (this.memory[0] === pokeid) {
      return PostContentStatus.RECENT_POST;
    }

    return PostContentStatus.NOT_PUBLISHED_RECENTLY;
  }

  hasAscended(newPokeId: number): boolean | null {
    const lastPublishIndex = this.memory.length - 1;
    const lastValue = this.memory[lastPublishIndex];
    if (lastValue === null) {
      return null;
    }

    if (lastValue < newPokeId) {
      return true;
    }

    return false;
  }
}
