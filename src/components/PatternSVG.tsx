import React from 'react';
//import { useTranslation } from 'react-i18next';
import type { PaperSettings } from '../types/paper';

interface PatternSVGProps {
  settings: PaperSettings;
  width: number; // in mm
  height: number; // in mm
  pageIndex: number;
}

export const PatternSVG: React.FC<PatternSVGProps> = ({ settings, width, height, pageIndex }) => {
  //const { t } = useTranslation();
  const { pattern, spacing, lineColor, lineWidth, margin, showLineNumbers, startNumber, totalLines } = settings;
  
  const contentWidth = width - (margin * 2);
  const contentHeight = height - (margin * 2);

  // Calculate rows/lines per page
  const linesPerPage = Math.floor(contentHeight / spacing);
  const linesOnThisPage = Math.min(linesPerPage, totalLines - (pageIndex * linesPerPage));

  const patternId = `grid-pattern-${pageIndex}`;

  const renderBackgroundPattern = () => {
    if (pattern === 'grid') {
      return (
        <pattern id={patternId} x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <path d={`M ${spacing} 0 L 0 0 0 ${spacing}`} fill="none" stroke={lineColor} strokeWidth={lineWidth} />
        </pattern>
      );
    }
    if (pattern === 'dots') {
      return (
        <pattern id={patternId} x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <circle cx={spacing} cy={spacing} r={lineWidth * 2} fill={lineColor} />
        </pattern>
      );
    }
    if (pattern === 'triangular') {
      const h = spacing * 0.866025; // Height of an equilateral triangle
      return (
        <pattern id={patternId} x="0" y="0" width={spacing} height={h * 2} patternUnits="userSpaceOnUse">
          {/* Main path for triangular/isometric grid */}
          <path 
            d={`M 0 0 L ${spacing} 0 M 0 ${h} L ${spacing} ${h} M 0 0 L ${spacing / 2} ${h} L 0 ${h * 2} M ${spacing} 0 L ${spacing / 2} ${h} L ${spacing} ${h * 2}`} 
            fill="none" 
            stroke={lineColor} 
            strokeWidth={lineWidth} 
          />
        </pattern>
      );
    }
    return null;
  };

  const renderManualLines = () => {
    const elements = [];
    
    if (pattern === 'ruled') {
      elements.push(
        <line key="line-top" x1={margin} y1={margin} x2={width - margin} y2={margin} stroke={lineColor} strokeWidth={lineWidth} />
      );
      for (let i = 0; i < linesPerPage; i++) {
        const y = margin + (i + 1) * spacing;
        elements.push(
          <line key={`line-${i}`} x1={margin} y1={y} x2={width - margin} y2={y} stroke={lineColor} strokeWidth={lineWidth} />
        );
      }
    } else if (pattern === 'staff') {
      const staffSpacing = spacing / 4;
      const stavesPerPage = Math.floor(contentHeight / (spacing * 2));
      for (let s = 0; s < stavesPerPage; s++) {
        const staffYBase = margin + (s + 0.5) * (spacing * 2);
        for (let i = 0; i < 5; i++) {
          const y = staffYBase + i * staffSpacing;
          elements.push(
            <line key={`staff-${s}-line-${i}`} x1={margin} y1={y} x2={width - margin} y2={y} stroke={lineColor} strokeWidth={lineWidth} />
          );
        }
      }
    } else if (pattern === 'calligraphy') {
      const rowSpacing = spacing * 3;
      const rowsPerPage = Math.floor(contentHeight / rowSpacing);
      for (let r = 0; r < rowsPerPage; r++) {
        const top = margin + r * rowSpacing + spacing;
        const xTop = top;
        const xBottom = top + spacing;
        const ascTop = top - spacing;
        const descBottom = top + spacing * 2;
        elements.push(
          <rect key={`calig-band-${r}`} x={margin} y={xTop} width={contentWidth} height={spacing} fill={lineColor} fillOpacity={0.15} stroke="none" />,
          <line key={`calig-asc-${r}`} x1={margin} y1={ascTop} x2={width - margin} y2={ascTop} stroke={lineColor} strokeWidth={lineWidth} strokeDasharray={`${lineWidth * 4} ${lineWidth * 4}`} />,
          <line key={`calig-xtop-${r}`} x1={margin} y1={xTop} x2={width - margin} y2={xTop} stroke={lineColor} strokeWidth={lineWidth} />,
          <line key={`calig-base-${r}`} x1={margin} y1={xBottom} x2={width - margin} y2={xBottom} stroke={lineColor} strokeWidth={lineWidth * 1.5} />,
          <line key={`calig-desc-${r}`} x1={margin} y1={descBottom} x2={width - margin} y2={descBottom} stroke={lineColor} strokeWidth={lineWidth} strokeDasharray={`${lineWidth * 4} ${lineWidth * 4}`} />
        );
      }
    }
    return elements;
  };

  const renderLineNumbers = () => {
    if (!showLineNumbers || pattern !== 'ruled') return null;
    const numbers = [];
    const boxSize = spacing * 0.8;
    const fontSize = spacing * 0.4;
    for (let i = 0; i < linesOnThisPage; i++) {
      const lineNum = startNumber + pageIndex * linesPerPage + i;
      if (lineNum > totalLines) break;
      const isMultipleOfFive = lineNum % 5 === 0;
      const yPos = margin + (i + 0.5) * spacing;
      numbers.push(
        <g key={`num-${i}`}>
          <rect x={margin - boxSize - 2} y={yPos - boxSize / 2} width={boxSize} height={boxSize} fill={isMultipleOfFive ? lineColor : 'white'} stroke={lineColor} strokeWidth={lineWidth} rx={1} />
          <text x={margin - boxSize / 2 - 2} y={yPos} fontSize={fontSize} fontWeight={isMultipleOfFive ? 'bold' : 'normal'} fill={isMultipleOfFive ? 'white' : lineColor} textAnchor="middle" dominantBaseline="middle" className="select-none">
            {lineNum}
          </text>
        </g>
      );
    }
    return numbers;
  };

  return (
    <svg width={`${width}mm`} height={`${height}mm`} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>{renderBackgroundPattern()}</defs>
      <rect x="0" y="0" width={width} height={height} fill="white" />
      {(pattern === 'grid' || pattern === 'dots' || pattern === 'triangular') && (
        <rect x={margin} y={margin} width={contentWidth} height={contentHeight} fill={`url(#${patternId})`} />
      )}
      {renderManualLines()}
      {renderLineNumbers()}
      {settings.watermark && (
        <text x={width / 2} y={height / 2} fontSize={width / 5} fill={lineColor} fillOpacity={settings.watermarkOpacity} textAnchor="middle" dominantBaseline="middle" transform={`rotate(-45, ${width / 2}, ${height / 2})`} className="select-none pointer-events-none">
          {settings.watermark}
        </text>
      )}
      {(settings.header || settings.headerSecondary) && (
        <g className="select-none">
          {settings.header && (
            <text 
              x={width / 2} 
              y={settings.headerSecondary ? margin * 0.42 : margin / 2} 
              fontSize={margin * 0.32} 
              fontWeight="bold" 
              fill={lineColor} 
              textAnchor="middle" 
              dominantBaseline="middle"
            >
              {settings.header}
            </text>
          )}
          {settings.headerSecondary && (
            <text 
              x={width / 2} 
              y={settings.header ? margin * 0.72 : margin / 2} 
              fontSize={margin * 0.22} 
              fill={lineColor} 
              textAnchor="middle" 
              dominantBaseline="middle"
              fillOpacity={0.7}
            >
              {settings.headerSecondary}
            </text>
          )}
        </g>
      )}
      {/* Footer and Page Number */}
      <g className="select-none">
        {settings.footer && (
          <text 
            x={width / 2} 
            y={settings.showPageNumber ? height - (margin / 2) - (Math.max(3, margin / 4) * 0.6) : height - margin / 2} 
            fontSize={Math.max(3, margin / 4)} 
            fill={lineColor} 
            textAnchor="middle" 
            dominantBaseline="middle"
          >
            {settings.footer}
          </text>
        )}
        {settings.showPageNumber && (
          <text 
            x={width / 2} 
            y={settings.footer ? height - (margin / 2) + (Math.max(3, margin / 4) * 0.6) : height - margin / 2} 
            fontSize={Math.max(3, margin / 4) * 0.8} 
            fill={lineColor} 
            textAnchor="middle" 
            dominantBaseline="middle"
            fillOpacity={settings.footer ? 0.7 : 1}
          >
            {pageIndex + 1}
          </text>
        )}
      </g>
    </svg>
  );
};
