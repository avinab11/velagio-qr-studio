import React, { useRef, useImperativeHandle, forwardRef, useEffect, useMemo } from 'react';
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

function getDotsType(pixelStyle: string, roundness: number): 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded' {
  if (pixelStyle === 'dots') {
    if (roundness > 35) return 'dots';
    return 'rounded';
  }
  if (roundness > 40) return 'extra-rounded';
  if (roundness > 25) return 'classy-rounded';
  if (roundness > 12) return 'classy';
  return 'square';
}

function getCornerSquareType(roundness: number): 'extra-rounded' | 'dot' | 'square' {
  if (roundness > 35) return 'dot';
  if (roundness > 8) return 'extra-rounded';
  return 'square';
}

function getCornerDotType(roundness: number): 'dot' | 'square' {
  return roundness > 18 ? 'dot' : 'square';
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
      type: getDotsType(settings.pixelStyle, settings.roundness),
    },
    backgroundOptions: {
      color: settings.background,
    },
    cornersSquareOptions: {
      color: settings.foreground,
      type: getCornerSquareType(settings.roundness),
    },
    cornersDotOptions: {
      color: settings.foreground,
      type: getCornerDotType(settings.roundness),
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

  // Derive a stable key that only changes when the corner type thresholds cross,
  // the pixelStyle changes, or the logo changes. Color and roundness number changes
  // are handled by direct SVG DOM manipulation below to avoid flicker.
  const structuralKey = useMemo(() => {
    return [
      settings.pixelStyle,
      getDotsType(settings.pixelStyle, settings.roundness),
      getCornerSquareType(settings.roundness),
      getCornerDotType(settings.roundness),
      settings.logo ?? '',
      settings.content,
    ].join('|');
  }, [settings.pixelStyle, settings.roundness, settings.logo, settings.content]);

  // Full QR rebuild only when structural properties change (style, content, logo, corner type thresholds)
  useEffect(() => {
    if (!qrCode.current) return;
    const options = getQROptions(settings, size);
    qrCode.current.update(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structuralKey, size]);

  // Fast color-only updates via direct SVG DOM manipulation (no flicker)
  useEffect(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Update all dot/path fill colors directly
    svg.querySelectorAll('rect, circle, path').forEach((el) => {
      const fill = el.getAttribute('fill');
      if (!fill || fill === 'none' || fill === 'transparent') return;
      // Background rect is typically the first large rect
      const tagName = el.tagName.toLowerCase();
      if (tagName === 'rect' && el === svg.querySelector('rect')) {
        el.setAttribute('fill', settings.background);
      } else {
        el.setAttribute('fill', settings.foreground);
      }
    });
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
