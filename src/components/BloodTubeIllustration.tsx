import React from 'react';
import { TubeKey, TUBES } from '../data/hemoData';

interface BloodTubeIllustrationProps {
  tubeKey: TubeKey;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const TUBE_MARKS: Record<
  Exclude<TubeKey, 'cult'>,
  { labelCode: string; fillLineY: number; liquidTopY: number; isTall?: boolean }
> = {
  red: { labelCode: 'CLOT', fillLineY: 29, liquidTopY: 33 },
  blue: { labelCode: '9:1', fillLineY: 25, liquidTopY: 26 },
  green: { labelCode: 'HEP', fillLineY: 30, liquidTopY: 34 },
  purple: { labelCode: 'EDTA', fillLineY: 32, liquidTopY: 35 },
  lav: { labelCode: 'ABO', fillLineY: 31, liquidTopY: 35, isTall: true },
  grey: { labelCode: 'NaF', fillLineY: 34, liquidTopY: 37 },
};

export const BloodTubeIllustration: React.FC<BloodTubeIllustrationProps> = ({
  tubeKey,
  size = 'md',
}) => {
  const tube = TUBES[tubeKey];

  const sizeClass =
    size === 'sm'
      ? 'w-8 h-13'
      : size === 'lg'
        ? 'w-12 h-22'
        : size === 'xl'
          ? 'w-14 h-26'
          : 'w-10 h-17';

  if (tubeKey === 'cult') {
    return (
      <div
        className={`${sizeClass} shrink-0 flex items-center justify-center`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 44 74" className="w-full h-full drop-shadow-xs">
          {/* Flip-off golden culture cap */}
          <rect x="13" y="2" width="18" height="7.5" rx="2.5" fill={tube.color} />
          <rect x="15" y="9.5" width="14" height="4" rx="1" fill="#94a3b8" />
          {/* Bottle neck and shoulder */}
          <path
            d="M15 13.5 L15 20 L8.5 27 L8.5 63 C8.5 67 11.5 70 15.5 70 L28.5 70 C32.5 70 35.5 67 35.5 63 L35.5 27 L29 20 L29 13.5 Z"
            fill="#ffffff"
            fillOpacity="0.92"
            stroke="#cbd5e1"
            strokeWidth="1.8"
          />
          {/* Culture broth liquid */}
          <path
            d="M10 38 L34 38 L34 62.5 C34 65.8 31.5 68.2 28.2 68.2 L15.8 68.2 C12.5 68.2 10 65.8 10 62.5 Z"
            fill={tube.color}
            fillOpacity="0.28"
          />
          <ellipse cx="22" cy="38" rx="12" ry="1.8" fill={tube.color} fillOpacity="0.35" />
          {/* Printed bottle label */}
          <rect
            x="11"
            y="41"
            width="22"
            height="19"
            rx="2"
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <rect x="11" y="41" width="22" height="4.5" rx="1" fill={tube.color} />
          <text
            x="22"
            y="53"
            textAnchor="middle"
            fontSize="6.5"
            fontWeight="700"
            fill="#334155"
            fontFamily="monospace"
          >
            HC
          </text>
          <line x1="14.5" y1="56.5" x2="29.5" y2="56.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" />
          {/* Glass highlight */}
          <line x1="12" y1="28" x2="12" y2="58" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>
    );
  }

  const meta = TUBE_MARKS[tubeKey];
  const isTall = !!meta.isTall;
  const viewBox = isTall ? '0 0 38 78' : '0 0 38 70';
  const bottomY = isTall ? 65 : 57;
  const arcBottomY = isTall ? 75 : 67;

  return (
    <div
      className={`${sizeClass} shrink-0 flex items-center justify-center`}
      aria-hidden="true"
    >
      <svg viewBox={viewBox} className="w-full h-full drop-shadow-xs">
        {/* Safety Hemogard Cap */}
        <rect x="7.5" y="2" width="23" height="11.5" rx="3.5" fill={tube.color} />
        <rect x="10.5" y="4" width="17" height="2" rx="1" fill="#ffffff" opacity="0.28" />
        <rect x="6.5" y="11" width="25" height="4.5" rx="1.5" fill={tube.color} opacity="0.9" />

        {/* Glass Tube Body */}
        <path
          d={`M10.5 15.5 L10.5 ${bottomY} C10.5 ${bottomY + 6} 14 ${arcBottomY} 19 ${arcBottomY} C24 ${arcBottomY} 27.5 ${bottomY + 6} 27.5 ${bottomY} L27.5 15.5 Z`}
          fill="#ffffff"
          fillOpacity="0.92"
          stroke="#cbd5e1"
          strokeWidth="1.8"
        />

        {/* Sample / Additive Tint */}
        <path
          d={`M11.7 ${meta.liquidTopY} L26.3 ${meta.liquidTopY} L26.3 ${bottomY} C26.3 ${bottomY + 5} 23.2 ${arcBottomY - 1.5} 19 ${arcBottomY - 1.5} C14.8 ${arcBottomY - 1.5} 11.7 ${bottomY + 5} 11.7 ${bottomY} Z`}
          fill={tube.color}
          fillOpacity="0.24"
        />

        {/* Clot activator stipples for Red tube */}
        {tubeKey === 'red' && (
          <g fill={tube.color} opacity="0.45">
            <circle cx="15" cy="48" r="0.9" />
            <circle cx="22" cy="51" r="0.9" />
            <circle cx="18" cy="55" r="0.9" />
          </g>
        )}

        {/* Printed Clinical Label */}
        <rect
          x="12"
          y={meta.liquidTopY + 3}
          width="14"
          height={isTall ? 21 : 16}
          rx="1.5"
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth="0.9"
        />
        <rect
          x="12"
          y={meta.liquidTopY + 3}
          width="14"
          height="3.5"
          rx="0.8"
          fill={tube.color}
        />
        <text
          x="19"
          y={meta.liquidTopY + 13}
          textAnchor="middle"
          fontSize="4.6"
          fontWeight="700"
          fill="#334155"
          fontFamily="monospace"
        >
          {meta.labelCode}
        </text>
        <line
          x1="14"
          y1={meta.liquidTopY + 16}
          x2="24"
          y2={meta.liquidTopY + 16}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Required Fill Line Marker */}
        <line
          x1="11.5"
          y1={meta.fillLineY}
          x2="18.5"
          y2={meta.fillLineY}
          stroke={tubeKey === 'blue' ? '#0284c7' : '#64748b'}
          strokeWidth={tubeKey === 'blue' ? '1.6' : '1.2'}
          strokeDasharray={tubeKey === 'blue' ? undefined : '2 1.5'}
        />
        {tubeKey === 'blue' && (
          <polygon points={`8,${meta.fillLineY - 2} 11,${meta.fillLineY} 8,${meta.fillLineY + 2}`} fill="#0284c7" />
        )}

        {/* Glass reflection */}
        <line
          x1="13.5"
          y1="19"
          x2="13.5"
          y2={bottomY - 4}
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>
    </div>
  );
};
