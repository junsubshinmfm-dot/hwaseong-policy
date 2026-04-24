'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';
import {
  subscribeAllSuggestions,
  updateSuggestionStatus,
  deleteSuggestion,
  updateSuggestion,
  submitSuggestion,
} from '@/lib/suggestions';
import {
  subscribeAllFeedbacks,
  markFeedbackViewed,
  deleteFeedback,
} from '@/lib/feedbacks';
import { subscribeVisitorStats, type VisitorStats } from '@/lib/analytics';
import type { Suggestion } from '@/types/suggestion';
import type { Feedback } from '@/types/feedback';

const ADMIN_PASSWORD = '6517';
const categoryEntries = Object.entries(CATEGORIES) as [CategoryKey, (typeof CATEGORIES)[CategoryKey]][];
const regionEntries = Object.entries(REGIONS) as [RegionKey, (typeof REGIONS)[RegionKey]][];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'suggestions' | 'feedbacks' | 'stats'>('suggestions');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Suggestion>>({});
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '', content: '', reason: '', expectedEffect: '',
    nickname: '관리자', region: '' as RegionKey | '', category: '' as CategoryKey | '',
  });

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const unsubscribe = subscribeAllSuggestions((data) => setSuggestions(data));
    return () => { unsubscribe?.(); };
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) return;
    const unsubscribe = subscribeAllFeedbacks((data) => setFeedbacks(data));
    return () => { unsubscribe?.(); };
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) return;
    const unsubscribe = subscribeVisitorStats((data) => setVisitorStats(data));
    return () => { unsubscribe?.(); };
  }, [authenticated]);

  const feedbackUnreadCount = useMemo(
    () => feedbacks.filter((f) => !f.viewed).length,
    [feedbacks]
  );

  const handleToggleFeedbackViewed = async (id: string, viewed: boolean) => {
    setProcessing(id);
    await markFeedbackViewed(id, viewed);
    setProcessing(null);
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('이 건의를 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    setProcessing(id);
    await deleteFeedback(id);
    setProcessing(null);
    setExpandedId(null);
  };

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
    setExpandedId(null);
  };

  const startEdit = (suggestion: Suggestion) => {
    setEditingId(suggestion.id);
    setEditForm({
      title: suggestion.title,
      content: suggestion.content,
      reason: suggestion.reason || '',
      expectedEffect: suggestion.expectedEffect || '',
      nickname: suggestion.nickname,
      region: suggestion.region,
      category: suggestion.category,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setProcessing(editingId);
    await updateSuggestion(editingId, editForm);
    setProcessing(null);
    setEditingId(null);
    setEditForm({});
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.content || !uploadForm.region || !uploadForm.category) {
      alert('제목, 내용, 지역, 카테고리는 필수입니다.');
      return;
    }
    setProcessing('upload');
    await submitSuggestion(
      {
        title: uploadForm.title,
        content: uploadForm.content,
        reason: uploadForm.reason,
        expectedEffect: uploadForm.expectedEffect,
        nickname: uploadForm.nickname || '관리자',
        realName: '',
        phone: '',
        password: '',
        region: uploadForm.region as RegionKey,
        category: uploadForm.category as CategoryKey,
      },
      'approved'
    );
    setProcessing(null);
    setShowUploadForm(false);
    setUploadForm({
      title: '', content: '', reason: '', expectedEffect: '',
      nickname: '관리자', region: '', category: '',
    });
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
            <button onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-navy text-white font-bold text-sm hover:bg-navy-dark transition-colors">
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
            <h1 className="text-2xl font-bold">관리자 대시보드</h1>
            <p className="text-white/50 text-sm mt-1">
              {tab === 'suggestions'
                ? '시민 정책제안을 검토, 수정, 등록합니다'
                : tab === 'feedbacks'
                ? '캠프로 들어온 건의사항을 확인합니다'
                : '사이트 접속자 통계를 확인합니다'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tab === 'suggestions' && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-4 py-2 rounded-xl bg-orange text-white text-sm font-bold hover:bg-orange-dark transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                새 제안 등록
              </button>
            )}
            <button
              onClick={() => { setAuthenticated(false); sessionStorage.removeItem('admin_auth'); }}
              className="px-4 py-2 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/20 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 상단 탭 */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => { setTab('suggestions'); setExpandedId(null); }}
              className={`px-5 py-3 rounded-t-xl text-sm font-bold transition-colors ${
                tab === 'suggestions' ? 'bg-[#F4F5F9] text-navy' : 'text-white/60 hover:text-white'
              }`}
            >
              정책제안 <span className="ml-1 opacity-60">{suggestions.length}</span>
            </button>
            <button
              onClick={() => { setTab('feedbacks'); setExpandedId(null); }}
              className={`px-5 py-3 rounded-t-xl text-sm font-bold transition-colors flex items-center gap-1.5 ${
                tab === 'feedbacks' ? 'bg-[#F4F5F9] text-navy' : 'text-white/60 hover:text-white'
              }`}
            >
              건의사항 <span className="opacity-60">{feedbacks.length}</span>
              {feedbackUnreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-orange text-white text-[10px] font-bold">
                  NEW {feedbackUnreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setTab('stats'); setExpandedId(null); }}
              className={`px-5 py-3 rounded-t-xl text-sm font-bold transition-colors flex items-center gap-1.5 ${
                tab === 'stats' ? 'bg-[#F4F5F9] text-navy' : 'text-white/60 hover:text-white'
              }`}
            >
              접속자 통계
              {visitorStats && visitorStats.online > 0 && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {visitorStats.online}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6" hidden={tab !== 'suggestions'}>
        {/* 새 제안 등록 폼 */}
        <AnimatePresence>
          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-2xl border border-navy/[0.06] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-navy font-bold text-lg">새 제안 등록 (관리자)</h2>
                  <button onClick={() => setShowUploadForm(false)} className="text-navy/30 hover:text-navy">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-navy/60 text-xs font-bold mb-1">지역 *</label>
                    <select value={uploadForm.region}
                      onChange={(e) => setUploadForm({ ...uploadForm, region: e.target.value as RegionKey })}
                      className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy">
                      <option value="">선택</option>
                      {regionEntries.map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-navy/60 text-xs font-bold mb-1">카테고리 *</label>
                    <select value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as CategoryKey })}
                      className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy">
                      <option value="">선택</option>
                      {categoryEntries.map(([k, c]) => <option key={k} value={k}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <input type="text" value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="제목 *" className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy" />
                  <textarea value={uploadForm.content}
                    onChange={(e) => setUploadForm({ ...uploadForm, content: e.target.value })}
                    placeholder="정책 내용 *" rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy resize-none" />
                  <input type="text" value={uploadForm.nickname}
                    onChange={(e) => setUploadForm({ ...uploadForm, nickname: e.target.value })}
                    placeholder="작성자 닉네임" className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy" />
                  <textarea value={uploadForm.reason}
                    onChange={(e) => setUploadForm({ ...uploadForm, reason: e.target.value })}
                    placeholder="필요한 이유 (선택)" rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy resize-none" />
                  <textarea value={uploadForm.expectedEffect}
                    onChange={(e) => setUploadForm({ ...uploadForm, expectedEffect: e.target.value })}
                    placeholder="기대 효과 (선택)" rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy resize-none" />
                </div>
                <button onClick={handleUpload}
                  disabled={processing === 'upload'}
                  className="px-6 py-2.5 rounded-xl bg-orange text-white font-bold text-sm hover:bg-orange-dark transition-colors disabled:opacity-50">
                  {processing === 'upload' ? '등록 중...' : '바로 등록 (승인 상태)'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                const isEditing = editingId === suggestion.id;
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
                      onClick={() => { setExpandedId(isExpanded ? null : suggestion.id); setEditingId(null); }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          suggestion.status === 'pending' ? 'bg-orange' :
                          suggestion.status === 'approved' ? 'bg-green-500' : 'bg-red-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-navy font-bold text-base">{suggestion.title}</h3>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                              style={{ backgroundColor: `${catMeta?.color}15`, color: catMeta?.color }}>
                              {catMeta?.icon} {catMeta?.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                              style={{ backgroundColor: `${regionMeta?.color}15`, color: regionMeta?.color }}>
                              {regionMeta?.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-navy/35">
                            <span>{suggestion.nickname}</span>
                            <span>{dateStr}</span>
                            <span>좋아요 {suggestion.likes}</span>
                          </div>
                        </div>
                        <svg className={`w-5 h-5 text-navy/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              {isEditing ? (
                                /* 수정 폼 */
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-navy/40 text-xs font-bold mb-1">지역</label>
                                      <select value={editForm.region || ''}
                                        onChange={(e) => setEditForm({ ...editForm, region: e.target.value as RegionKey })}
                                        className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy">
                                        {regionEntries.map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-navy/40 text-xs font-bold mb-1">카테고리</label>
                                      <select value={editForm.category || ''}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as CategoryKey })}
                                        className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy">
                                        {categoryEntries.map(([k, c]) => <option key={k} value={k}>{c.icon} {c.label}</option>)}
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-navy/40 text-xs font-bold mb-1">제목</label>
                                    <input type="text" value={editForm.title || ''}
                                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                      className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy" />
                                  </div>
                                  <div>
                                    <label className="block text-navy/40 text-xs font-bold mb-1">정책 내용</label>
                                    <textarea value={editForm.content || ''}
                                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                      rows={4} className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy resize-none" />
                                  </div>
                                  <div>
                                    <label className="block text-navy/40 text-xs font-bold mb-1">닉네임</label>
                                    <input type="text" value={editForm.nickname || ''}
                                      onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                                      className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy" />
                                  </div>
                                  <div>
                                    <label className="block text-navy/40 text-xs font-bold mb-1">필요한 이유</label>
                                    <textarea value={editForm.reason || ''}
                                      onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                                      rows={2} className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy resize-none" />
                                  </div>
                                  <div>
                                    <label className="block text-navy/40 text-xs font-bold mb-1">기대 효과</label>
                                    <textarea value={editForm.expectedEffect || ''}
                                      onChange={(e) => setEditForm({ ...editForm, expectedEffect: e.target.value })}
                                      rows={2} className="w-full px-3 py-2 rounded-lg border border-navy/10 text-sm text-navy resize-none" />
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={handleSaveEdit} disabled={isProcessing}
                                      className="px-4 py-2 rounded-xl bg-navy text-white text-sm font-bold hover:bg-navy-dark transition-colors disabled:opacity-50">
                                      {isProcessing ? '저장 중...' : '저장'}
                                    </button>
                                    <button onClick={() => setEditingId(null)}
                                      className="px-4 py-2 rounded-xl border border-navy/10 text-navy/50 text-sm font-bold hover:bg-navy-50 transition-colors">
                                      취소
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* 보기 모드 */
                                <>
                                  {/* 개인정보 (관리자 전용) */}
                                  {(suggestion.realName || suggestion.phone) && (
                                    <div className="p-3 rounded-xl bg-orange/5 border border-orange/20">
                                      <p className="text-orange text-[10px] font-bold uppercase mb-2 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        개인정보 (관리자 전용)
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        {suggestion.realName && (
                                          <div>
                                            <span className="text-navy/40 text-xs">이름: </span>
                                            <span className="text-navy font-bold">{suggestion.realName}</span>
                                          </div>
                                        )}
                                        {suggestion.phone && (
                                          <div>
                                            <span className="text-navy/40 text-xs">전화: </span>
                                            <a href={`tel:${suggestion.phone}`} className="text-navy font-bold hover:text-orange transition-colors">
                                              {suggestion.phone}
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
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
                                </>
                              )}

                              {/* 액션 버튼 */}
                              {!isEditing && (
                                <div className="flex items-center gap-2 pt-2 border-t border-navy/[0.06] flex-wrap">
                                  {suggestion.status !== 'approved' && (
                                    <button onClick={() => handleApprove(suggestion.id)} disabled={isProcessing}
                                      className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50">
                                      {isProcessing ? '처리 중...' : '승인'}
                                    </button>
                                  )}
                                  {suggestion.status !== 'rejected' && (
                                    <button onClick={() => handleReject(suggestion.id)} disabled={isProcessing}
                                      className="px-4 py-2 rounded-xl bg-red-400 text-white text-sm font-bold hover:bg-red-500 transition-colors disabled:opacity-50">
                                      {isProcessing ? '처리 중...' : suggestion.status === 'approved' ? '승인 취소' : '거부'}
                                    </button>
                                  )}
                                  <button onClick={() => startEdit(suggestion)}
                                    className="px-4 py-2 rounded-xl bg-navy text-white text-sm font-bold hover:bg-navy-dark transition-colors">
                                    수정
                                  </button>
                                  <button onClick={() => handleDelete(suggestion.id)} disabled={isProcessing}
                                    className="px-4 py-2 rounded-xl border border-red-200 text-red-400 text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto">
                                    삭제
                                  </button>
                                </div>
                              )}
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

      {/* 건의사항 탭 */}
      <div className="max-w-5xl mx-auto px-4 py-6" hidden={tab !== 'feedbacks'}>
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-navy/[0.06] p-12 text-center">
            <p className="text-navy/30 text-base">접수된 건의사항이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {feedbacks.map((fb) => {
                const date = new Date(fb.createdAt);
                const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                const isExpanded = expandedId === fb.id;
                const isProcessing = processing === fb.id;

                return (
                  <motion.div
                    key={fb.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                      !fb.viewed ? 'border-orange/40 ring-1 ring-orange/20' : 'border-navy/[0.06]'
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-navy-50/30 transition-colors"
                      onClick={async () => {
                        const nextExpanded = isExpanded ? null : fb.id;
                        setExpandedId(nextExpanded);
                        if (!isExpanded && !fb.viewed) {
                          await markFeedbackViewed(fb.id, true);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          !fb.viewed ? 'bg-orange' : 'bg-navy/20'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-navy font-bold text-base">{fb.title}</h3>
                            {!fb.viewed && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-orange/10 text-orange">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-navy/35">
                            <span>{fb.realName}</span>
                            <span>{fb.phone}</span>
                            <span>{dateStr}</span>
                          </div>
                        </div>
                        <svg className={`w-5 h-5 text-navy/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

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
                              <div className="p-3 rounded-xl bg-orange/5 border border-orange/20">
                                <p className="text-orange text-[10px] font-bold uppercase mb-2 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  연락처 (관리자 전용)
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-navy/40 text-xs">이름: </span>
                                    <span className="text-navy font-bold">{fb.realName}</span>
                                  </div>
                                  <div>
                                    <span className="text-navy/40 text-xs">전화: </span>
                                    <a href={`tel:${fb.phone}`} className="text-navy font-bold hover:text-orange transition-colors">
                                      {fb.phone}
                                    </a>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="text-navy/40 text-xs font-bold uppercase mb-1">건의 내용</p>
                                <p className="text-navy text-sm leading-relaxed whitespace-pre-wrap">{fb.content}</p>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-navy/[0.06] flex-wrap">
                                <button
                                  onClick={() => handleToggleFeedbackViewed(fb.id, !fb.viewed)}
                                  disabled={isProcessing}
                                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
                                    fb.viewed
                                      ? 'bg-navy/10 text-navy hover:bg-navy/20'
                                      : 'bg-green-500 text-white hover:bg-green-600'
                                  }`}
                                >
                                  {isProcessing ? '처리 중...' : fb.viewed ? '미확인으로 돌리기' : '확인 완료'}
                                </button>
                                <button
                                  onClick={() => handleDeleteFeedback(fb.id)}
                                  disabled={isProcessing}
                                  className="px-4 py-2 rounded-xl border border-red-200 text-red-400 text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
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

      {/* 접속자 통계 탭 */}
      <div className="max-w-5xl mx-auto px-4 py-6" hidden={tab !== 'stats'}>
        {!visitorStats ? (
          <div className="bg-white rounded-2xl border border-navy/[0.06] p-12 text-center">
            <p className="text-navy/30 text-base">통계를 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 주요 지표 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 실시간 접속자 */}
              <div className="bg-white rounded-2xl border border-navy/[0.06] shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex w-2.5 h-2.5">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-green-500" />
                  </span>
                  <p className="text-navy/50 text-xs font-bold uppercase tracking-wide">실시간 접속자</p>
                </div>
                <p className="text-navy text-4xl font-bold tabular-nums">
                  {visitorStats.online.toLocaleString()}
                </p>
                <p className="text-navy/30 text-xs mt-1">최근 1분 내 활성 사용자</p>
              </div>

              {/* 오늘 */}
              <div className="bg-white rounded-2xl border border-navy/[0.06] shadow-sm p-5">
                <p className="text-navy/50 text-xs font-bold uppercase tracking-wide mb-2">오늘 접속자</p>
                <p className="text-navy text-4xl font-bold tabular-nums">
                  {visitorStats.todayUv.toLocaleString()}
                </p>
                <p className="text-navy/30 text-xs mt-1">
                  페이지뷰 {visitorStats.todayPv.toLocaleString()}회
                </p>
              </div>

              {/* 누적 */}
              <div className="bg-white rounded-2xl border border-navy/[0.06] shadow-sm p-5">
                <p className="text-navy/50 text-xs font-bold uppercase tracking-wide mb-2">누적 접속자</p>
                <p className="text-navy text-4xl font-bold tabular-nums">
                  {visitorStats.totalUnique.toLocaleString()}
                </p>
                <p className="text-navy/30 text-xs mt-1">
                  누적 페이지뷰 {visitorStats.total.toLocaleString()}회
                </p>
              </div>
            </div>

            {/* 일별 추이 */}
            <div className="bg-white rounded-2xl border border-navy/[0.06] shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-navy font-bold text-lg">일별 접속자 추이</h2>
                <p className="text-navy/30 text-xs">최근 30일</p>
              </div>
              {visitorStats.daily.length === 0 ? (
                <p className="text-navy/30 text-sm text-center py-8">데이터가 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const rows = visitorStats.daily.slice(0, 30);
                    const maxPv = Math.max(...rows.map((r) => r.pv), 1);
                    return rows.map((row) => {
                      const [, m, d] = row.date.split('-');
                      const width = Math.max((row.pv / maxPv) * 100, 2);
                      return (
                        <div key={row.date} className="flex items-center gap-3">
                          <span className="text-navy/40 text-xs font-mono w-12 shrink-0">
                            {m}.{d}
                          </span>
                          <div className="flex-1 relative h-6 bg-navy-50 rounded-lg overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-navy/70 to-navy rounded-lg transition-all"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <span className="text-navy text-xs font-bold tabular-nums w-16 text-right shrink-0">
                            {row.uv.toLocaleString()}명
                          </span>
                          <span className="text-navy/40 text-xs tabular-nums w-20 text-right shrink-0">
                            PV {row.pv.toLocaleString()}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
