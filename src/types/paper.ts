export type PatternType = 'ruled' | 'grid' | 'dots' | 'staff' | 'calligraphy' | 'triangular';

export interface PaperSettings {
  pattern: PatternType;
  spacing: number; // in mm
  lineColor: string;
  lineWidth: number; // in mm
  header: string;
  headerSecondary: string;
  footer: string;
  watermark: string;
  watermarkOpacity: number;
  
  // Ruled specific
  showLineNumbers: boolean;
  totalLines: number;
  startNumber: number;
  
  // Page settings
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margin: number; // in mm
  zoom: number; // multiplier
  pageCount: number;
  showPageNumber: boolean;
}

export const PATTERN_DEFAULTS: Record<PatternType, Partial<PaperSettings>> = {
  ruled: {
    spacing: 8.5,
    lineColor: '#4e4431',
    lineWidth: 0.2,
    margin: 20,
    orientation: 'portrait',
    pageCount: 1,
  },
  grid: {
    spacing: 3,
    lineColor: '#c7c3bc',
    lineWidth: 0.2,
    margin: 0,
    orientation: 'portrait',
    pageCount: 1,
  },
  dots: {
    spacing: 3,
    lineColor: '#c7c3bc',
    lineWidth: 0.2,
    margin: 0,
    orientation: 'portrait',
    pageCount: 1,
  },
  staff: {
    spacing: 8.5,
    lineColor: '#4e4431',
    lineWidth: 0.2,
    margin: 20,
    orientation: 'portrait',
    pageCount: 1,
  },
  calligraphy: {
    spacing: 5,
    lineColor: '#4e4431',
    lineWidth: 0.2,
    margin: 12,
    orientation: 'landscape',
    pageCount: 1,
  },
  triangular: {
    spacing: 3,
    lineColor: '#c7c3bc',
    lineWidth: 0.2,
    margin: 0,
    orientation: 'portrait',
    pageCount: 1,
  },
};

export const DEFAULT_SETTINGS: PaperSettings = {
  pattern: 'ruled',
  ...PATTERN_DEFAULTS.ruled,
  header: '',
  headerSecondary: '',
  footer: '',
  watermark: '',
  watermarkOpacity: 0.1,
  showLineNumbers: false,
  totalLines: 30,
  startNumber: 1,
  pageSize: 'A4',
  orientation: 'portrait',
  zoom: 1,
  pageCount: 1,
  showPageNumber: false,
} as PaperSettings;
