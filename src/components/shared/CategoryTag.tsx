'use client';

import { CATEGORIES, type CategoryKey } from '@/data/categories';

interface CategoryTagProps {
  category: CategoryKey;
  size?: 'sm' | 'md';
  clickable?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export default function CategoryTag({
  category,
  size = 'sm',
  clickable = false,
  active = false,
  onClick,
}: CategoryTagProps) {
  const cat = CATEGORIES[category];
  if (!cat) return null;

  const sizeClasses =
    size === 'sm' ? 'text-sm px-2.5 py-1' : 'text-base px-3.5 py-1.5';

  const Tag = clickable ? 'button' : 'span';

  return (
    <Tag
      onClick={clickable ? onClick : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg font-bold transition-all duration-200 ${sizeClasses}
        ${clickable ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${active ? 'ring-2 ring-offset-1 ring-offset-transparent' : ''}
      `}
      style={{
        backgroundColor: active ? `${cat.color}30` : `${cat.color}15`,
        color: cat.color,
        ...(active ? { ringColor: cat.color } : {}),
      }}
    >
      <span className="leading-none">{cat.icon}</span>
      <span>{cat.label}</span>
    </Tag>
  );
}
