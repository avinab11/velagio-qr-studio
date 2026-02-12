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
        colors: ['#