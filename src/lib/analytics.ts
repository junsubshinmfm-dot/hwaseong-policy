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
const VISITOR_ID_KEY = 'hp_visitor_id';
const LAST_VISIT_DATE_KEY = 'hp_last_visit_date';
const HEARTBEAT_INTERVAL_MS = 30_000;
const PRESENCE_TIMEOUT_MS = 60_000;

function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

async function incrementCounter(path: string): Promise<void> {
  if (!db) return;
  await runTransaction(ref(db, path), (current) => {
    return (typeof current === 'number' ? current : 0) + 1;
  });
}

export interface TrackerHandle {
  stop: () => void;
}

export function startTracker(): TrackerHandle | null {
  if (!isFirebaseConfigured || !db) return null;
  if (typeof window === 'undefined') return null;

  const { id: visitorId, isNewVisitor } = getOrCreateVisitorId();
  const newDaily = isNewDailyVisit();
  const today = getTodayKey();

  const sessionId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const presenceRef = ref(db, `${PRESENCE_PATH}/${sessionId}`);

  void (async () => {
    try {
      await set(presenceRef, { visitorId, lastSeen: serverTimestamp() });
      await onDisconnect(presenceRef).remove();
      await incrementCounter(`${STATS_PATH}/total`);
      await incrementCounter(`${STATS_PATH}/daily/${today}/pv`);
      if (newDaily) {
        await incrementCounter(`${STATS_PATH}/daily/${today}/uv`);
      }
      if (isNewVisitor) {
        await incrementCounter(`${STATS_PATH}/totalUnique`);
      }
    } catch {
      // 네트워크 실패 등은 조용히 무시 (방문자 경험 저해 방지)
    }
  })();

  const heartbeat = async () => {
    try {
      await set(presenceRef, { visitorId, lastSeen: serverTimestamp() });
    } catch {
      // ignore
    }
  };

  const intervalId = window.setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);

  const handleUnload = () => {
    void remove(presenceRef).catch(() => {});
  };
  window.addEventListener('pagehide', handleUnload);
  window.addEventListener('beforeunload', handleUnload);

  return {
    stop: () => {
      window.clearInterval(intervalId);
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
      void remove(presenceRef).catch(() => {});
    },
  };
}

export interface VisitorStats {
  online: number;
  total: number;
  totalUnique: number;
  todayPv: number;
  todayUv: number;
  daily: Array<{ date: string; pv: number; uv: number }>;
}

export function subscribeVisitorStats(
  callback: (stats: VisitorStats) => void
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;

  let online = 0;
  let total = 0;
  let totalUnique = 0;
  let daily: Array<{ date: string; pv: number; uv: number }> = [];

  const emit = () => {
    const today = getTodayKey();
    const todayEntry = daily.find((d) => d.date === today);
    callback({
      online,
      total,
      totalUnique,
      todayPv: todayEntry?.pv ?? 0,
      todayUv: todayEntry?.uv ?? 0,
      daily,
    });
  };

  const presenceUnsub = onValue(ref(db, PRESENCE_PATH), (snapshot) => {
    const data = snapshot.val() as Record<
      string,
      { visitorId?: string; lastSeen?: number }
    > | null;
    if (!data) {
      online = 0;
      emit();
      return;
    }
    const now = Date.now();
    const activeVisitors = new Set<string>();
    Object.values(data).forEach((session) => {
      if (!session) return;
      const lastSeen = typeof session.lastSeen === 'number' ? session.lastSeen : 0;
      if (now - lastSeen <= PRESENCE_TIMEOUT_MS) {
        activeVisitors.add(session.visitorId || `anon_${Math.random()}`);
      }
    });
    online = activeVisitors.size;
    emit();
  });

  const totalUnsub = onValue(ref(db, `${STATS_PATH}/total`), (snapshot) => {
    total = typeof snapshot.val() === 'number' ? snapshot.val() : 0;
    emit();
  });

  const uniqueUnsub = onValue(ref(db, `${STATS_PATH}/totalUnique`), (snapshot) => {
    totalUnique = typeof snapshot.val() === 'number' ? snapshot.val() : 0;
    emit();
  });

  const dailyUnsub = onValue(ref(db, `${STATS_PATH}/daily`), (snapshot) => {
    const data = snapshot.val() as Record<string, { pv?: number; uv?: number }> | null;
    if (!data) {
      daily = [];
      emit();
      return;
    }
    daily = Object.entries(data)
      .map(([date, value]) => ({
        date,
        pv: typeof value?.pv === 'number' ? value.pv : 0,
        uv: typeof value?.uv === 'number' ? value.uv : 0,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    emit();
  });

  return () => {
    presenceUnsub();
    totalUnsub();
    uniqueUnsub();
    dailyUnsub();
  };
}
