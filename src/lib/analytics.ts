import {
  ref,
  onValue,
  onDisconnect,
  runTransaction,
  set,
  remove,
  serverTimestamp,
} from 'firebase/database';
import { db, isFirebaseConfigured } from './firebase';

const PRESENCE_PATH = 'presence';
const STATS_PATH = 'stats';
const VIEWS_PATH = 'views';
const VISITOR_ID_KEY = 'hp_visitor_id';
const LAST_VISIT_DATE_KEY = 'hp_last_visit_date';
const SESSION_KEY = 'hp_session';
const HEARTBEAT_INTERVAL_MS = 30_000;
const PRESENCE_TIMEOUT_MS = 60_000;
const SESSION_TIMEOUT_MS = 30 * 60_000;
const BOUNCE_PV_THRESHOLD = 1;

// ============================================================
// 유틸
// ============================================================

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function encodePath(pathname: string): string {
  // Firebase 키는 . # $ [ ] / 사용 불가 → 안전한 키로 변환
  const p = pathname || '/';
  if (p === '/') return '_root';
  return p.replace(/^\//, '').replace(/\//g, '__').replace(/[.#$[\]]/g, '_') || '_root';
}

function getOrCreateVisitorId(): { id: string; isNewVisitor: boolean } {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  const isNewVisitor = !id;
  if (!id) {
    id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return { id, isNewVisitor };
}

function isNewDailyVisit(): boolean {
  const today = getTodayKey();
  const last = localStorage.getItem(LAST_VISIT_DATE_KEY);
  if (last === today) return false;
  localStorage.setItem(LAST_VISIT_DATE_KEY, today);
  return true;
}

async function incrementCounter(path: string, by: number = 1): Promise<void> {
  if (!db) return;
  await runTransaction(ref(db, path), (current) => {
    return (typeof current === 'number' ? current : 0) + by;
  });
}

// ============================================================
// 디바이스 / 유입경로 분류
// ============================================================

function classifyDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  const u = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(u)) return 'tablet';
  if (/mobi|android|iphone|ipod|blackberry|windows phone/.test(u)) return 'mobile';
  return 'desktop';
}

function classifyOS(ua: string): string {
  const u = ua.toLowerCase();
  if (/windows/.test(u)) return 'Windows';
  if (/iphone|ipad|ipod/.test(u)) return 'iOS';
  if (/android/.test(u)) return 'Android';
  if (/mac/.test(u)) return 'macOS';
  if (/linux/.test(u)) return 'Linux';
  return 'Other';
}

