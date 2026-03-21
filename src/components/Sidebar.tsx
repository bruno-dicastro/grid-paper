import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PaperSettings, PatternType } from '../types/paper';
import { PATTERN_DEFAULTS } from '../types/paper';
import { Settings, Type, Layout, Grid, Hash, Maximize, RotateCcw } from 'lucide-react';

interface SidebarProps {
  settings: PaperSettings;
  setSettings: React.Dispatch<React.SetStateAction<PaperSettings>>;
  isOpen: boolean;
  onClose: () => void;
}

const ICON_COLOR = "#8b5e3c"; // Brown Leather

export const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, isOpen, onClose }) => {
  const { t } = useTranslation();

  const handleChange = (key: keyof PaperSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const defaults = PATTERN_DEFAULTS[settings.pattern];
    setSettings((prev) => ({
      ...prev,
      ...defaults
    }));
  };

  const patterns: { label: string; value: PatternType }[] = [
    { label: t('sidebar.patterns.ruled'), value: 'ruled' },
    { label: t('sidebar.patterns.grid'), value: 'grid' },
    { label: t('sidebar.patterns.dots'), value: 'dots' },
    { label: t('sidebar.patterns.staff'), value: 'staff' },
    { label: t('sidebar.patterns.calligraphy'), value: 'calligraphy' },
    { label: t('sidebar.patterns.triangular'), value: 'triangular' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden no-print"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-[#fdfcf9] border-r border-[#e8e2d7] p-6 flex flex-col gap-8 no-print shadow-2xl transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen lg:shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between text-[#8b5e3c]">
          <div className="flex items-center gap-2">
            <Grid size={24} color={ICON_COLOR} />
            <h1 className="text-xl font-bold tracking-tight text-stone-800">{t('app_title')}</h1>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-[#f5f1e9] rounded-full transition-colors"
          >
            <Maximize size={20} color={ICON_COLOR} className="rotate-45" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2">
        {/* Pattern Selection */}
        <section className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
            <Layout size={16} color={ICON_COLOR} /> {t('sidebar.pattern')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {patterns.map((p) => (
              <button
                key={p.value}
                onClick={() => setSettings((prev) => ({ 
                  ...prev, 
                  pattern: p.value,
                  ...PATTERN_DEFAULTS[p.value]
                }))}
                className={`px-3 py-2 text-xs rounded-md transition-all ${
                  settings.pattern === p.value
                    ? 'bg-[#8b5e3c] text-white shadow-md'
                    : 'bg-[#f5f1e9] text-stone-600 hover:bg-[#ede8dc]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* Page Settings */}
        <section className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
            <Maximize size={16} color={ICON_COLOR} /> {t('sidebar.page')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-stone-500">{t('sidebar.size')}</label>
              <select
                value={settings.pageSize}
                onChange={(e) => handleChange('pageSize', e.target.value)}
                className="w-full p-2 text-xs border border-[#e8e2d7] rounded-md focus:ring-2 focus:ring-[#8b5e3c] outline-none bg-white text-stone-700"
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-stone-500">{t('sidebar.orientation.label')}</label>
              <select
                value={settings.orientation}
                onChange={(e) => handleChange('orientation', e.target.value)}
                className="w-full p-2 text-xs border border-[#e8e2d7] rounded-md focus:ring-2 focus:ring-[#8b5e3c] outline-none bg-white text-stone-700"
              >
                <option value="portrait">{t('sidebar.orientation.portrait')}</option>
                <option value="landscape">{t('sidebar.orientation.landscape')}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Dimensions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <Settings size={16} color={ICON_COLOR} /> {t('sidebar.parameters')}
            </label>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-[#8b5e3c] hover:bg-[#f5f1e9] rounded-md transition-colors uppercase tracking-wider"
              title={t('sidebar.reset_defaults')}
            >
              <RotateCcw size={12} />
              {t('sidebar.reset_defaults')}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-500">
              <span>{t('sidebar.spacing')}: {settings.spacing}mm</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="0.5"
              value={settings.spacing}
              onChange={(e) => handleChange('spacing', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#e8e2d7] rounded-lg appearance-none cursor-pointer accent-[#8b5e3c]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-500">
              <span>{t('sidebar.line_width')}: {settings.lineWidth}mm</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.lineWidth}
              onChange={(e) => handleChange('lineWidth', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#e8e2d7] rounded-lg appearance-none cursor-pointer accent-[#8b5e3c]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-500">
              <span>{t('sidebar.margin')}: {settings.margin}mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={settings.margin}
              onChange={(e) => handleChange('margin', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#e8e2d7] rounded-lg appearance-none cursor-pointer accent-[#8b5e3c]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">{t('sidebar.line_color')}</label>
            <input
              type="color"
              value={settings.lineColor}
              onChange={(e) => handleChange('lineColor', e.target.value)}
              className="w-full h-8 p-0 rounded-md cursor-pointer border-none bg-white"
            />
          </div>
        </section>

        {/* Ruled specific */}
        {settings.pattern === 'ruled' && (
          <section className="space-y-4 pt-4 border-t border-[#e8e2d7]">
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <Hash size={16} color={ICON_COLOR} /> {t('sidebar.numbering')}
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showLineNumbers}
                onChange={(e) => handleChange('showLineNumbers', e.target.checked)}
                className="w-4 h-4 text-[#8b5e3c] rounded border-[#e8e2d7] focus:ring-[#8b5e3c] accent-[#8b5e3c]"
              />
              <span className="text-sm text-stone-600">{t('sidebar.show_line_numbers')}</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-stone-500">{t('sidebar.total_lines')}</label>
                <input
                  type="number"
                  value={settings.totalLines}
                  onChange={(e) => handleChange('totalLines', parseInt(e.target.value))}
                  className="w-full p-2 text-sm border border-[#e8e2d7] rounded-md focus:ring-2 focus:ring-[#8b5e3c] focus:border-[#8b5e3c] outline-none transition-all bg-white text-stone-700"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-stone-500">{t('sidebar.start_number')}</label>
                <input
                  type="number"
                  value={settings.startNumber}
                  onChange={(e) => handleChange('startNumber', parseInt(e.target.value))}
                  className="w-full p-2 text-sm border border-[#e8e2d7] rounded-md focus:ring-2 focus:ring-[#8b5e3c] focus:border-[#8b5e3c] outline-none transition-all bg-white text-stone-700"
                />
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="space-y-4 pt-4 border-t border-[#e8e2d7]">
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
            <Type size={16} color={ICON_COLOR} /> {t('sidebar.extra_content')}
          </label>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">{t('sidebar.header_main')}</label>
            <input
              type="text"
              placeholder={t('sidebar.placeholders.header_main')}
              value={settings.header}
              onChange={(e) => handleChange('header', e.target.value)}
              className="w-full p-2 text-sm border border-[#e8e2d7] rounded-md focus:ring-2 focus:ring-[#8b5e3c] focus:border-[#8b5e3c] outline-none transition-all bg-white text-stone-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">{t('sidebar.header_secondary')}</label>
            <input
              type="text"
              placeholder={t('sidebar.placeholders.header_secondary')}
              value={settings.headerSecondary}
              onChange={(e) => handleChange('headerSecondary', e.target.value)}
              className="w-full p-2 text-sm border border-[#e8e2d7] rounded-md focus:ring-2 focus:ring-[#8b5e3c] focus:border-[#8b5e3c] outline-none transition-all bg-white text-stone-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">{t('sidebar.footer')}</label>
            <input
              type="text"
              placeholder={t('sidebar.placeholders.footer')}
              value={settings.footer}
              onChange={(e) => handleChange('footer', e.target.value)}
              className="w-full p-2 text-sm border border-[#e8e2d7] rounded-md focus:ring-2 focus:ring-[#8b5e3c] focus:border-[#8b5e3c] outline-none transition-all bg-white text-stone-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">{t('sidebar.watermark')}</label>
            <input
              type="text"
              placeholder={t('sidebar.placeholders.watermark')}
              value={settings.watermark}
              onChange={(e) => handleChange('watermark', e.target.value)}
              className="w-full p-2 text-sm border border-[#e8e2d7] rounded-md focus:ring-2 focus:ring-[#8b5e3c] focus:border-[#8b5e3c] outline-none transition-all bg-white text-stone-700"
            />
          </div>
        </section>
      </div>
    </aside>
  </>
  );
};