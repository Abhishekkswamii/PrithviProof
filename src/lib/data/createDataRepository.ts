
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { FirestoreDataRepository } from "./FirestoreDataRepository";
import { LocalDataRepository } from "./LocalDataRepository";
import type { DataRepository } from "./types";

let firestoreRepo: FirestoreDataRepository | null = null;
let localRepo: LocalDataRepository | null = null;

export function getLocalDataRepository(): LocalDataRepository {
  if (!localRepo) localRepo = new LocalDataRepository();
  return localRepo;
}

export function getFirestoreDataRepository(): FirestoreDataRepository {
  if (!firestoreRepo) firestoreRepo = new FirestoreDataRepository();
  return firestoreRepo;
}

export function getDataRepository(useRemote: boolean): DataRepository {
  if (useRemote && isFirebaseConfigured()) {
    return getFirestoreDataRepository();
  }
  return getLocalDataRepository();
}
