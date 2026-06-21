import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const PROJECT_ID = "prithviproof-rules-test";
const rules = readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8");

const baseConstraints = {
  budgetAvailable: 50000,
  housingType: "shared",
  ownership: "rent",
  hasCar: false,
};

const baseProfile = (uid: string) => ({
  uid,
  displayName: "Test User",
  email: `${uid}@example.com`,
  provider: "password",
  onboardingCompleted: false,
  schemaVersion: 1,
});

const baseState = () => ({
  constraints: baseConstraints,
  answeredQuestionIds: [] as string[],
  recommendations: [] as unknown[],
  schemaVersion: 1,
});

const baseActivity = () => ({
  categoryId: "transport",
  factorId: "f-scooter-gas",
  value: 12,
  unit: "km",
  dataQualityScore: 80,
});

const baseLedger = (state = "estimated") => ({
  recommendationId: "rec-1",
  title: "Switch commute mode",
  state,
  projectedSavingsKgCO2e: 25,
  verifiedSavingsKgCO2e: 0,
});

describe("Firestore security rules", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: "127.0.0.1",
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it("denies unauthenticated reads", async () => {
    const unauth = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(unauth.firestore(), "users/alice")));
  });

  it("allows owners to read and write their profile", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const ref = doc(alice.firestore(), "users/alice");
    await assertSucceeds(setDoc(ref, baseProfile("alice")));
    await assertSucceeds(getDoc(ref));
  });

  it("denies cross-user profile access", async () => {
    const alice = testEnv.authenticatedContext("alice");
    await assertSucceeds(setDoc(doc(alice.firestore(), "users/alice"), baseProfile("alice")));

    const bob = testEnv.authenticatedContext("bob");
    await assertFails(getDoc(doc(bob.firestore(), "users/alice")));
    await assertFails(setDoc(doc(bob.firestore(), "users/alice"), baseProfile("alice")));
  });

  it("rejects unknown profile fields", async () => {
    const alice = testEnv.authenticatedContext("alice");
    await assertFails(
      setDoc(doc(alice.firestore(), "users/alice"), {
        ...baseProfile("alice"),
        isAdmin: true,
      })
    );
  });

  it("prevents uid mutation on profile update", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const ref = doc(alice.firestore(), "users/alice");
    await assertSucceeds(setDoc(ref, baseProfile("alice")));
    await assertFails(
      updateDoc(ref, {
        uid: "bob",
        displayName: "Hijack",
        email: "alice@example.com",
        provider: "password",
        onboardingCompleted: false,
        schemaVersion: 1,
      })
    );
  });

  it("allows valid state/current writes for the owner", async () => {
    const alice = testEnv.authenticatedContext("alice");
    await assertSucceeds(setDoc(doc(alice.firestore(), "users/alice"), baseProfile("alice")));
    await assertSucceeds(
      setDoc(doc(alice.firestore(), "users/alice/state/current"), baseState())
    );
  });

  it("rejects invalid constraint enums", async () => {
    const alice = testEnv.authenticatedContext("alice");
    await assertSucceeds(setDoc(doc(alice.firestore(), "users/alice"), baseProfile("alice")));
    await assertFails(
      setDoc(doc(alice.firestore(), "users/alice/state/current"), {
        ...baseState(),
        constraints: { ...baseConstraints, housingType: "castle" },
      })
    );
  });

  it("allows owner activity writes with bounded values", async () => {
    const alice = testEnv.authenticatedContext("alice");
    await assertSucceeds(setDoc(doc(alice.firestore(), "users/alice"), baseProfile("alice")));
    await assertSucceeds(
      setDoc(doc(alice.firestore(), "users/alice/activities/act-1"), baseActivity())
    );
    await assertFails(
      setDoc(doc(alice.firestore(), "users/alice/activities/bad"), {
        ...baseActivity(),
        dataQualityScore: 150,
      })
    );
  });

  it("denies cross-user activity reads", async () => {
    const alice = testEnv.authenticatedContext("alice");
    await assertSucceeds(setDoc(doc(alice.firestore(), "users/alice"), baseProfile("alice")));
    await assertSucceeds(
      setDoc(doc(alice.firestore(), "users/alice/activities/act-1"), baseActivity())
    );

    const bob = testEnv.authenticatedContext("bob");
    await assertFails(getDoc(doc(bob.firestore(), "users/alice/activities/act-1")));
  });

  it("permits valid ledger transitions and blocks invalid ones", async () => {
    const alice = testEnv.authenticatedContext("alice");
    await assertSucceeds(setDoc(doc(alice.firestore(), "users/alice"), baseProfile("alice")));
    const ledgerRef = doc(alice.firestore(), "users/alice/ledger/led-1");
    await assertSucceeds(setDoc(ledgerRef, baseLedger("estimated")));
    await assertSucceeds(updateDoc(ledgerRef, baseLedger("planned")));
    await assertFails(updateDoc(ledgerRef, baseLedger("verified")));
  });

  it("rejects unknown ledger fields", async () => {
    const alice = testEnv.authenticatedContext("alice");
    await assertSucceeds(setDoc(doc(alice.firestore(), "users/alice"), baseProfile("alice")));
    await assertFails(
      setDoc(doc(alice.firestore(), "users/alice/ledger/led-1"), {
        ...baseLedger(),
        forged: true,
      })
    );
  });
});