function classifyBrowser(ua: string): string {
  const u = ua.toLowerCase();
  if (/kakaotalk/.test(u)) return 'KakaoTalk';
  if (/naver|whale/.test(u)) return 'Whale';
  if (/edg\//.test(u)) return 'Edge';
  if (/chrome/.test(u) && !/edg\//.test(u)) return 'Chrome';
  if (/safari/.test(u) && !/chrome/.test(u)) return 'Safari';
  if (/firefox/.test(u)) return 'Firefox';
  if (/samsungbrowser/.test(u)) return 'Samsung';
  return 'Other';
}

function classifyReferrer(ref: string): string {
  if (!ref) return '(직접 유입)';
  try {
    const host = new URL(ref).hostname.toLowerCase().replace(/^www\./, '');
    if (host.includes('google')) return 'Google';
    if (host.includes('naver')) return 'Naver';
    if (host.includes('daum') || host.includes('kakao')) return 'Daum/Kakao';
    if (host.includes('bing')) return 'Bing';
    if (host.includes('youtube')) return 'YouTube';
    if (host.includes('facebook') || host === 'fb.com' || host === 'm.facebook.com') return 'Facebook';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('twitter') || host === 'x.com' || host === 't.co') return 'Twitter/X';
    if (host.includes('threads')) return 'Threads';
    if (host.includes('tiktok')) return 'TikTok';
    if (host.includes('github')) return 'GitHub';
    return host;
  } catch {
    return '(알 수 없음)';
  }
}

// ============================================================
// 세션 상태 (sessionStorage)
// ============================================================

interface SessionState {
  id: string;
  startedAt: number;
  lastActivityAt: number;
  pageviewCount: number;
  currentPath: string;
  currentPathStartedAt: number;
  bounceRecorded: boolean;
}

function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionState;
    if (Date.now() - parsed.lastActivityAt > SESSION_TIMEOUT_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveSession(s: SessionState): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

function createSession(pathname: string): SessionState {
  const now = Date.now();
  return {
    id: `s_${now.toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    startedAt: now,
    lastActivityAt: now,
    pageviewCount: 0,
    currentPath: pathname,
    currentPathStartedAt: now,
    bounceRecorded: false,
  };
}

// ============================================================
// 트래커
// ============================================================

export interface TrackerHandle {
  stop: () => void;
}

export function startTracker(pathname: string = '/'): TrackerHandle | null {
  if (!isFirebaseConfigured || !db) return null;
  if (typeof window === 'undefined') return null;

  const today = getTodayKey();
  const { id: visitorId, isNewVisitor } = getOrCreateVisitorId();
  const newDaily = isNewDailyVisit();

  // 세션 복원 또는 생성
  let session = loadSession();
  const isNewSession = !session;
  if (!session) {
    session = createSession(pathname);
  }

  const presenceRef = ref(db, `${PRESENCE_PATH}/${session.id}`);

  // 이전 페이지의 체류시간 기록 (경로 변경 시)
  const pathChanged = session.currentPath !== pathname;
  if (!isNewSession && pathChanged) {
    const dwellMs = Math.max(0, Date.now() - session.currentPathStartedAt);
    if (dwellMs > 0 && dwellMs < 30 * 60_000) {
      void incrementCounter(
        `${STATS_PATH}/pageviews/${encodePath(session.currentPath)}/totalSeconds`,
        Math.round(dwellMs / 1000),
      );
    }
    session.currentPath = pathname;
    session.currentPathStartedAt = Date.now();
  }

  // 페이지뷰 증가
  session.pageviewCount += 1;
  session.lastActivityAt = Date.now();
  saveSession(session);

  // Firebase 집계 반영 (fire-and-forget)
  void (async () => {
    try {
      await set(presenceRef, {
        visitorId,
        lastSeen: serverTimestamp(),
        path: pathname,
      });
      await onDisconnect(presenceRef).remove();

      // 페이지뷰
      await incrementCounter(`${STATS_PATH}/total`);
      await incrementCounter(`${STATS_PATH}/daily/${today}/pv`);
      await incrementCounter(`${STATS_PATH}/pageviews/${encodePath(pathname)}/count`);

      // 고유 방문자
      if (newDaily) {
        await incrementCounter(`${STATS_PATH}/daily/${today}/uv`);
      }
      if (isNewVisitor) {
        await incrementCounter(`${STATS_PATH}/totalUnique`);
      }

      // 신규 세션 집계 (디바이스/유입경로/세션수)
      if (isNewSession) {
        const ua = navigator.userAgent || '';
        const device = classifyDevice(ua);
        const os = classifyOS(ua);
        const browser = classifyBrowser(ua);
        const referrer = classifyReferrer(document.referrer || '');

        await incrementCounter(`${STATS_PATH}/daily/${today}/sessions`);
        await incrementCounter(`${STATS_PATH}/totalSessions`);
        await incrementCounter(`${STATS_PATH}/devices/${device}`);
        await incrementCounter(`${STATS_PATH}/os/${os}`);
        await incrementCounter(`${STATS_PATH}/browsers/${browser}`);
        await incrementCounter(`${STATS_PATH}/referrers/${encodePath(referrer)}`);
      }
    } catch {
      // 네트워크 실패는 조용히 무시
    }
  })();

  // 하트비트
  const heartbeat = async () => {
    try {
      await set(presenceRef, {
        visitorId,
        lastSeen: serverTimestamp(),
        path: session!.currentPath,
      });
      const cur = loadSession();
      if (cur && cur.id === session!.id) {
        cur.lastActivityAt = Date.now();
        saveSession(cur);
      }
    } catch {
      // ignore
    }
  };
  const intervalId = window.setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);

  // 세션 종료 처리
  const finalizeSession = () => {
    const cur = loadSession();
    if (!cur) return;
    const now = Date.now();

    // 현재 페이지 체류시간
    const dwellMs = Math.max(0, now - cur.currentPathStartedAt);
    if (dwellMs > 0 && dwellMs < 30 * 60_000) {
      void incrementCounter(
        `${STATS_PATH}/pageviews/${encodePath(cur.currentPath)}/totalSeconds`,
        Math.round(dwellMs / 1000),
      );
    }

    // 세션 총 체류시간
    const sessionMs = Math.max(0, now - cur.startedAt);
    if (sessionMs > 0 && sessionMs < 2 * 60 * 60_000) {
      void incrementCounter(
        `${STATS_PATH}/daily/${getTodayKey()}/totalSessionSeconds`,
        Math.round(sessionMs / 1000),
      );
      void incrementCounter(
        `${STATS_PATH}/totalSessionSeconds`,
        Math.round(sessionMs / 1000),
      );
    }

    // 이탈률: 1 페이지뷰 세션
    if (!cur.bounceRecorded && cur.pageviewCount <= BOUNCE_PV_THRESHOLD) {
      cur.bounceRecorded = true;
      saveSession(cur);
      void incrementCounter(`${STATS_PATH}/daily/${getTodayKey()}/bounces`);
      void incrementCounter(`${STATS_PATH}/totalBounces`);
    }
  };

  const handleUnload = () => {
    finalizeSession();
    void remove(presenceRef).catch(() => {});
  };
  window.addEventListener('pagehide', handleUnload);
  window.addEventListener('beforeunload', handleUnload);

  return {
    stop: () => {
      window.clearInterval(intervalId);
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
    },
  };
}

// ============================================================
// 정책 카드 조회수
// ============================================================

export async function incrementPolicyView(policyId: number | string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await incrementCounter(`${VIEWS_PATH}/${policyId}`);
  } catch {
    // ignore
  }
}

export function subscribePolicyView(
  policyId: number | string,
  callback: (count: number) => void,
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;
  const unsub = onValue(ref(db, `${VIEWS_PATH}/${policyId}`), (snap) => {
    callback(typeof snap.val() === 'number' ? snap.val() : 0);
  });
  return unsub;
}

export function subscribeAllPolicyViews(
  callback: (views: Record<string, number>) => void,
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;
  const unsub = onValue(ref(db, VIEWS_PATH), (snap) => {
    const data = snap.val() as Record<string, number> | null;
    callback(data || {});
  });
  return unsub;
}

// ============================================================
// 관리자 통계 구독
// ============================================================

export interface PageStat {
  path: string;
  count: number;
  avgSeconds: number;
}

export interface VisitorStats {
  online: number;
  total: number;
  totalUnique: number;
  totalSessions: number;
  totalSessionSeconds: number;
  totalBounces: number;
  todayPv: number;
  todayUv: number;
  todaySessions: number;
  todaySessionSeconds: number;
  todayBounces: number;
  avgSessionSeconds: number;
  todayAvgSessionSeconds: number;
  bounceRate: number;
  todayBounceRate: number;
  daily: Array<{ date: string; pv: number; uv: number }>;
  topPages: PageStat[];
  devices: Record<string, number>;
  os: Record<string, number>;
  browsers: Record<string, number>;
  referrers: Record<string, number>;
}

function decodePath(key: string): string {
  if (key === '_root') return '/';
  return '/' + key.replace(/__/g, '/');
}

function emptyStats(): VisitorStats {
  return {
    online: 0,
    total: 0,
    totalUnique: 0,
    totalSessions: 0,
    totalSessionSeconds: 0,
    totalBounces: 0,
    todayPv: 0,
    todayUv: 0,
    todaySessions: 0,
    todaySessionSeconds: 0,
    todayBounces: 0,
    avgSessionSeconds: 0,
    todayAvgSessionSeconds: 0,
    bounceRate: 0,
    todayBounceRate: 0,
    daily: [],
    topPages: [],
    devices: {},
    os: {},
    browsers: {},
    referrers: {},
  };
}

export function subscribeVisitorStats(
  callback: (stats: VisitorStats) => void,
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;
  const database = db;

  const state = emptyStats();

  const emit = () => {
    const today = getTodayKey();
    const todayEntry = state.daily.find((d) => d.date === today);
    state.todayPv = todayEntry?.pv ?? 0;
    state.todayUv = todayEntry?.uv ?? 0;

    state.avgSessionSeconds =
      state.totalSessions > 0
        ? Math.round(state.totalSessionSeconds / state.totalSessions)
        : 0;
    state.todayAvgSessionSeconds =
      state.todaySessions > 0
        ? Math.round(state.todaySessionSeconds / state.todaySessions)
        : 0;
    state.bounceRate =
      state.totalSessions > 0
        ? Math.round((state.totalBounces / state.totalSessions) * 1000) / 10
        : 0;
    state.todayBounceRate =
      state.todaySessions > 0
        ? Math.round((state.todayBounces / state.todaySessions) * 1000) / 10
        : 0;

    callback({ ...state });
  };

  const subs: Array<() => void> = [];

  // 실시간 접속자
  subs.push(
    onValue(ref(database, PRESENCE_PATH), (snap) => {
      const data = snap.val() as Record<
        string,
        { visitorId?: string; lastSeen?: number }
      > | null;
      if (!data) {
        state.online = 0;
        emit();
        return;
      }
      const now = Date.now();
      const active = new Set<string>();
      Object.values(data).forEach((s) => {
        if (!s) return;
        const last = typeof s.lastSeen === 'number' ? s.lastSeen : 0;
        if (now - last <= PRESENCE_TIMEOUT_MS) {
          active.add(s.visitorId || `anon_${Math.random()}`);
        }
      });
      state.online = active.size;
      emit();
    }),
  );

  // 누적 PV/UV/세션/체류/이탈
  const scalarPaths: Array<[keyof VisitorStats, string]> = [
    ['total', `${STATS_PATH}/total`],
    ['totalUnique', `${STATS_PATH}/totalUnique`],
    ['totalSessions', `${STATS_PATH}/totalSessions`],
    ['totalSessionSeconds', `${STATS_PATH}/totalSessionSeconds`],
    ['totalBounces', `${STATS_PATH}/totalBounces`],
  ];
  scalarPaths.forEach(([key, path]) => {
    subs.push(
      onValue(ref(database, path), (snap) => {
        const v = snap.val();
        (state as unknown as Record<string, number>)[key as string] =
          typeof v === 'number' ? v : 0;
        emit();
      }),
    );
  });

  // 일별 추이 + 오늘 세션/체류/이탈
  subs.push(
    onValue(ref(database, `${STATS_PATH}/daily`), (snap) => {
      const data = snap.val() as Record<
        string,
        { pv?: number; uv?: number; sessions?: number; totalSessionSeconds?: number; bounces?: number }
      > | null;
      if (!data) {
        state.daily = [];
        state.todaySessions = 0;
        state.todaySessionSeconds = 0;
        state.todayBounces = 0;
        emit();
        return;
      }
      state.daily = Object.entries(data)
        .map(([date, v]) => ({
          date,
          pv: typeof v?.pv === 'number' ? v.pv : 0,
          uv: typeof v?.uv === 'number' ? v.uv : 0,
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      const today = getTodayKey();
      const todayRaw = data[today] || {};
      state.todaySessions = typeof todayRaw.sessions === 'number' ? todayRaw.sessions : 0;
      state.todaySessionSeconds =
        typeof todayRaw.totalSessionSeconds === 'number' ? todayRaw.totalSessionSeconds : 0;
      state.todayBounces = typeof todayRaw.bounces === 'number' ? todayRaw.bounces : 0;
      emit();
    }),
  );

  // 인기 페이지
  subs.push(
    onValue(ref(database, `${STATS_PATH}/pageviews`), (snap) => {
      const data = snap.val() as Record<
        string,
        { count?: number; totalSeconds?: number }
      > | null;
      if (!data) {
        state.topPages = [];
        emit();
        return;
      }
      state.topPages = Object.entries(data)
        .map(([key, v]) => {
          const count = typeof v?.count === 'number' ? v.count : 0;
          const totalSeconds = typeof v?.totalSeconds === 'number' ? v.totalSeconds : 0;
          return {
            path: decodePath(key),
            count,
            avgSeconds: count > 0 ? Math.round(totalSeconds / count) : 0,
          };
        })
        .sort((a, b) => b.count - a.count);
      emit();
    }),
  );

  // 디바이스/OS/브라우저/유입경로
  const mapPaths: Array<[keyof VisitorStats, string, boolean]> = [
    ['devices', `${STATS_PATH}/devices`, false],
    ['os', `${STATS_PATH}/os`, false],
    ['browsers', `${STATS_PATH}/browsers`, false],
    ['referrers', `${STATS_PATH}/referrers`, true],
  ];
  mapPaths.forEach(([key, path, isReferrer]) => {
    subs.push(
      onValue(ref(database, path), (snap) => {
        const data = snap.val() as Record<string, number> | null;
        const out: Record<string, number> = {};
        if (data) {
          Object.entries(data).forEach(([k, v]) => {
            const displayKey = isReferrer ? decodePath(k).replace(/^\//, '') || '(직접 유입)' : k;
            out[displayKey] = typeof v === 'number' ? v : 0;
          });
        }
        (state as unknown as Record<string, Record<string, number>>)[key as string] = out;
        emit();
      }),
    );
  });

  return () => {
    subs.forEach((u) => u());
  };
}
