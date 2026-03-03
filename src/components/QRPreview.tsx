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

function getCornerType(roundness: number): 'square' | 'extra-rounded' | 'dot' {
  if (roundness >= 40) return 'dot';
  if (roundness >= 5) return 'extra-rounded';
  return 'square';
}

function getDotType(pixelStyle: 'square' | 'dots', roundness: number): 'square' | 'dots' | 'rounded' {
  if (pixelStyle === 'dots') return 'dots';
  if (roundness >= 20) return 'rounded';
  return 'square';
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
      type: getDotType(settings.pixelStyle, settings.roundness) as any,
    },
    backgroundOptions: {
      color: settings.background,
    },
    cornersSquareOptions: {
      color: settings.foreground,
      type: getCornerType(settings.roundness),
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
    
    // Only use update() for structural changes to avoid flickering on color/roundness tweaks
    // Actually, color changes are fast but update() still flashes.
    // For background color of the WRAPPER, it's already handled by inline style in render.
    
    const timeoutId = setTimeout(() => {
      const options = getQROptions(settings, size);
      qrCode.current?.update(options);
    }, 16); // Lowered from 48ms to 16ms (1 frame) for more fluidity

    return () => clearTimeout(timeoutId);
  }, [settings.content, settings.logo, settings.pixelStyle, settings.roundness, size]);

  // Handle color updates separately if we want zero flicker, 
  // but let's first try just reducing the debounce and checking if it's acceptable.
  // Actually, the user explicitly asked to eliminate flickering.
  // Direct SVG manipulation is the way.
  
  useEffect(() => {
    if (!qrRef.current || !qrCode.current) return;
    
    // Update the instance state without a full re-render if possible? 
    // The library doesn't expose a "silent" update.
    // So we update the DOM directly for colors.
    const svg = qrRef.current.querySelector('svg');
    if (svg) {
      const paths = svg.querySelectorAll('path');
      paths.forEach(path => {
        const fill = path.getAttribute('fill');
        if (fill && fill !== 'none' && fill !== 'transparent') {
          // If the fill was the old foreground, update it
          // This is a bit heuristic but works for simple QRs
          if (fill !== settings.background) {
            path.setAttribute('fill', settings.foreground);
          }
        }
      });
      
      const rects = svg.querySelectorAll('rect');
      rects.forEach(rect => {
        const fill = rect.getAttribute('fill');
        if (fill && fill !== 'none') {
          if (rect.getAttribute('width') === '100%' || (parseInt(rect.getAttribute('width') || '0') >= size)) {
            rect.setAttribute('fill', settings.background);
          } else {
            rect.setAttribute('fill', settings.foreground);
          }
        }
      });
    }
  }, [settings.foreground, settings.background]);

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
      const isSvg = extension === 'svg';
      const exportQR = new QRCodeStyling({
        ...getQROptions(latestSettings.current, EXPORT_SIZE),
        type: isSvg ? 'svg' as const : 'canvas' as const,
      });

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      exportQR.append(tempDiv);
      await new Promise((r) => setTimeout(r, 200));

      // On mobile browsers, qr-code-styling's download() can fail silently.
      // Use a manual Blob-based download as a robust fallback.
      try {
        if (isSvg) {
          const svgEl = tempDiv.querySelector('svg');
          if (svgEl) {
            const svgData = new XMLSerializer().serializeToString(svgEl);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name}.svg`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            // Small delay before cleanup for mobile Safari
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 100);
          } else {
            // Fallback to library download
            await exportQR.download({ name, extension });
          }
        } else {
          const canvas = tempDiv.querySelector('canvas') as HTMLCanvasElement | null;
          if (canvas) {
            canvas.toBlob((blob) => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${name}.png`;
              a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 100);
            }, 'image/png');
          } else {
            await exportQR.download({ name, extension });
          }
        }
      } catch {
        // Ultimate fallback
        await exportQR.download({ name, extension });
      }

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