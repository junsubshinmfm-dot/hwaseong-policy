'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { submitFeedback } from '@/lib/feedbacks';
import Navbar from '@/components/shared/Navbar';
import GeoPattern from '@/components/shared/GeoPattern';

export default function NewFeedbackPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [realName, setRealName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = '제목을 입력해주세요';
    if (!content.trim()) newErrors.content = '내용을 입력해주세요';
    if (!realName.trim()) newErrors.realName = '이름을 입력해주세요';
    if (!phone.trim()) newErrors.phone = '전화번호를 입력해주세요';
    if (phone.trim() && !/^[0-9-]+$/.test(phone.trim())) newErrors.phone = '숫자와 - 만 입력 가능합니다';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setResult(null);

    try {
      const id = await submitFeedback({
        title: title.trim(),
        content: content.trim(),
        realName: realName.trim(),
        phone: phone.trim(),
      });

      if (!id) {
        setResult({ status: 'error', message: 'Firebase 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' });
        return;
      }

      setResult({ status: 'success', message: '건의가 정상적으로 접수되었습니다. 캠프에서 확인 후 필요 시 연락드리겠습니다.' });
    } catch (err) {
      console.error('건의 제출 오류:', err);
      const message = err instanceof Error ? err.message : '알 수 없는 오류';
      setResult({ status: 'error', message: `오류가 발생했습니다: ${message}` });
    } finally {
      setSubmitting(false);
    }
  };

  if (result && result.status === 'success') {
    return (
      <main className="min-h-screen bg-[#F4F5F9]">
        <Navbar />
        <div className="pt-24 px-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 text-center shadow-lg border border-navy/[0.06]"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-navy text-2xl font-bold mb-2">건의 접수 완료!</h2>
            <p className="text-navy/60 text-base mb-6 whitespace-pre-wrap">{result.message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/main')}
                className="px-6 py-3 rounded-xl bg-navy text-white font-bold hover:bg-navy-dark transition-colors"
              >
                메인으로
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setTitle(''); setContent(''); setRealName(''); setPhone('');
                }}
                className="px-6 py-3 rounded-xl border border-navy/10 text-navy font-bold hover:bg-navy-50 transition-colors"
              >
                새 건의 작성
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F5F9] relative overflow-hidden">
      <Navbar />

      {/* 히어로 */}
      <div className="relative pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg, #0D1F4D 0%, #F5822030 40%, #F4F5F9 100%)',
          }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border-[4px] border-white/[0.06]" />
        </div>
        <div className="absolute top-16 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-navy" />
          <div className="w-32 bg-orange" />
        </div>

        <div className="relative z-10 px-4 md:px-8 max-w-4xl mx-auto pt-8 pb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden shrink-0"
                style={{ background: 'linear-gradient(135deg, #F58220 0%, #F58220BB 100%)', boxShadow: '0 8px 32px #F5822040' }}>
                <div className="absolute inset-0 bg-white/[0.08]" />
                <svg className="w-6 h-6 sm:w-8 sm:h-8 relative z-[1]" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-black mb-1 drop-shadow-sm">건의합니다</h1>
                <p className="text-white/60 text-xs sm:text-sm">캠프에 전하고 싶은 말씀을 직접 보내주세요</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 안내 박스 */}
      <div className="relative z-10 px-4 md:px-8 max-w-4xl mx-auto mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange/5 border border-orange/20 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange/15 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 text-sm leading-relaxed text-navy/80">
              <p className="font-bold text-navy mb-1.5">건의합니다는 공식 정책 제안과 다릅니다</p>
              <p className="mb-2">
                공식 정책 제안은 아니어도 <b className="text-orange">캠프에 전하고 싶은 내용</b>이 있으시면
                자유롭게 보내주세요. 캠프에서 직접 받아봅니다.
              </p>
              <p className="text-navy/60 text-xs">
                · 이 글은 사이트에 공개되지 않으며, <b>관리자(캠프)만 확인</b>합니다.<br />
                · 메일로 보내셔도 됩니다 —{' '}
                <a href="mailto:jmg78359@gmail.com" className="text-orange font-bold underline underline-offset-2">
                  jmg78359@gmail.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 폼 */}
      <div className="relative z-10 px-4 md:px-8 max-w-4xl mx-auto pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-navy/[0.06] overflow-hidden"
        >
          <div className="p-4 sm:p-6 space-y-5">
            {/* 제목 */}
            <div>
              <label className="block text-navy font-bold text-sm mb-2">
                제목 <span className="text-orange">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="건의하실 내용의 제목을 입력해주세요"
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                           placeholder:text-navy/25 transition-all"
              />
              <div className="flex justify-between mt-1">
                {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                <p className="text-navy/20 text-xs ml-auto">{title.length}/50</p>
              </div>
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-navy font-bold text-sm mb-2">
                내용 <span className="text-orange">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="캠프에 전하고 싶은 내용을 자유롭게 작성해주세요"
                rows={7}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                           placeholder:text-navy/25 transition-all"
              />
              <div className="flex justify-between mt-1">
                {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
                <p className="text-navy/20 text-xs ml-auto">{content.length}/2000</p>
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-navy font-bold text-sm mb-2">
                이름 <span className="text-orange">*</span>
              </label>
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="성함을 입력해주세요"
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                           placeholder:text-navy/25 transition-all"
              />
              {errors.realName && <p className="text-red-500 text-xs mt-1">{errors.realName}</p>}
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-navy font-bold text-sm mb-2">
                전화번호 <span className="text-orange">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                maxLength={15}
                className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                           placeholder:text-navy/25 transition-all"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              <p className="text-navy/40 text-xs mt-1.5">
                입력하신 연락처는 캠프 관리자만 확인하며, 필요 시 회신 목적으로만 사용됩니다.
              </p>
            </div>

            {result?.status === 'error' && (
              <div className="py-3 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
                {result.message}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-4 rounded-xl text-base font-bold transition-all ${
                submitting
                  ? 'bg-navy/20 text-navy/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange to-orange-dark text-white hover:shadow-lg hover:scale-[1.01]'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  전송 중...
                </span>
              ) : (
                '건의하기'
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <GeoPattern variant="strip" className="w-full h-12" />
      <GeoPattern variant="corner-br" className="w-[250px] h-[250px] z-0 opacity-60" />
    </main>
  );
}
