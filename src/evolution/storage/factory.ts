import { OfflineStorage } from "./offline";
import { OnlineStorage } from "./online";

export class StorageFactory {
  constructor(private _mode: 'online' | 'offline' = 'offline') { }

  build() {
    switch (this._mode) {
      case 'online':
        return new OnlineStorage();

      case 'offline':
        let offlineStorage = new OfflineStorage();
        setInterval(() => {
          offlineStorage.reduce();
        }, 1000);
        return offlineStorage;
    }

  }
}
