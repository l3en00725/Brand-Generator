import React from 'react';
import { Image, Share2, Grid3X3, FileText, Check } from 'lucide-react';

const AssetPreviewList: React.FC = () => {
  const categories = [
    { icon: Image, label: '6 Logo variants', color: 'text-blue-400' },
    { icon: Share2, label: '4 Social banners', color: 'text-purple-400' },
    { icon: Grid3X3, label: '6 Favicon sizes', color: 'text-green-400' },
    { icon: FileText, label: 'Color palette JSON', color: 'text-orange-400' },
  ];

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-3 font-mono">
        What you get
      </p>
      <ul className="space-y-2">
        {categories.map((cat, idx) => (
          <li key={idx} className="flex items-center gap-2 text-xs text-gray-400">
            <Check size={12} className="text-brand-400" />
            <cat.icon size={12} className={cat.color} />
            <span>{cat.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssetPreviewList;

