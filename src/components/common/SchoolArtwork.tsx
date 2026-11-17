import React from 'react';
import { GalleryItem } from '../../types/school';

export const SchoolCrest: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M20 3L35 9V20C35 29.2 28.6 35.6 20 38C11.4 35.6 5 29.2 5 20V9L20 3Z"
      fill="#0F2544"
      stroke="#1F467A"
      strokeWidth="1.5"
    />
    <path d="M11 25L20 13L29 25H11Z" fill="none" stroke="#FFFFFF" strokeWidth="1.75" strokeLinejoin="round" />
    <path d="M16 25L20 19.5L24 25" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="12" y1="29" x2="28" y2="29" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CampusHeroIllustration: React.FC = () => (
  <div className="relative w-full h-full min-h-[320px] lg:min-h-[420px] rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between p-6">
    <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-b border-slate-100 pb-3">
      <span>Lalitpur Campus · Est. 2055 BS</span>
      <span className="tabular-nums">Grades 1–12</span>
    </div>

    <svg
      viewBox="0 0 640 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto my-2"
      role="img"
      aria-label="Architectural elevation illustration of Sagarmatha Valley Academy campus"
    >
      {/* Distant Himalayan ridgeline */}
      <path
        d="M0 175 L85 112 L155 152 L245 86 L340 144 L445 78 L535 138 L640 105 L640 245 L0 245 Z"
        fill="#EEF2F6"
      />
      <path
        d="M245 86 L274 114 L250 116 L232 104 Z"
        fill="#FFFFFF"
        opacity="0.9"
      />
      <path
        d="M445 78 L475 106 L450 108 L428 96 Z"
        fill="#FFFFFF"
        opacity="0.9"
      />

      {/* Ground baseline */}
      <rect x="0" y="245" width="640" height="95" fill="#F6F7F9" />
      <line x1="24" y1="245" x2="616" y2="245" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Left Wing - Library & Humanities */}
      <rect x="48" y="165" width="144" height="80" fill="#FFFFFF" stroke="#0F2544" strokeWidth="1.75" />
      <path d="M40 165 L120 132 L200 165 Z" fill="#16345E" />
      {[68, 100, 132, 160].map((x) => (
        <rect key={x} x={x} y="184" width="14" height="24" rx="1" fill="#E2E8F0" stroke="#3B6699" strokeWidth="1" />
      ))}

      {/* Central Academic Building */}
      <rect x="208" y="130" width="224" height="115" fill="#FFFFFF" stroke="#0F2544" strokeWidth="2" />
      <path d="M198 130 L320 92 L442 130 Z" fill="#0F2544" />
      {/* Clock / Crest gable */}
      <circle cx="320" cy="113" r="10" fill="#FFFFFF" stroke="#3B6699" strokeWidth="1.5" />
      <line x1="320" y1="113" x2="320" y2="107" stroke="#0F2544" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="320" y1="113" x2="325" y2="115" stroke="#0F2544" strokeWidth="1.5" strokeLinecap="round" />

      {/* Central colonnade windows */}
      {[228, 260, 356, 388].map((x) => (
        <g key={x}>
          <rect x={x} y="150" width="18" height="28" rx="1" fill="#E2E8F0" stroke="#3B6699" strokeWidth="1" />
          <rect x={x} y="192" width="18" height="28" rx="1" fill="#E2E8F0" stroke="#3B6699" strokeWidth="1" />
        </g>
      ))}
      {/* Main Entrance Arch */}
      <rect x="296" y="182" width="48" height="63" fill="#0F2544" />
      <rect x="303" y="190" width="15" height="55" fill="#3B6699" opacity="0.55" />
      <rect x="322" y="190" width="15" height="55" fill="#3B6699" opacity="0.55" />

      {/* Right Wing - Science & Labs */}
      <rect x="448" y="165" width="144" height="80" fill="#FFFFFF" stroke="#0F2544" strokeWidth="1.75" />
      <path d="M440 165 L520 132 L600 165 Z" fill="#16345E" />
      {[468, 500, 532, 560].map((x) => (
        <rect key={x} x={x} y="184" width="14" height="24" rx="1" fill="#E2E8F0" stroke="#3B6699" strokeWidth="1" />
      ))}

      {/* Courtyard trees & steps */}
      <rect x="282" y="245" width="76" height="8" fill="#CBD5E1" />
      <rect x="272" y="253" width="96" height="8" fill="#E2E8F0" />
      <circle cx="198" cy="222" r="14" fill="#DCE5EE" stroke="#3B6699" strokeWidth="1.2" />
      <line x1="198" y1="230" x2="198" y2="245" stroke="#0F2544" strokeWidth="1.5" />
      <circle cx="442" cy="222" r="14" fill="#DCE5EE" stroke="#3B6699" strokeWidth="1.2" />
      <line x1="442" y1="230" x2="442" y2="245" stroke="#0F2544" strokeWidth="1.5" />

      {/* Flagpole */}
      <line x1="320" y1="62" x2="320" y2="92" stroke="#0F2544" strokeWidth="1.5" />
      <path d="M320 62 L338 69 L320 75 Z" fill="#1F467A" />
    </svg>

    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
      <div>
        <div className="text-slate-500">Academic Blocks</div>
        <div className="font-semibold text-slate-900 tabular-nums mt-0.5">3 Connected Wings</div>
      </div>
      <div>
        <div className="text-slate-500">Laboratories</div>
        <div className="font-semibold text-slate-900 tabular-nums mt-0.5">Physics · Chem · CS</div>
      </div>
      <div>
        <div className="text-slate-500">Library Collection</div>
        <div className="font-semibold text-slate-900 tabular-nums mt-0.5">11,400+ Volumes</div>
      </div>
    </div>
  </div>
);

