'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';
import { subscribeAllSuggestions, updateSuggestionStatus, deleteSuggestion } from '@/lib/suggestions';
import type { Suggestion } from '@/types/suggestion';

const ADMIN_PASSWORD = '6517';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 로그인 상태 유지 (세션 내)
  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    const unsubscribe = subscribeAllSuggestions((data) => {
      setSuggestions(data);
    });

    return () => { unsubscribe?.(); };
  }, [authenticated]);

  const filtered = useMemo(() => {
    if (filter === 'all') return suggestions;
    return suggestions.filter((s) => s.status === filter);
  }, [suggestions, filter]);

  const counts = useMemo(() => ({
    pending: suggestions.filter((s) => s.status === 'pending').length,
    approved: suggestions.filter((s) => s.status === 'approved').length,
    rejected: suggestions.filter((s) => s.status === 'rejected').length,
    all: suggestions.length,
  }), [suggestions]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('비밀번호가 틀렸습니다.');
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    await updateSuggestionStatus(id, 'approved');
    setProcessing(null);
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    await updateSuggestionStatus(id, 'rejected');
    setProcessing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    setProcessing(id);
    await deleteSuggestion(id);
    setProcessing(null);
  };

  // 로그인 화면
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#F4F5F9] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-navy/[0.06] p-8"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-navy text-xl font-bold">관리자 로그인</h1>
            <p className="text-navy/40 text-sm mt-1">정책제안 관리 페이지</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="관리자 비밀번호"
              className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm text-center tracking-widest
                         focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy
                         placeholder:text-navy/25 placeholder:tracking-normal transition-all"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-navy text-white font-bold text-sm hover:bg-navy-dark transition-colors"
            >
              로그인
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // 관리자 대시보드
  return (
    <main className="min-h-screen bg-[#F4F5F9]">
      {/* 헤더 */}
      <div className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">정책제안 관리</h1>
            <p className="text-white/50 text-sm mt-1">시민 정책제안을 검토하고 승인합니다</p>
          </div>
          <button
            onClick={() => { setAuthenticated(false); sessionStorage.removeItem('admin_auth'); }}
            className="px-4 py-2 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/20 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 필터 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { key: 'pending', label: '승인 대기', color: 'bg-orange' },
            { key: 'approved', label: '승인됨', color: 'bg-green-500' },
            { key: 'rejected', label: '거부됨', color: 'bg-red-400' },
            { key: 'all', label: '전체', color: 'bg-navy' },
          ] as const).map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                filter === key
                  ? `${color} text-white shadow-md`
                  : 'bg-white text-navy/50 border border-navy/10 hover:bg-navy-50'
              }`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                filter === key ? 'bg-white/20' : 'bg-navy/5'
              }`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* 제안 목록 */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-navy/[0.06] p-12 text-center">
            <p className="text-navy/30 text-base">
              {filter === 'pending' ? '승인 대기 중인 제안이 없습니다' : '해당 상태의 제안이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((suggestion) => {
                const catMeta = CATEGORIES[suggestion.category as CategoryKey];
                const regionMeta = REGIONS[suggestion.region as RegionKey];
                const date = new Date(suggestion.createdAt);
                const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                const isExpanded = expandedId === suggestion.id;
                const isProcessing = processing === suggestion.id;

                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl border border-navy/[0.06] shadow-sm overflow-hidden"
                  >
                    {/* 헤더 */}
                    <div
                      className="p-4 cursor-pointer hover:bg-navy-50/30 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* 상태 표시 */}
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          suggestion.status === 'pending' ? 'bg-orange' :
                          suggestion.status === 'approved' ? 'bg-green-500' : 'bg-red-400'
                        }`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-navy font-bold text-base">{suggestion.title}</h3>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{
                              backgroundColor: `${catMeta?.color}15`,
                              color: catMeta?.color,
                            }}>
                              {catMeta?.icon} {catMeta?.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{
                              backgroundColor: `${regionMeta?.color}15`,
                              color: regionMeta?.color,
                            }}>
                              {regionMeta?.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-navy/35">
                            <span>{suggestion.nickname}</span>
                            <span>{dateStr}</span>
                            <span>좋아요 {suggestion.likes}</span>
                          </div>
                        </div>

                        {/* 펼침 아이콘 */}
                        <svg
                          className={`w-5 h-5 text-navy/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* 본문 (펼침) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0 border-t border-navy/[0.06]">
                            <div className="pt-4 space-y-4">
                              <div>
                                <p className="text-navy/40 text-xs font-bold uppercase mb-1">정책 내용</p>
                                <p className="text-navy text-sm leading-relaxed whitespace-pre-wrap">{suggestion.content}</p>
                              </div>

                              {suggestion.reason && (
                                <div>
                                  <p className="text-navy/40 text-xs font-bold uppercase mb-1">필요한 이유</p>
                                  <p className="text-navy text-sm leading-relaxed whitespace-pre-wrap">{suggestion.reason}</p>
                                </div>
                              )}

                              {suggestion.expectedEffect && (
                                <div>
                                  <p className="text-navy/40 text-xs font-bold uppercase mb-1">기대 효과</p>
                                  <p className="text-navy text-sm leading-relaxed whitespace-pre-wrap">{suggestion.expectedEffect}</p>
                                </div>
                              )}

                              {/* 액션 버튼 */}
                              <div className="flex items-center gap-2 pt-2 border-t border-navy/[0.06]">
                                {suggestion.status !== 'approved' && (
                                  <button
                                    onClick={() => handleApprove(suggestion.id)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold
                                               hover:bg-green-600 transition-colors disabled:opacity-50"
                                  >
                                    {isProcessing ? '처리 중...' : '승인'}
                                  </button>
                                )}

                                {suggestion.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleReject(suggestion.id)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 rounded-xl bg-red-400 text-white text-sm font-bold
                                               hover:bg-red-500 transition-colors disabled:opacity-50"
                                  >
                                    {isProcessing ? '처리 중...' : '거부'}
                                  </button>
                                )}

                                {suggestion.status === 'approved' && (
                                  <button
                                    onClick={() => handleReject(suggestion.id)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 rounded-xl bg-orange text-white text-sm font-bold
                                               hover:bg-orange-dark transition-colors disabled:opacity-50"
                                  >
                                    {isProcessing ? '처리 중...' : '승인 취소'}
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDelete(suggestion.id)}
                                  disabled={isProcessing}
                                  className="px-4 py-2 rounded-xl border border-red-200 text-red-400 text-sm font-bold
                                             hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
