import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_SETTINGS } from './types/paper';
import type { PaperSettings } from './types/paper';
import { Sidebar } from './components/Sidebar';
import { PatternSVG } from './components/PatternSVG';
import { Printer, FileCode, FileText, Menu, Grid, ZoomIn, Languages } from 'lucide-react';
import jsPDF from 'jspdf';

function App() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<PaperSettings>(DEFAULT_SETTINGS);
  const [isExporting, setIsExporting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Constants for dimensions in mm
  const DIMENSIONS = {
    A4: { width: 210, height: 297 },
    Letter: { width: 215.9, height: 279.4 },
  };

  const getPageDimensions = () => {
    const base = DIMENSIONS[settings.pageSize];
    if (settings.orientation === 'landscape') {
      return { width: base.height, height: base.width };
    }
    return base;
  };

  const { width: PAGE_WIDTH, height: PAGE_HEIGHT } = getPageDimensions();

  // Auto-fit zoom on mount and layout changes
  useEffect(() => {
    const calculateFitZoom = () => {
      if (!mainRef.current) return;
      
      const padding = 64; // Approximate padding around the page
      const availableWidth = mainRef.current.clientWidth - padding;
      const availableHeight = mainRef.current.clientHeight - padding;
      
      // We need pixels for calculation. 3.78 is mm to px.
      const pagePxWidth = PAGE_WIDTH * 3.78;
      const pagePxHeight = PAGE_HEIGHT * 3.78;
      
      const zoomW = availableWidth / pagePxWidth;
      const zoomH = availableHeight / pagePxHeight;
      
      // Use the smaller of the two to fit the whole page
      const idealZoom = Math.min(zoomW, zoomH, 1.2); // Cap at 1.2 for quality
      setSettings(prev => ({ ...prev, zoom: Math.max(0.2, Math.floor(idealZoom * 20) / 20) }));
    };

    calculateFitZoom();
    // Re-calculate on window resize
    window.addEventListener('resize', calculateFitZoom);
    return () => window.removeEventListener('resize', calculateFitZoom);
  }, [PAGE_WIDTH, PAGE_HEIGHT, isSidebarOpen]);

  // Calculate pages needed
  const calculatePages = () => {
    if (settings.pattern !== 'ruled' || !settings.showLineNumbers) {
      return 1;
    }
    
    const contentHeight = PAGE_HEIGHT - (settings.margin * 2);
    const linesPerPage = Math.floor(contentHeight / settings.spacing);
    if (linesPerPage <= 0) return 1;
    return Math.ceil(settings.totalLines / linesPerPage) || 1;
  };

  const pageCount = calculatePages();

  const handleExportSVG = () => {
    if (!containerRef.current) return;
    const svgs = containerRef.current.querySelectorAll('svg');
    if (svgs.length === 0) return;

    // We can export the first page or all pages in one SVG
    // For simplicity, if multiple pages, we stack them vertically
    const width = PAGE_WIDTH;
    const gap = 10; // 10mm gap between pages
    const totalHeight = PAGE_HEIGHT * svgs.length + gap * (svgs.length - 1);

    let combinedContent = '';
    svgs.forEach((svg, index) => {
      // Extract the inner content of each SVG
      // We need to keep the defs if any
      const defs = svg.querySelector('defs')?.outerHTML || '';
      const content = Array.from(svg.children)
        .filter(child => child.tagName !== 'defs')
        .map(child => child.outerHTML)
        .join('');
      
      combinedContent += `
        <g transform="translate(0, ${index * (PAGE_HEIGHT + gap)})">
          ${defs}
          ${content}
        </g>`;
    });

    const fullSVG = `
      <svg width="${width}mm" height="${totalHeight}mm" viewBox="0 0 ${width} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0ece2" />
        ${combinedContent}
      </svg>
    `;

    const blob = new Blob([fullSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `folhas-${settings.pattern}-${new Date().getTime()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    if (!containerRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF({
        orientation: settings.orientation,
        unit: 'mm',
        format: settings.pageSize,
        compress: true,
      });

      const svgs = containerRef.current.querySelectorAll('svg');
      
      for (let i = 0; i < svgs.length; i++) {
        if (i > 0) doc.addPage(settings.pageSize, settings.orientation);
        
        // jspdf.html is great but might be heavy. For vector SVG, we'd ideally use svg2pdf.
        // For now, we'll use a simpler approach: capturing the SVG as an image for the PDF
        // to ensure all patterns and styles are preserved perfectly.
        const svg = svgs[i];
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        // Increase scale for high quality (300 DPI approx)
        const scale = 4;
        canvas.width = PAGE_WIDTH * scale * 3.78; // 3.78 px/mm
        canvas.height = PAGE_HEIGHT * scale * 3.78;
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        await new Promise((resolve) => {
          img.onload = () => {
            if (ctx) {
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            doc.addImage(imgData, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
            URL.revokeObjectURL(url);
            resolve(null);
          };
          img.src = url;
        });
      }

      doc.save(`folhas-${settings.pattern}-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row h-screen print:h-auto print:block bg-[#f0ece2] print:bg-white ${settings.orientation === 'landscape' ? 'landscape' : 'portrait'}`}>
      
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#fdfcf9] border-b border-[#e8e2d7] text-[#8b5e3c] no-print sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <Grid size={24} color="#8b5e3c" />
          <h1 className="text-lg font-bold tracking-tight text-stone-800">{t('app_title')}</h1>
        </div>
        <div className="flex items-center gap-1 relative">
          <button 
            onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            className={`p-2 rounded-md transition-colors ${isLanguageMenuOpen ? 'bg-[#f5f1e9]' : 'hover:bg-[#f5f1e9]'}`}
          >
            <Languages size={24} />
          </button>
          
          {isLanguageMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-[#e8e2d7] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => { i18n.changeLanguage('pt'); setIsLanguageMenuOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm font-bold ${i18n.language.startsWith('pt') ? 'bg-[#8b5e3c] text-white' : 'text-stone-600 hover:bg-[#f5f1e9]'}`}
              >
                Português (PT)
              </button>
              <button
                onClick={() => { i18n.changeLanguage('en'); setIsLanguageMenuOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm font-bold ${i18n.language.startsWith('en') ? 'bg-[#8b5e3c] text-white' : 'text-stone-600 hover:bg-[#f5f1e9]'}`}
              >
                English (EN)
              </button>
              <button
                onClick={() => { i18n.changeLanguage('fr'); setIsLanguageMenuOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm font-bold ${i18n.language.startsWith('fr') ? 'bg-[#8b5e3c] text-white' : 'text-stone-600 hover:bg-[#f5f1e9]'}`}
              >
                Français (FR)
              </button>
            </div>
          )}

          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-[#f5f1e9] rounded-md transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <Sidebar 
        settings={settings} 
        setSettings={setSettings} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main ref={mainRef} className="flex-1 p-4 sm:p-8 print:p-0 overflow-auto print:overflow-visible print:h-auto flex flex-col items-center gap-8 print:gap-0 bg-[#f0ece2] print:bg-white relative">
        
        {/* Floating Language Switcher - Top Right */}
        <div className="hidden lg:flex fixed top-8 right-8 gap-2 no-print z-40 bg-white/80 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-[#e8e2d7]">
          <div className="flex items-center px-2 mr-1 text-[#8b5e3c]">
            <Languages size={18} />
          </div>
          <button
            onClick={() => i18n.changeLanguage('pt')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              i18n.language.startsWith('pt')
                ? 'bg-[#8b5e3c] text-white shadow-md'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              i18n.language.startsWith('en')
                ? 'bg-[#8b5e3c] text-white shadow-md'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => i18n.changeLanguage('fr')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              i18n.language.startsWith('fr')
                ? 'bg-[#8b5e3c] text-white shadow-md'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            FR
          </button>
        </div>
        
        {/* Floating Zoom Control - Bottom Left */}
        <div className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 lg:left-[calc(20rem+2rem)] flex flex-col items-start gap-3 no-print z-40">
          <div className={`
            flex flex-col gap-2 p-4 bg-white border border-[#e8e2d7] rounded-xl shadow-2xl transition-all duration-300 origin-bottom-left
            ${isZoomOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
          `}>
            <div className="flex justify-between text-xs font-bold text-[#8b5e3c] mb-1">
              <span>{t('zoom.label')}</span>
              <span>{Math.round(settings.zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.5"
              step="0.05"
              value={settings.zoom}
              onChange={(e) => setSettings(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
              className="w-32 h-1.5 bg-[#e8e2d7] rounded-lg appearance-none cursor-pointer accent-[#8b5e3c]"
            />
            <button 
              onClick={() => {
                window.dispatchEvent(new Event('resize'));
              }}
              className="mt-1 text-[10px] font-bold text-stone-500 hover:text-[#8b5e3c] uppercase tracking-wider text-left transition-colors"
            >
              {t('zoom.auto_fit')}
            </button>
          </div>
          
          <button
            onClick={() => setIsZoomOpen(!isZoomOpen)}
            className="flex items-center justify-center w-12 h-12 bg-white text-[#8b5e3c] rounded-full hover:bg-stone-50 active:scale-[0.98] transition-all shadow-xl border border-[#e8e2d7] cursor-pointer"
            title={t('zoom.title')}
          >
            <ZoomIn size={24} />
          </button>
        </div>

        <div 
          ref={containerRef}
          className="preview-container flex flex-col items-center gap-8 print:gap-0 transition-all duration-300 ease-out origin-top mb-12"
          style={{ 
            transform: `scale(${settings.zoom})`,
          }}
        >
          {Array.from({ length: pageCount }).map((_, i) => (
            <div key={i} className="page-container shadow-2xl bg-white max-w-full print:shadow-none">
              <PatternSVG
                settings={settings}
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                pageIndex={i}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 flex flex-col items-end gap-3 no-print z-40">
        <button
          onClick={handleExportSVG}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#8b5e3c] rounded-full hover:bg-stone-50 active:scale-[0.98] transition-all font-semibold shadow-xl border border-[#e8e2d7] cursor-pointer group"
          title={t('export.svg')}
        >
          <FileCode size={20} className="group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline text-sm">SVG</span>
        </button>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className={`flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#8b5e3c] rounded-full hover:bg-stone-50 active:scale-[0.98] transition-all font-semibold shadow-xl border border-[#e8e2d7] cursor-pointer group ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={t('export.pdf')}
        >
          {isExporting ? (
            <div className="w-5 h-5 border-2 border-[#8b5e3c] border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileText size={20} className="group-hover:scale-110 transition-transform" />
          )}
          <span className="hidden sm:inline text-sm">{isExporting ? t('export.pdf_exporting') : 'PDF'}</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-[#8b5e3c] text-white rounded-full hover:bg-[#744d32] active:scale-[0.98] transition-all font-bold shadow-2xl group border-none cursor-pointer"
          title={t('export.print')}
        >
          <Printer size={24} className="group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">{t('export.print_btn')}</span>
        </button>
      </div>
    </div>
  );
}

export default App;
