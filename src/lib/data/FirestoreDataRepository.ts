import { z } from "zod";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  setDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import { Activity, LedgerRecord } from "@/domain/models";

import {
  AppStateDocumentSchema,
  PersistedAppDataSchema,
  SCHEMA_VERSION,
  type DataRepository,
  type PersistedAppData,
  type UserProfile,
  UserProfileSchema,
} from "./types";

export class FirestoreDataRepository implements DataRepository {
  private db() {
    const db = getFirestoreDb();
    if (!db) throw new Error("Firestore is not configured");
    return db;
  }

  private userRef(uid: string) {
    return doc(this.db(), "users", uid);
  }

  private stateRef(uid: string) {
    return doc(this.db(), "users", uid, "state", "current");
  }

  async loadProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(this.userRef(uid));
    if (!snap.exists()) return null;
    const parsed = UserProfileSchema.safeParse(snap.data());
    return parsed.success ? parsed.data : null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const ref = this.userRef(profile.uid);
    await setDoc(
      ref,
      {
        ...profile,
        schemaVersion: SCHEMA_VERSION,
        updatedAt: serverTimestamp(),
        createdAt: profile.createdAt ?? serverTimestamp(),
      },
      { merge: true }
    );
  }

  async load(uid: string): Promise<PersistedAppData | null> {
    const stateSnap = await getDoc(this.stateRef(uid));
    if (!stateSnap.exists()) return null;

    const stateParsed = AppStateDocumentSchema.safeParse(stateSnap.data());
    if (!stateParsed.success) return null;

    const activitiesSnap = await getDocs(
      query(collection(this.db(), "users", uid, "activities"), orderBy("updatedAt", "desc"), limit(500))
    );
    const ledgerSnap = await getDocs(
      query(collection(this.db(), "users", uid, "ledger"), orderBy("updatedAt", "desc"), limit(200))
    );

    const activities: z.infer<typeof Activity>[] = [];
    for (const d of activitiesSnap.docs) {
      const p = Activity.safeParse({ id: d.id, ...d.data() });
      if (p.success) activities.push(p.data);
    }

    const ledger: z.infer<typeof LedgerRecord>[] = [];
    for (const d of ledgerSnap.docs) {
      const p = LedgerRecord.safeParse({ id: d.id, ...d.data() });
      if (p.success) ledger.push(p.data);
    }

    const data: PersistedAppData = {
      activities,
      constraints: stateParsed.data.constraints,
      ledger,
      recommendations: stateParsed.data.recommendations,
      answeredQuestionIds: stateParsed.data.answeredQuestionIds,
    };

    const validated = PersistedAppDataSchema.safeParse(data);
    return validated.success ? validated.data : null;
  }

  async save(uid: string, data: PersistedAppData): Promise<void> {
    const validated = PersistedAppDataSchema.parse(data);
    const batch = writeBatch(this.db());

    batch.set(
      this.stateRef(uid),
      {
        constraints: validated.constraints,
        answeredQuestionIds: validated.answeredQuestionIds,
        recommendations: validated.recommendations,
        schemaVersion: SCHEMA_VERSION,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    for (const activity of validated.activities) {
      const { id, ...payload } = activity;
      const ref = doc(this.db(), "users", uid, "activities", id);
      batch.set(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
    }

    for (const record of validated.ledger) {
      const { id, ...ledgerFields } = record;
      const { updatedAt, ...payload } = ledgerFields;
      void updatedAt;
      const ref = doc(this.db(), "users", uid, "ledger", id);
      batch.set(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
    }

    await batch.commit();
  }

}
