
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { FirebaseAuthRepository } from "./FirebaseAuthRepository";
import { MockAuthRepository } from "./MockAuthRepository";
import type { AuthRepository } from "./types";

let instance: AuthRepository | null = null;

export function getAuthRepository(): AuthRepository {
  if (!instance) {
    instance = isFirebaseConfigured()
      ? new FirebaseAuthRepository()
      : new MockAuthRepository();
  }
  return instance;
}


