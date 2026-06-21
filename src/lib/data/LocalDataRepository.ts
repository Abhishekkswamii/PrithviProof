import { z } from "zod";
import { loadFromStorage, saveToStorage } from "@/lib/safe-storage";

import {
  AppStateDocumentSchema,
  PersistedAppDataSchema,
  SCHEMA_VERSION,
  type DataRepository,
  type PersistedAppData,
  type UserProfile,
  UserProfileSchema,
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

export function getDefaultAppData(): PersistedAppData {
  return {
    activities: [],
    constraints: {
      budgetAvailable: 50000,
      transportModes: [],
      housingType: "apartment",
      ownership: "rent",
      hasCar: false,
    },
    ledger: [],
    recommendations: [],
    answeredQuestionIds: [],
  };
}

export function parseAppStateDocument(raw: unknown): z.infer<typeof AppStateDocumentSchema> | null {
  const result = AppStateDocumentSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export { SCHEMA_VERSION, PersistedAppDataSchema, UserProfileSchema };
