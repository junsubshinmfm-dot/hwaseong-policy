import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, type Auth } from 'firebase/auth';

// GitHub Secrets/CI 환경변수에 줄바꿈/공백이 섞여 들어오는 사고를 차단.
// (예: 웹에서 API 키를 붙여넣을 때 trailing newline이 함께 등록되어 빌드 산출물에
//  apiKey:"AIzaSy...\n" 형태로 박히면 Firebase가 모든 호출을 인증 실패 처리해
//  사이트 전체가 데이터 0건처럼 보이는 사고가 발생함.)
//
// 주의: Next.js의 process.env.NEXT_PUBLIC_* 정적 치환은 *직접 참조*만 인식하므로
//   const env = (k) => process.env[k]   ← 동적 접근 (X, 클라이언트에서 빈 값)
//   process.env.NEXT_PUBLIC_FOO         ← 직접 참조 (O)
// 반드시 직접 참조 후에만 .trim() 을 붙일 것.
const trim = (v: string | undefined): string => (v ?? '').trim();

const firebaseConfig = {
  apiKey: trim(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: trim(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  databaseURL: trim(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL),
  projectId: trim(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: trim(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: trim(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: trim(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

const hasConfig = Boolean(firebaseConfig.apiKey) && Boolean(firebaseConfig.databaseURL);

// 빌드 시점(서버 환경)에 핵심 키가 비었으면 즉시 실패 — 망가진 번들이 GitHub Pages에 올라가는 사고를 차단.
// 클라이언트 측에서는 이미 빌드된 번들이라 throw하지 않고 조용히 비활성화.
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !hasConfig) {
  throw new Error(
    '[firebase] NEXT_PUBLIC_FIREBASE_API_KEY / NEXT_PUBLIC_FIREBASE_DATABASE_URL 가 비어 있습니다. ' +
      'GitHub Secrets(또는 .env.local) 설정을 확인하세요.',
  );
}

const app = hasConfig
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0]
  : null;

export const db = app ? getDatabase(app) : null;
export const auth: Auth | null = app ? getAuth(app) : null;
export const isFirebaseConfigured = hasConfig;
