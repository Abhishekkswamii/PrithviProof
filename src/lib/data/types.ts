import { z } from "zod";
import { Activity, LedgerRecord, Recommendation, UserConstraints } from "@/domain/models";

export const SCHEMA_VERSION = 1;


export const UserProfileSchema = z.object({
  uid: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  photoURL: z.string().nullable().optional(),
  provider: z.enum(["password", "google"]),
  onboardingCompleted: z.boolean(),
  schemaVersion: z.number().int(),
  migrationVersion: z.number().int().optional(),
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const AppStateDocumentSchema = z.object({
  constraints: UserConstraints,
  answeredQuestionIds: z.array(z.string()),
  recommendations: z.array(Recommendation),
  schemaVersion: z.number().int(),
  migrationVersion: z.number().int().optional(),
  updatedAt: z.unknown().optional(),
});
export type AppStateDocument = z.infer<typeof AppStateDocumentSchema>;

export const PersistedAppDataSchema = z.object({
  activities: z.array(Activity),
  constraints: UserConstraints,
  ledger: z.array(LedgerRecord),
  recommendations: z.array(Recommendation),
  answeredQuestionIds: z.array(z.string()),
});
export type PersistedAppData = z.infer<typeof PersistedAppDataSchema>;

export interface DataRepository {
  load(uid: string): Promise<PersistedAppData | null>;
  save(uid: string, data: PersistedAppData): Promise<void>;
  loadProfile(uid: string): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
}
