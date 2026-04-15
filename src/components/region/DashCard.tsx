'use client';

import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

interface DashItem {
  label: string;
  value: string | number;
}

interface DashCardProps {
  title: string;
  icon: string;
  color: string;
  items: DashItem[];
  chartData?: number[];
}

export default function DashCard({ title, icon, color, items, chartData }: DashCardProps) {
  const chart = chartData?.map((v, i) => ({ idx: i, val: v })) ?? [];

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-white border border-navy/[0.06] shadow-[0_2px_16px_rgba(26,59,143,0.06)] hover:shadow-[0_8px_32px_rgba(26,59,143,0.10)] transition-shadow duration-300">
      {/* 상단 컬러 헤더 영역 */}
      <div
        className="relative px-3 pt-3 pb-2 sm:px-5 sm:pt-5 sm:pb-4 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}0A 0%, ${color}15 100%)` }}
      >
        {/* 장식 */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07]" style={{ backgroundColor: color }} />
        <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full border-[3px] opacity-[0.10]" style={{ borderColor: color }} />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-xl shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${color}20 0%, ${color}35 100%)`,
                border: `1px solid ${color}25`,
              }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-navy font-extrabold text-sm sm:text-base leading-tight">{title}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: `${color}50` }} />
              </div>
            </div>
          </div>

          {chart.length > 0 && (
            <div className="w-20 h-10 opacity-80" style={{ minWidth: 80, minHeight: 40 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#grad-${title})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 데이터 항목 */}
      <div className="px-3 py-2 sm:px-5 sm:py-4">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-5 sm:gap-y-4">
          {items.map((item, i) => (
            <div key={item.label} className="relative">
              {i < items.length - 1 && i % 2 === 0 && (
                <div className="absolute right-0 top-1 bottom-1 w-px bg-navy/[0.06] hidden sm:block" />
              )}
              <p className="text-navy/30 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest mb-0.5">
                {item.label}
              </p>
              <p className="text-navy text-sm sm:text-xl font-black leading-none">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
