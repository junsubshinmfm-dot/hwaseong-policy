'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REGIONS, CATEGORIES } from '@/data/categories';

const regionEntries = Object.entries(REGIONS) as [string, { label: string; color: string }][];
const categoryEntries = Object.entries(CATEGORIES) as [string, { label: string; color: string; icon: string }][];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [regionDropdown, setRegionDropdown] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* 상단 블루+오렌지 악센트 라인 */}
      <div className="h-1 flex">
        <div className="flex-1 bg-navy" />
        <div className="w-40 bg-orange" />
      </div>

      <div className="glass border-b border-navy-100/30">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* ── 로고: 정명근 후보 BI ── */}
          <Link href="/main" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/jmg-logo.png`}
              alt="정명근 · 대한민국 1등 도시 화성"
              className="w-auto object-contain h-10 sm:h-12 lg:h-14"
            />
          </Link>

          {/* ── Desktop Nav: 지도 / 권역 / 카테고리 / 검색 ── */}
          <div className="hidden md:flex items-center gap-1">
            {/* 지도 */}
            <Link
              href="/main"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/main')
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-gray-500 hover:text-navy hover:bg-navy-50'
              }`}
            >
              지도
            </Link>

            {/* 권역 드롭다운 */}
            <div
              className="relative"
              onMouseEnter={() => setRegionDropdown(true)}
              onMouseLeave={() => setRegionDropdown(false)}
            >
              <button
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1 ${
                  isActive('/region')
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-gray-500 hover:text-navy hover:bg-navy-50'
                }`}
              >
                권역
                <svg className={`w-3.5 h-3.5 transition-transform ${regionDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {regionDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-48 py-2 rounded-xl bg-white shadow-xl border border-navy-100/30"
                  >
                    {regionEntries.map(([id, region]) => (
                      <Link
                        key={id}
                        href={`/region/${id}`}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all ${
                          pathname === `/region/${id}`
                            ? 'text-white'
                            : 'text-gray-600 hover:text-navy hover:bg-navy-50/50'
                        }`}
                        style={pathname === `/region/${id}` ? { backgroundColor: region.color } : {}}
                      >
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: pathname === `/region/${id}` ? 'rgba(255,255,255,0.25)' : `${region.color}15`,
                          }}
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                              fill={pathname === `/region/${id}` ? 'white' : region.color} opacity="0.8" />
                            <circle cx="12" cy="9" r="2.5"
                              fill={pathname === `/region/${id}` ? region.color : 'white'} />
                          </svg>
                        </span>
                        <div className="flex flex-col">
                          <span>{region.label}</span>
                        </div>
                        <span
                          className="ml-auto w-1.5 h-6 rounded-full"
                          style={{ backgroundColor: pathname === `/region/${id}` ? 'rgba(255,255,255,0.3)' : region.color }}
                        />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 카테고리 드롭다운 */}
            <div
              className="relative"
              onMouseEnter={() => setCategoryDropdown(true)}
              onMouseLeave={() => setCategoryDropdown(false)}
            >
              <button
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1
                  text-gray-500 hover:text-navy hover:bg-navy-50`}
              >
                카테고리
                <svg className={`w-3.5 h-3.5 transition-transform ${categoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {categoryDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-52 py-2 rounded-xl bg-white shadow-xl border border-navy-100/30"
                  >
                    {categoryEntries.map(([key, cat]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setCategoryDropdown(false);
                          router.push(`/search?category=${key}`);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                                   text-gray-600 hover:text-navy hover:bg-navy-50/50"
                      >
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                          style={{ backgroundColor: `${cat.color}15` }}
                        >
                          {cat.icon}
                        </span>
                        <span>{cat.label}</span>
                        <span
                          className="ml-auto w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 정책제안 */}
            <Link
              href="/suggestions/new"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/suggestions')
                  ? 'bg-orange text-white shadow-sm'
                  : 'text-gray-500 hover:text-navy hover:bg-navy-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              정책제안
            </Link>

            {/* 건의합니다 */}
            <Link
              href="/feedback/new"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/feedback')
                  ? 'bg-orange text-white shadow-sm'
                  : 'text-gray-500 hover:text-navy hover:bg-navy-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              건의합니다
            </Link>

            {/* 검색 */}
            <Link
              href="/search"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/search')
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-gray-500 hover:text-navy hover:bg-navy-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              검색
            </Link>

          </div>

          {/* ── Mobile ── */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/search" className="p-2 text-gray-500 hover:text-navy">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-500 hover:text-navy">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-navy-100/20 bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              <Link href="/main" onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold ${isActive('/main') ? 'bg-navy text-white' : 'text-gray-600'}`}>
                지도
              </Link>

              <div className="px-4 py-2 text-xs text-navy/30 uppercase tracking-wider font-bold">권역</div>
              {regionEntries.map(([id, region]) => (
                <Link key={id} href={`/region/${id}`} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-base font-medium ${
                    pathname === `/region/${id}` ? 'bg-navy-50 text-navy' : 'text-gray-600'
                  }`}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: region.color }} />
                  {region.label}
                </Link>
              ))}

              <div className="px-4 py-2 text-xs text-orange/50 uppercase tracking-wider font-bold">카테고리</div>
              {categoryEntries.map(([key, cat]) => (
                <button key={key}
                  onClick={() => { setMobileOpen(false); router.push(`/search?category=${key}`); }}
                  className="w-full flex items-center gap-3 px-6 py-3 rounded-xl text-base font-medium text-gray-600 hover:bg-navy-50">
                  <span className="text-base">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}

              <Link href="/suggestions/new" onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold ${isActive('/suggestions') ? 'bg-orange text-white' : 'text-gray-600'}`}>
                정책제안
              </Link>

              <Link href="/feedback/new" onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold ${isActive('/feedback') ? 'bg-orange text-white' : 'text-gray-600'}`}>
                건의합니다
              </Link>

              <Link href="/search" onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold ${isActive('/search') ? 'bg-navy text-white' : 'text-gray-600'}`}>
                검색
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
