/*****************************************************************************
 * ALREADYREPLIEDSTORE.JS - In charge of storing tweet IDs we have replied to.
 * We want minimal stubs for everything not doing IO, but since this is IO,
 * we do a real implementation. 
 *****************************************************************************/

import fs from 'fs';
import path from 'path';

const PERSIST_FILE = path.join(process.cwd(), 'persisted_replies.json');

class AlreadyRepliedStore {
  constructor() {
    this._ids = new Set();
    this._load();
  }

  has(tweetId) {
    return this._ids.has(tweetId);
  }

  add(tweetId) {
    this._ids.add(tweetId);
  }

  persist() {
    fs.writeFileSync(PERSIST_FILE, JSON.stringify([...this._ids], null, 2), 'utf8');
  }

  _load() {
    if (fs.existsSync(PERSIST_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(PERSIST_FILE, 'utf8'));
        this._ids = new Set(data);
      } catch (err) {
        console.warn('[ALREADYREPLIEDSTORE] Could not parse persisted_replies.json. Starting fresh.');
        this._ids = new Set();
      }
    }
  }
}

// Export a singleton
export const alreadyRepliedStore = new AlreadyRepliedStore();