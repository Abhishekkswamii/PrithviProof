import { loadFromStorage, saveToStorage } from "@/lib/safe-storage";

import {
  PersistedAppDataSchema,
  type DataRepository,
  type PersistedAppData,
  type UserProfile,
} from "./types";

const StorageSchema = PersistedAppDataSchema;

export class LocalDataRepository implements DataRepository {
  async load(uid: string): Promise<PersistedAppData | null> {
    void uid;
    return loadFromStorage(StorageSchema);
  }

  async save(uid: string, data: PersistedAppData): Promise<void> {
    void uid;
    saveToStorage(data);
  }

  async loadProfile(uid: string): Promise<UserProfile | null> {
    void uid;
    return null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    void profile;
    // Local-only mode does not persist profiles
  }

}


