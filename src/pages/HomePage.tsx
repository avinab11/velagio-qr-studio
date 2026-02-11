import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Layers, 
  FileCode, 
  FileText, 
  ShieldCheck, 
  Zap, 
  Heart,
  ExternalLink,
  Monitor,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import QRPreview, { QRPreviewHandle } from '@/components/QRPreview';
import CustomizationStudio from '@/components/studio/CustomizationStudio';
import QRTypeSelector from '@/components/QRTypeSelector';
import BulkQRManager from '@/components/BulkQRManager';
import { QRSettings, DEFAULT_SETTINGS, hasQRContent } from '@/types/qr';
import { downloadPNG, downloadSVG, downloadPDF, downloadBulkZIP } from '@/lib/export';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

type AppMode = 'single' | 'bulk';

const HomePage: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('single');
  const [settings, setSettings] = useState<QRSettings>(DEFAULT_SETTINGS);
  const qrRef = useRef<QRPreviewHandle>(null);
  const showPreview = hasQRContent(settings);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    setIsDesktop(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    if (!qrRef.current) return;
    
    try {
      const filename = `velagio-qr-${Date.now()}`;
      
      if (format === 'pdf') {
        const canvas = await qrRef.current.getCanvas();
        if (canvas) downloadPDF(canvas, filename);
      } else {
        await qrRef.current.download(format as 'png' | 'svg', filename);
      }
      
      toast.success(`${format.toUpperCase()} exported successfully!`);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#007AFF', '#FFFFFF', '#000000']
      });
    } catch (error) {
      toast.error('Export failed. Please try again.');
    }
  };

  const handleBulkDownloadPromise = async (qrElements: NodeListOf<Element>) => {
    const data = Array.from(qrElements).map((el, i) => ({
      url: (el.closest('.space-y-2')?.querySelector('p')?.textContent || `code_${i}`),
      canvas: el as HTMLCanvasElement
    }));

    await downloadBulkZIP(data, 'velagio-bulk-qrs');
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
  };

  const handleBulkDownload = async () => {
    try {
      const qrElements = document.querySelectorAll('[id^="qr-bulk-"] canvas');
      if (qrElements.length === 0) {
        toast.error('No QR codes to download. Please enter some URLs.');
        return;
      }

      toast.promise(handleBulkDownloadPromise(qrElements), {
        loading: 'Preparing your batch...',
        success: 'Batch ZIP downloaded!',
        error: 'Batch export failed.',
      });
    } catch (error) {
      toast.error('Bulk export failed.');
    }
  };

  return (
    <>
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          {/* Left Column: Input & Mode */}
          <div className="space-y-12">
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">Generate Your QR Codes</h1>
                  <p className="text-[17px] md:text-lg text-muted-foreground font-light">Create 100% free, unlimited QR codes for any use. No sign-ups</p>
                </div>
                
                <Tabs value={mode} onValueChange={(v) => setMode(v as AppMode)} className="w-auto">
                  <TabsList className="bg-muted/40 p-0.5 rounded-full border border-border/40">
                    <TabsTrigger value="single" className="rounded-full gap-1 px-4 py-1 text-xs data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md transition-all">
                      <Monitor className="w-3 h-3" />
                      Single
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className="rounded-full gap-1 px-4 py-1 text-xs data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md transition-all">
                      <LayoutGrid className="w-3 h-3" />
                      Bulk
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="apple-card p-10 bg-card/40 backdrop-blur-none lg:backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  {mode === 'single' ? (
                    <motion.div
                      key="single"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <QRTypeSelector settings={settings} onChange={setSettings} />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Button 
                          onClick={() => handleExport('png')} 
                          className="apple-button h-14 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 gap-2 text-base font-bold"
                        >
                          <Download className="w-5 h-5" /> Export PNG
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleExport('svg')} 
                          className="apple-button h-14 gap-2 border-primary/20 hover:bg-primary/5 text-primary text-base font-bold"
                        >
                          <FileCode className="w-5 h-5" /> Vector SVG
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleExport('pdf')} 
                          className="apple-button h-14 gap-2 border-primary/20 hover:bg-primary/5 text-primary text-base font-bold"
                        >
                          <FileText className="w-5 h-5 text-red-500" /> Print PDF
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="bulk"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <BulkQRManager settings={settings} />
                      <Button 
                        onClick={handleBulkDownload}
                        className="w-full apple-button h-16 bg-primary text-white text-lg gap-3 shadow-xl shadow-primary/20"
                      >
                        <Download className="w-6 h-6" /> Download Batch (ZIP)
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Mobile Live Preview - shown above Privacy on small screens */}
            {showPreview && !isDesktop && (
              <section>
                <div className="apple-card p-4 space-y-6 bg-card/80 backdrop-blur-none lg:backdrop-blur-sm overflow-hidden">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Live Preview</h3>
                    <Badge variant="secondary" className="rounded-full bg-green-500/10 text-green-600 border-none font-bold text-[10px]">REAL-TIME</Badge>
                  </div>
                  <QRPreview settings={settings} ref={qrRef} />
                  <div className="space-y-3 pt-4 border-t border-border/40 px-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{settings.type}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Content:</span>
                      <span className="truncate max-w-[200px] font-mono">{settings.content || 'None'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Style:</span>
                      <span className="capitalize">{settings.pixelStyle}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Customization Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="apple-card p-8 space-y-6">
                <CustomizationStudio settings={settings} onChange={setSettings} />
              </div>

              <div className="space-y-8">
                <div className="apple-card p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">Privacy Guaranteed</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Velagio QR Studio processes all data locally in your browser. No signups, no data tracking, and no expirations. Your codes are yours forever.
                  </p>
                </div>

                <div className="apple-card p-8 border-accent/20 bg-accent/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-6 h-6 text-red-500" />
                    <h3 className="text-xl font-bold">Support the Studio</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Velagio is a passion project built for the creative community. If you find it useful, consider supporting our development.
                  </p>
                  <Button asChild className="w-full apple-button bg-white text-black border shadow-sm hover:shadow-md transition-all gap-2">
                    <a
                      href="https://buymeacoffee.com/velagio"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy us a coffee <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Preview (desktop only) */}
          {isDesktop && (
            <aside className="space-y-6 sticky top-[120px]">
              {showPreview ? (
                <div className="apple-card p-8 space-y-6 bg-card/80 backdrop-blur-sm overflow-hidden">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Live Preview</h3>
                    <Badge variant="secondary" className="rounded-full bg-green-500/10 text-green-600 border-none font-bold text-[10px]">REAL-TIME</Badge>
                  </div>
                  
                  <QRPreview settings={settings} ref={qrRef} />
                  
                  <div className="space-y-3 pt-4 border-t border-border/40 px-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{settings.type}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Content:</span>
                      <span className="truncate max-w-[200px] font-mono">{settings.content || 'None'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Style:</span>
                      <span className="capitalize">{settings.pixelStyle}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="apple-card p-8 space-y-4 bg-card/80 backdrop-blur-sm overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Enter the details on the left to see a preview of your QR code.</p>
                </div>
              )}
            </aside>
          )}
        </div>
      </main>
    </>
  );
};

export default HomePage;
