
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAuthRepository } from "@/lib/auth/createAuthRepository";
import { getDataRepository } from "@/lib/data/createDataRepository";
import { SCHEMA_VERSION, type UserProfile } from "@/lib/data/types";
import type {
  AuthRepository,
  AuthSessionResult,
  AuthUser,
  SignInParams,
  SignUpParams,
} from "@/lib/auth/types";
import { isFirebaseConfigured } from "@/lib/firebase/config";


interface AuthContextValue {
  initialized: boolean;
  loading: boolean;
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isFirebaseEnabled: boolean;

  signUp: (params: SignUpParams) => Promise<AuthUser>;
  signIn: (params: SignInParams) => Promise<AuthSessionResult>;
  signInWithGoogle: () => Promise<AuthSessionResult>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;

  getRepository: () => AuthRepository;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);


  const repo = useMemo(() => getAuthRepository(), []);

  const loadProfile = useCallback(async (authUser: AuthUser) => {
    if (!isFirebaseConfigured()) return null;
    const dataRepo = getDataRepository(true);
    const existing = await dataRepo.loadProfile(authUser.uid);
    if (existing) {
      setProfile(existing);
      return existing;
    }
    const created: UserProfile = {
      uid: authUser.uid,
      displayName: authUser.displayName ?? "User",
      email: authUser.email ?? "",
      photoURL: authUser.photoURL,
      provider: authUser.provider,
      onboardingCompleted: false,
      schemaVersion: SCHEMA_VERSION,
    };
    await dataRepo.saveProfile(created);
    setProfile(created);
    return created;
  }, []);

  useEffect(() => {
    const unsubscribe = repo.onAuthStateChanged(async (authUser) => {
      setLoading(true);
      setUser(authUser);
      if (authUser && isFirebaseConfigured()) {
        await loadProfile(authUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
      setInitialized(true);
    });
    return unsubscribe;
  }, [repo, loadProfile]);

  const signUp = useCallback(
    async (params: SignUpParams) => {
      const authUser = await repo.signUpWithEmail(params);
      await repo.sendEmailVerification();
      if (isFirebaseConfigured()) {
        const dataRepo = getDataRepository(true);
        const newProfile: UserProfile = {
          uid: authUser.uid,
          displayName: params.displayName,
          email: params.email,
          photoURL: authUser.photoURL,
          provider: "password",
          onboardingCompleted: false,
          schemaVersion: SCHEMA_VERSION,
        };
        await dataRepo.saveProfile(newProfile);
        await dataRepo.save(authUser.uid, {
          activities: [],
          constraints: { budgetAvailable: 50000, transportModes: [], housingType: "apartment", ownership: "rent", hasCar: false },
          ledger: [],
          recommendations: [],
          answeredQuestionIds: [],
        });
        setProfile(newProfile);
      }
      return authUser;
    },
    [repo]
  );

  const signIn = useCallback(
    async (params: SignInParams): Promise<AuthSessionResult> => {
      const authUser = await repo.signInWithEmail(params);
      if (isFirebaseConfigured()) {
        const prof = await loadProfile(authUser);
        return { user: authUser, onboardingCompleted: prof?.onboardingCompleted ?? false };
      }
      return { user: authUser, onboardingCompleted: false };
    },
    [repo, loadProfile]
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthSessionResult> => {
    const authUser = await repo.signInWithGoogle();
    if (isFirebaseConfigured()) {
      const prof = await loadProfile(authUser);
      return { user: authUser, onboardingCompleted: prof?.onboardingCompleted ?? false };
    }
    return { user: authUser, onboardingCompleted: false };
  }, [repo, loadProfile]);

  const signOut = useCallback(async () => {
    await repo.signOut();
    setProfile(null);
  }, [repo]);

  const sendPasswordReset = useCallback(
    (email: string) => repo.sendPasswordResetEmail(email),
    [repo]
  );

  const sendVerificationEmail = useCallback(() => repo.sendEmailVerification(), [repo]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  const setOnboardingCompleted = useCallback(
    async (completed: boolean) => {
      if (!user || !profile || !isFirebaseConfigured()) return;
      const updated = { ...profile, onboardingCompleted: completed };
      await getDataRepository(true).saveProfile(updated);
      setProfile(updated);
    },
    [user, profile]
  );



  const value: AuthContextValue = {
    initialized,
    loading,
    user,
    profile,
    isAuthenticated: Boolean(user),
    isFirebaseEnabled: isFirebaseConfigured(),

    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
    sendVerificationEmail,
    refreshProfile,
    setOnboardingCompleted,

    getRepository: () => repo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
