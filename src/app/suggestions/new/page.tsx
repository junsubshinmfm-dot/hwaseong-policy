'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CATEGORIES, REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';
import { submitSuggestion } from '@/lib/suggestions';
import { moderateContent } from '@/lib/moderation';
import Navbar from '@/components/shared/Navbar';
import GeoPattern from '@/components/shared/GeoPattern';

const FIELD_ORDER = [
  'region',
  'category',
  'title',
  'content',
  'nickname',
  'password',
  'realName',
  'phone',
  'consent',
] as const;

const FIELD_LABEL: Record<string, string> = {
  region: '권역',
  category: '분야',
  title: '정책 제목',
  content: '정책 내용',
  nickname: '닉네임',
  password: '수정 비밀번호',
  realName: '이름',
  phone: '전화번호',
  consent: '개인정보 수집 동의',
};

const categoryEntries = Object.entries(CATEGORIES) as [CategoryKey, (typeof CATEGORIES)[CategoryKey]][];
const regionEntries = Object.entries(REGIONS) as [RegionKey, (typeof REGIONS)[RegionKey]][];

export default function NewSuggestionPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reason, setReason] = useState('');
  const [expectedEffect, setExpectedEffect] = useState('');
  const [nickname, setNickname] = useState('');
  const [realName, setRealName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState<RegionKey | ''>('');
  const [category, setCategory] = useState<CategoryKey | ''>('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = '제목을 입력해주세요';
    if (!content.trim()) newErrors.content = '정책 내용을 입력해주세요';
    if (!nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요';
    if (!realName.trim()) newErrors.realName = '이름을 입력해주세요';
    if (!phone.trim()) newErrors.phone = '전화번호를 입력해주세요';
    if (phone.trim() && !/^[0-9-]+$/.test(phone.trim())) newErrors.phone = '숫자와 - 만 입력 가능합니다';
    if (!password.trim()) newErrors.password = '비밀번호를 입력해주세요';
    if (password.trim() && password.trim().length < 4) newErrors.password = '비밀번호는 4자 이상 입력해주세요';
    if (!region) newErrors.region = '지역을 선택해주세요';
    if (!category) newErrors.category = '카테고리를 선택해주세요';
    if (!consent) newErrors.consent = '개인정보 수집에 동의해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      // 검증 실패 시 — 첫 에러 필드로 스크롤 + 안내 메시지
      const firstErrorKey = FIELD_ORDER.find((k) => {
        // validate 후 errors 상태가 비동기적으로 반영되므로 직접 다시 검사
        if (k === 'region') return !region;
        if (k === 'category') return !category;
        if (k === 'title') return !title.trim();
        if (k === 'content') return !content.trim();
        if (k === 'nickname') return !nickname.trim();
        if (k === 'password') return !password.trim() || password.trim().length < 4;
        if (k === 'realName') return !realName.trim();
        if (k === 'phone') return !phone.trim() || !/^[0-9-]+$/.test(phone.trim());
        if (k === 'consent') return !consent;
        return false;
      });

      if (firstErrorKey) {
        const el = fieldRefs.current[firstErrorKey];
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // input/textarea면 포커스도
        if (el && 'focus' in el && typeof el.focus === 'function') {
          setTimeout(() => (el as HTMLInputElement).focus({ preventScroll: true }), 400);
        }
        setResult({
          status: 'error',
          message: `필수 항목 [${FIELD_LABEL[firstErrorKey]}] 을(를) 확인해주세요.`,
        });
      }
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const fullText = [title.trim(), content.trim(), reason.trim(), expectedEffect.trim()]
        .filter(Boolean)
        .join('\n');

      const moderation = moderateContent(fullText);

      // 1. 차단된 단어 포함 시 즉시 거부
      if (moderation === 'blocked') {
        setResult({
          status: 'error',
          message: '부적절한 표현(욕설, 비속어, 혐오 표현 등)이 포함되어 등록할 수 없습니다. 내용을 수정해주세요.',
        });
        setSubmitting(false);
        return;
      }

      const status: 'approved' | 'pending' = moderation === 'pending' ? 'pending' : 'approved';

      const id = await submitSuggestion(
        {
          title: title.trim(),
          content: content.trim(),
          reason: reason.trim(),
          expectedEffect: expectedEffect.trim(),
          nickname: nickname.trim(),
          realName: realName.trim(),
          phone: phone.trim(),
          password: password.trim(),
          region: region as RegionKey,
          category: category as CategoryKey,
        },
        status
      );

      if (!id) {
        setResult({ status: 'error', message: 'Firebase 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' });
        return;
      }

      setResult({
        status,
        message: status === 'approved'
          ? '정책 제안이 등록되었습니다!'
          : '제안이 접수되었습니다. 내용 검토 후 게시됩니다.',
      });
    } catch (err) {
      console.error('제안 제출 오류:', err);
      const message = err instanceof Error ? err.message : '알 수 없는 오류';
      setResult({ status: 'error', message: `오류가 발생했습니다: ${message}` });
    } finally {
      setSubmitting(false);
    }
  };

  // 제출 성공 화면
  if (result && result.status !== 'error') {
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
            <h2 className="text-navy text-2xl font-bold mb-2">
              {result.status === 'approved' ? '제안 등록 완료!' : '제안 접수 완료!'}
            </h2>
            <p className="text-navy/50 text-base mb-6">{result.message}</p>
            {result.status === 'pending' && (
              <p className="text-orange text-sm mb-6">
                내용 검토 후 게시됩니다. 잠시만 기다려주세요.
              </p>
            )}
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
                  setTitle(''); setContent(''); setReason(''); setExpectedEffect('');
                  setPassword(''); setRealName(''); setPhone(''); setConsent(false);
                }}
                className="px-6 py-3 rounded-xl border border-navy/10 text-navy font-bold hover:bg-navy-50 transition-colors"
              >
                새 제안 작성
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-black mb-1 drop-shadow-sm">정책 제안하기</h1>
                <p className="text-white/60 text-xs sm:text-sm">화성시에 필요한 정책을 직접 제안해주세요</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 폼 */}
      <div className="relative z-10 px-4 md:px-8 max-w-4xl mx-auto pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-navy/[0.06] overflow-hidden"
        >
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* 지역 선택 */}
            <div ref={(el) => { fieldRefs.current.region = el; }}>
              <label className="block text-navy font-bold text-sm mb-2">
                권역 선택 <span className="text-orange">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {regionEntries.map(([key, r]) => (
                  <button
                    key={key}
                    onClick={() => setRegion(key)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                      region === key
                        ? 'text-white shadow-md border-transparent'
                        : 'bg-white text-navy/50 border-navy/10 hover:bg-navy-50'
                    }`}
                    style={region === key ? { backgroundColor: r.color } : {}}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
            </div>

            {/* 카테고리 선택 */}
            <div ref={(el) => { fieldRefs.current.category = el; }}>
              <label className="block text-navy font-bold text-sm mb-2">
                분야 선택 <span className="text-orange">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categoryEntries.map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all border ${
                      category === key
                        ? 'text-white shadow-md border-transparent'
                        : 'bg-white text-navy/50 border-navy/10 hover:bg-navy-50'
                    }`}
                    style={category === key ? { backgroundColor: cat.color } : {}}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-navy font-bold text-sm mb-2">
                정책 제목 <span className="text-orange">*</span>
              </label>
              <input
                ref={(el) => { fieldRefs.current.title = el; }}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제안하실 정책의 제목을 입력해주세요"
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

            {/* 정책 내용 */}
            <div>
              <label className="block text-navy font-bold text-sm mb-2">
                정책 내용 <span className="text-orange">*</span>
              </label>
              <textarea
                ref={(el) => { fieldRefs.current.content = el; }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="제안하실 정책의 구체적인 내용을 작성해주세요"
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                           placeholder:text-navy/25 transition-all"
              />
              <div className="flex justify-between mt-1">
                {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
                <p className="text-navy/20 text-xs ml-auto">{content.length}/1000</p>
              </div>
            </div>

            {/* 닉네임 */}
            <div>
              <label className="block text-navy font-bold text-sm mb-2">
                닉네임 <span className="text-orange">*</span>
              </label>
              <input
                ref={(el) => { fieldRefs.current.nickname = el; }}
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="사이트에 공개될 닉네임"
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                           placeholder:text-navy/25 transition-all"
              />
              {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-navy font-bold text-sm mb-2">
                수정 비밀번호 <span className="text-orange">*</span>
              </label>
              <input
                ref={(el) => { fieldRefs.current.password = el; }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="나중에 수정할 때 사용할 비밀번호 (4자 이상)"
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                           placeholder:text-navy/25 transition-all"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-navy/20 text-xs mt-1">본인 제안을 수정/삭제할 때 필요합니다</p>
            </div>

            {/* 개인정보 섹션 */}
            <div className="pt-4 border-t border-navy/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-navy font-bold text-sm">개인정보 (운영자만 확인)</p>
              </div>
              <p className="text-navy/50 text-xs mb-4 leading-relaxed">
                제안해주신 정책이 좋은 정책으로 판단될 경우, <span className="text-orange font-bold">정명근 예비후보 공약에 반영</span>하여<br className="hidden sm:inline" />
                직접 연락드리고 반영 내용을 알려드리기 위해 수집합니다.
              </p>

              <div className="space-y-4">
                {/* 이름 */}
                <div>
                  <label className="block text-navy font-bold text-sm mb-2">
                    이름 <span className="text-orange">*</span>
                  </label>
                  <input
                    ref={(el) => { fieldRefs.current.realName = el; }}
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="실명을 입력해주세요"
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
                    ref={(el) => { fieldRefs.current.phone = el; }}
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
                </div>

                {/* 개인정보 수집 동의 */}
                <div ref={(el) => { fieldRefs.current.consent = el; }} className="p-4 rounded-xl bg-navy-50/50 border border-navy/[0.06]">
                  <p className="font-bold text-navy text-sm mb-3">[개인정보 수집 및 이용 동의]</p>

                  <div className="text-navy/70 text-xs leading-relaxed space-y-3 mb-3">
                    <div>
                      <p className="font-bold text-navy/80 mb-0.5">① 수집 항목</p>
                      <p>이름, 전화번호</p>
                    </div>
                    <div>
                      <p className="font-bold text-navy/80 mb-0.5">② 수집 목적</p>
                      <p>제안하신 정책에 대한 자세한 피드백을 듣기 및 공약 반영 시 연락 목적</p>
                    </div>
                    <div>
                      <p className="font-bold text-navy/80 mb-0.5">③ 보유 기간</p>
                      <p>제9회 전국동시지방선거 종료 후 3개월 이내 즉시 파기</p>
                    </div>
                    <div>
                      <p className="font-bold text-navy/80 mb-0.5">④ 거부 권리</p>
                      <p>동의를 거부할 권리가 누구에게나 있으며, 동의 하에 수집된 정보는 <b className="text-navy">운영자만 열람</b>하며 외부에 공개되지 않습니다. 다만 거부 시 제안하신 공약이 선정되어도 <b className="text-orange">연락드리기 어려울 수 있습니다.</b> 아무쪼록 동의를 부탁드립니다.</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/60 border border-navy/[0.04] mb-3">
                    <p className="text-navy/50 text-[11px] leading-relaxed">🔒 정보주체는 언제든지 연락하여 열람·정정·삭제를 요청할 수 있으며, 제3자에게 제공·공개하지 않습니다.</p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-navy/30 text-orange focus:ring-orange/30"
                    />
                    <span className="text-navy font-bold text-sm">위 개인정보 수집 및 이용에 동의합니다</span>
                  </label>
                  {errors.consent && <p className="text-red-500 text-xs mt-2">{errors.consent}</p>}
                </div>
              </div>
            </div>

            {/* 선택 입력 영역 */}
            <div className="pt-4 border-t border-navy/[0.06]">
              <p className="text-navy/30 text-xs font-bold uppercase tracking-wider mb-4">선택 입력</p>

              <div className="mb-4">
                <label className="block text-navy font-bold text-sm mb-2">필요한 이유</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="이 정책이 필요한 이유를 알려주세요 (선택)"
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm resize-none
                             focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                             placeholder:text-navy/25 transition-all"
                />
                <p className="text-navy/20 text-xs text-right mt-1">{reason.length}/500</p>
              </div>

              <div>
                <label className="block text-navy font-bold text-sm mb-2">기대 효과</label>
                <textarea
                  value={expectedEffect}
                  onChange={(e) => setExpectedEffect(e.target.value)}
                  placeholder="이 정책이 시행되면 어떤 변화가 있을지 알려주세요 (선택)"
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm resize-none
                             focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                             placeholder:text-navy/25 transition-all"
                />
                <p className="text-navy/20 text-xs text-right mt-1">{expectedEffect.length}/500</p>
              </div>
            </div>

            {result?.status === 'error' && (
              <div className="py-3 px-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                </svg>
                <span>{result.message}</span>
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
                  제출 중...
                </span>
              ) : (
                '정책 제안하기'
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
