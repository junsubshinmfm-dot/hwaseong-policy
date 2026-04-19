'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeComments, submitComment, deleteComment } from '@/lib/comments';
import type { Comment } from '@/types/suggestion';

interface CommentSectionProps {
  suggestionId: string;
}

export default function CommentSection({ suggestionId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeComments(suggestionId, setComments);
    return () => { unsubscribe?.(); };
  }, [suggestionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim() || !content.trim() || !password.trim()) {
      setError('모든 항목을 입력해주세요');
      return;
    }
    if (password.trim().length < 4) {
      setError('비밀번호는 4자 이상 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      await submitComment(suggestionId, {
        nickname: nickname.trim(),
        content: content.trim(),
        password: password.trim(),
      });
      setNickname('');
      setContent('');
      setPassword('');
    } catch {
      setError('댓글 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment: Comment) => {
    if (deletePassword !== comment.password) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }
    await deleteComment(suggestionId, comment.id);
    setDeletingId(null);
    setDeletePassword('');
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* 제목 */}
      <div className="flex items-center justify-between">
        <h3 className="text-navy font-bold text-base flex items-center gap-2">
          <svg className="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          댓글 <span className="text-orange">{comments.length}</span>
        </h3>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-2">
        <AnimatePresence>
          {comments.length === 0 ? (
            <p className="text-navy/30 text-sm text-center py-6">첫 번째 댓글을 남겨보세요!</p>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-navy-50/50 rounded-xl px-4 py-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-navy font-bold text-sm">{comment.nickname}</span>
                    <span className="text-navy/30 text-xs">{formatDate(comment.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => setDeletingId(deletingId === comment.id ? null : comment.id)}
                    className="text-navy/20 hover:text-red-400 text-xs font-medium transition-colors"
                  >
                    삭제
                  </button>
                </div>
                <p className="text-navy/70 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                {/* 삭제 비밀번호 확인 */}
                <AnimatePresence>
                  {deletingId === comment.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="비밀번호"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-navy/10 text-navy text-xs
                                     focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                        <button
                          onClick={() => handleDelete(comment)}
                          className="px-3 py-1.5 rounded-lg bg-red-400 text-white text-xs font-bold hover:bg-red-500 transition-colors"
                        >
                          삭제
                        </button>
                        <button
                          onClick={() => { setDeletingId(null); setDeletePassword(''); }}
                          className="px-3 py-1.5 rounded-lg bg-navy-100 text-navy/50 text-xs font-bold hover:bg-navy-50 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="space-y-2 bg-navy-50/30 rounded-xl p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            maxLength={15}
            className="flex-1 px-3 py-2 rounded-lg border border-navy/10 text-navy text-sm
                       focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                       placeholder:text-navy/30"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            maxLength={20}
            className="w-28 px-3 py-2 rounded-lg border border-navy/10 text-navy text-sm
                       focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                       placeholder:text-navy/30"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="의견을 남겨주세요"
          rows={2}
          maxLength={500}
          className="w-full px-3 py-2 rounded-lg border border-navy/10 text-navy text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                     placeholder:text-navy/30"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 rounded-lg bg-navy text-white text-sm font-bold hover:bg-navy-dark transition-colors disabled:opacity-50"
        >
          {submitting ? '등록 중...' : '댓글 등록'}
        </button>
      </form>
    </div>
  );
}