export const GalleryIllustration: React.FC<{
  type: GalleryItem['illustrationType'];
  tone?: GalleryItem['accentTone'];
  className?: string;
}> = ({ type, className = 'w-full h-48' }) => {
  return (
    <div className={`${className} bg-[#F1F4F8] border-b border-slate-200 flex items-center justify-center overflow-hidden`}>
      <svg viewBox="0 0 320 180" fill="none" className="w-full h-full" aria-hidden="true">
        <rect width="320" height="180" fill="#F1F4F8" />
        {type === 'library' && (
          <g>
            <rect x="44" y="34" width="232" height="112" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            {[64, 114, 164, 214].map((x) => (
              <g key={x}>
                <line x1={x} y1="48" x2={x + 36} y2="48" stroke="#0F2544" strokeWidth="2" />
                <rect x={x + 2} y="54" width="8" height="22" fill="#3B6699" />
                <rect x={x + 12} y="58" width="8" height="18" fill="#0F2544" />
                <rect x={x + 22} y="52" width="10" height="24" fill="#94A3B8" />
                <line x1={x} y1="94" x2={x + 36} y2="94" stroke="#0F2544" strokeWidth="2" />
                <rect x={x + 4} y="100" width="9" height="22" fill="#1F467A" />
                <rect x={x + 16} y="104" width="12" height="18" fill="#CBD5E1" />
              </g>
            ))}
          </g>
        )}
        {type === 'science' && (
          <g>
            <rect x="40" y="132" width="240" height="10" fill="#0F2544" />
            <path d="M110 42 L110 88 L86 132 L144 132 L120 88 L120 42 Z" fill="#FFFFFF" stroke="#0F2544" strokeWidth="2" />
            <path d="M94 114 L136 114 L142 130 L88 130 Z" fill="#3B6699" opacity="0.3" />
            <rect x="180" y="54" width="14" height="78" rx="7" fill="#FFFFFF" stroke="#0F2544" strokeWidth="2" />
            <rect x="208" y="64" width="14" height="68" rx="7" fill="#FFFFFF" stroke="#0F2544" strokeWidth="2" />
            <circle cx="248" cy="64" r="18" fill="none" stroke="#3B6699" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="248" cy="64" r="6" fill="#0F2544" />
          </g>
        )}
        {type === 'campus' && (
          <g>
            <path d="M30 135 L160 55 L290 135" fill="#FFFFFF" stroke="#0F2544" strokeWidth="2" />
            <rect x="56" y="100" width="208" height="45" fill="#FFFFFF" stroke="#0F2544" strokeWidth="1.75" />
            <rect x="142" y="108" width="36" height="37" fill="#0F2544" />
            <rect x="76" y="110" width="24" height="20" fill="#E2E8F0" stroke="#3B6699" />
            <rect x="220" y="110" width="24" height="20" fill="#E2E8F0" stroke="#3B6699" />
          </g>
        )}
        {type === 'sports' && (
          <g>
            <rect x="36" y="42" width="248" height="96" rx="4" fill="#FFFFFF" stroke="#0F2544" strokeWidth="2" />
            <line x1="160" y1="42" x2="160" y2="138" stroke="#3B6699" strokeWidth="1.5" />
            <circle cx="160" cy="90" r="22" fill="none" stroke="#3B6699" strokeWidth="1.5" />
            <path d="M36 66 A 24 24 0 0 1 36 114" fill="none" stroke="#0F2544" strokeWidth="1.5" />
            <path d="M284 66 A 24 24 0 0 0 284 114" fill="none" stroke="#0F2544" strokeWidth="1.5" />
          </g>
        )}
        {type === 'assembly' && (
          <g>
            <rect x="115" y="46" width="90" height="58" fill="#0F2544" />
            <rect x="135" y="56" width="50" height="8" fill="#FFFFFF" opacity="0.85" />
            <rect x="145" y="70" width="30" height="5" fill="#93C5FD" />
            {[72, 112, 152, 192, 232].map((cx) => (
              <g key={cx}>
                <circle cx={cx + 8} cy="122" r="7" fill="#3B6699" />
                <path d={`M${cx} 145 C${cx} 135 ${cx + 16} 135 ${cx + 16} 145`} fill="#0F2544" />
              </g>
            ))}
          </g>
        )}
        {type === 'arts' && (
          <g>
            <rect x="58" y="38" width="120" height="100" fill="#FFFFFF" stroke="#0F2544" strokeWidth="1.75" />
            <path d="M76 118 L112 72 L140 102 L156 84 L166 118 Z" fill="#CBD5E1" stroke="#3B6699" strokeWidth="1.5" />
            <circle cx="144" cy="60" r="10" fill="#0F2544" />
            <rect x="200" y="54" width="60" height="84" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="220" cy="78" r="7" fill="#0F2544" />
            <circle cx="242" cy="78" r="7" fill="#3B6699" />
            <circle cx="231" cy="102" r="7" fill="#64748B" />
          </g>
        )}
      </svg>
    </div>
  );
};
