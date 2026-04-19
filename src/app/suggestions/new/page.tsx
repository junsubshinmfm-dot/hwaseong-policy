'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CATEGORIES, REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { submitSuggestion } from '@/lib/suggestions';
import { moderateContent } from '@/lib/moderation';
import Navbar from '@/components/shared/Navbar';
import GeoPattern from '@/components/shared/GeoPattern';

const categoryEntries = Object.entries(CATEGORIES) as [CategoryKey, (typeof CATEGORIES)[CategoryKey]][];
const regionEntries = Object.entries(REGIONS) as [RegionKey, (typeof REGIONS)[RegionKey]][];

export default function NewSuggestionPage() {
  const router = useRouter();
  const { status: geoStatus, closestRegion, requestLocation } = useGeoLocation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reason, setReason] = useState('');
  const [expectedEffect, setExpectedEffect] = useState('');
  const [nickname, setNickname] = useState('');
  const [region, setRegion] = useState<RegionKey | ''>('');
  const [category, setCategory] = useState<CategoryKey | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // GPS가 잡히면 지역 자동 설정
  const handleGeoClick = () => {
    requestLocation();
  };

  // GPS 결과 반영
  if (geoStatus === 'in_hwaseong' && closestRegion && !region) {
    setRegion(closestRegion);
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = '제목을 입력해주세요';
    if (!content.trim()) newErrors.content = '정책 내용을 입력해주세요';
    if (!nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요';
    if (!region) newErrors.region = '지역을 선택해주세요';
    if (!category) newErrors.category = '카테고리를 선택해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // GPS 검증
    if (geoStatus !== 'in_hwaseong') {
      setErrors({ geo: '화성시 위치에서만 정책을 제안할 수 있습니다. 위치 확인 버튼을 눌러주세요.' });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const fullText = [title.trim(), content.trim(), reason.trim(), expectedEffect.trim()]
        .filter(Boolean)
        .join('\n');

      const isApproved = moderateContent(fullText);
      const status = isApproved ? 'approved' : 'pending';

      const id = await submitSuggestion(
        {
          title: title.trim(),
          content: content.trim(),
          reason: reason.trim(),
          expectedEffect: expectedEffect.trim(),
          nickname: nickname.trim(),
          region: region as RegionKey,
          category: category as CategoryKey,
        },
        status
      );

      if (!id) {
        setResult({ status: 'error', message: 'Firebase 연결에 실패했습니다.' });
        return;
      }

      setResult({
        status,
        message: isApproved
          ? '정책 제안이 등록되었습니다!'
          : '제안이 접수되었습니다. 검토 후 게시됩니다.',
      });
    } catch {
      setResult({ status: 'error', message: '오류가 발생했습니다. 다시 시도해주세요.' });
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
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/suggestions')}
                className="px-6 py-3 rounded-xl bg-navy text-white font-bold hover:bg-navy-dark transition-colors"
              >
                제안 목록 보기
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setTitle('');
                  setContent('');
                  setReason('');
                  setExpectedEffect('');
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

        <div className="relative z-10 px-4 md:px-8 max-w-4xl mx-auto pt-10 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden shrink-0"
                style={{ background: 'linear-gradient(135deg, #F58220 0%, #F58220BB 100%)', boxShadow: '0 8px 32px #F5822040' }}>
                <div className="absolute inset-0 bg-white/[0.08]" />
                <svg className="w-8 h-8 relative z-[1]" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-3xl md:text-4xl font-black mb-1 drop-shadow-sm">정책 제안하기</h1>
                <p className="text-white/60 text-sm">화성시에 필요한 정책을 직접 제안해주세요</p>
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
          {/* GPS 위치 확인 */}
          <div className="p-6 border-b border-navy/[0.06]">
            <h3 className="text-navy font-bold text-base mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              위치 확인
              <span className="text-orange text-xs font-medium">(필수)</span>
            </h3>

            {geoStatus === 'idle' && (
              <button
                onClick={handleGeoClick}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-navy to-navy-light hover:shadow-lg hover:scale-[1.01] transition-all"
              >
                내 위치 확인하기
              </button>
            )}
            {geoStatus === 'loading' && (
              <div className="flex items-center justify-center py-3 gap-2">
                <div className="w-4 h-4 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
                <span className="text-navy/50 text-sm">위치 확인 중...</span>
              </div>
            )}
            {geoStatus === 'in_hwaseong' && (
              <div className="flex items-center gap-2 py-2 px-4 rounded-xl bg-green-50 text-green-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-bold">화성시 위치 확인 완료</span>
                {closestRegion && (
                  <span className="text-xs text-green-600 ml-1">
                    (가장 가까운 권역: {REGIONS[closestRegion].label})
                  </span>
                )}
              </div>
            )}
            {geoStatus === 'outside' && (
              <div className="py-2 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
                현재 화성시 범위 밖에 계십니다. 화성시 내에서만 제안이 가능합니다.
              </div>
            )}
            {(geoStatus === 'denied' || geoStatus === 'error') && (
              <div className="space-y-2">
                <div className="py-2 px-4 rounded-xl bg-orange/10 text-orange text-sm font-medium">
                  {geoStatus === 'denied' ? '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.' : '위치를 확인할 수 없습니다.'}
                </div>
                <button onClick={handleGeoClick} className="text-sm text-navy font-bold underline">다시 시도</button>
              </div>
            )}
            {errors.geo && <p className="text-red-500 text-xs mt-2">{errors.geo}</p>}
          </div>

          <div className="p-6 space-y-6">
            {/* 지역 선택 */}
            <div>
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
            <div>
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
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="표시될 닉네임을 입력해주세요"
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-navy/10 text-navy text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange
                           placeholder:text-navy/25 transition-all"
              />
              {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>}
            </div>

            {/* 선택 입력 영역 */}
            <div className="pt-4 border-t border-navy/[0.06]">
              <p className="text-navy/30 text-xs font-bold uppercase tracking-wider mb-4">선택 입력</p>

              {/* 필요한 이유 */}
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

              {/* 기대 효과 */}
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

            {/* 제출 에러 */}
            {result?.status === 'error' && (
              <div className="py-3 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
                {result.message}
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={submitting || geoStatus !== 'in_hwaseong'}
              className={`w-full py-4 rounded-xl text-base font-bold transition-all ${
                submitting || geoStatus !== 'in_hwaseong'
                  ? 'bg-navy/20 text-navy/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange to-orange-dark text-white hover:shadow-lg hover:scale-[1.01]'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  제출 중...
                </span>
              ) : geoStatus !== 'in_hwaseong' ? (
                '위치 확인 후 제안 가능합니다'
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
