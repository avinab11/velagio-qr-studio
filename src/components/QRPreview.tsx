import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { QRSettings } from '@/types/qr';

interface QRPreviewProps {
  settings: QRSettings;
  size?: number;
  id?: string;
}

export interface QRPreviewHandle {
  getCanvas: () => Promise<HTMLCanvasElement | null>;
  getSVG: () => SVGSVGElement | null;
  download: (format: 'png' | 'svg', filename: string) => Promise<void>;
}

function getQROptions(settings: QRSettings, size: number) {
  return {
    width: size,
    height: size,
    type: 'svg' as const,
    data: settings.content || ' ',
    image: settings.logo,
    dotsOptions: {
      color: settings.foreground,
      type: (settings.pixelStyle === 'dots' ? 'rounded' : 'square') as 'rounded' | 'square',
    },
    backgroundOptions: {
      color: settings.background,
    },
    cornersSquareOptions: {
      color: settings.foreground,
      type: (settings.roundness > 40 ? 'dot' : (settings.roundness > 10 ? 'extra-rounded' : 'square')) as 'extra-rounded' | 'dot' | 'square',
    },
    cornersDotOptions: {
      color: settings.foreground,
      type: (settings.roundness > 25 ? 'dot' : 'square') as 'dot' | 'square',
    },
    imageOptions: {
      crossOrigin: 'anonymous' as const,
      margin: 5,
      imageSize: 0.4,
    }
  };
}

const QRPreview = forwardRef<QRPreviewHandle, QRPreviewProps>(({ settings, size = 256, id }, ref) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  // Keep a ref to the latest settings so export always uses current state
  const latestSettings = useRef<QRSettings>(settings);
  latestSettings.current = settings;

  // Create QR instance once
  useEffect(() => {
    const options = getQROptions(settings, size);
    qrCode.current = new QRCodeStyling(options);

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update QR in real-time when settings change (no teardown/recreate)
  useEffect(() => {
    if (!qrCode.current) return;
    
    // Increase debounce slightly to 48ms (approx 3 frames) for better stability on lower-end devices
    // during rapid property changes like the roundness slider.
    const timeoutId = setTimeout(() => {
      const options = getQROptions(settings, size);
      qrCode.current?.update(options);
    }, 48);

    return () => clearTimeout(timeoutId);
  }, [settings, size]);

  useImperativeHandle(ref, () => ({
    getCanvas: async () => {
      // Create a fresh high-res (1024px) instance with the CURRENT settings snapshot
      const exportQR = new QRCodeStyling({
        ...getQROptions(latestSettings.current, 1024),
        type: 'canvas' as const,
      });

      // We must append it to a temporary DOM node so qr-code-styling renders
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      exportQR.append(tempDiv);

      // Give it a moment to render the canvas
      await new Promise((r) => setTimeout(r, 150));

      const canvas = tempDiv.querySelector('canvas') as HTMLCanvasElement | null;
      if (canvas) {
        // Detach so we can return it without losing it
        canvas.remove();
      }
      document.body.removeChild(tempDiv);
      return canvas;
    },
    getSVG: () => {
      return qrRef.current?.querySelector('svg') || null;
    },
    download: async (extension: 'png' | 'svg', name: string) => {
      // Build a fresh high-res instance so logo + settings are guaranteed current
      const EXPORT_SIZE = 1024;
      const exportQR = new QRCodeStyling({
        ...getQROptions(latestSettings.current, EXPORT_SIZE),
        type: extension === 'svg' ? 'svg' as const : 'canvas' as const,
      });

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      exportQR.append(tempDiv);
      await new Promise((r) => setTimeout(r, 150));

      await exportQR.download({ name, extension });
      document.body.removeChild(tempDiv);
    }
  }));

  return (
    <div className="flex justify-center items-center py-4">
      <div
        className="relative flex flex-col items-center justify-center bg-white rounded-3xl border border-border/40 shadow-sm overflow-hidden p-6 sm:p-8"
        id={id}
      >
        <div 
          className="p-3 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: settings.background }}
        >
          <div ref={qrRef} className="[&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto" />
        </div>
      </div>
    </div>
  );
});

QRPreview.displayName = 'QRPreview';

export default QRPreview;
