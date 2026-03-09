import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Wifi, Phone, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WiFiInfo {
  ssid: string;
  password: string;
  type: string;
  hidden: boolean;
}

function parseWiFiString(str: string): WiFiInfo | null {
  // WIFI:S:MyNetwork;T:WPA;P:mypassword;H:false;;
  const ssidMatch = str.match(/S:([^;]*)/);
  const typeMatch = str.match(/T:([^;]*)/);
  const passMatch = str.match(/P:([^;]*)/);
  const hiddenMatch = str.match(/H:([^;]*)/);
  if (!ssidMatch) return null;
  return {
    ssid: ssidMatch[1],
    password: passMatch?.[1] || '',
    type: typeMatch?.[1] || 'WPA',
    hidden: hiddenMatch?.[1] === 'true',
  };
}

function parsePhoneNumber(str: string): string | null {
  if (str.startsWith('tel:')) return str.replace('tel:', '');
  return null;
}

type PageType = 'wifi' | 'phone' | 'loading' | 'error' | 'blocked';

const GoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { id: pathId } = useParams();
  const id = searchParams.get('id') || pathId;
  const [pageType, setPageType] = useState<PageType>('loading');
  const [wifiInfo, setWifiInfo] = useState<WiFiInfo | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      setPageType('error');
      return;
    }

    const loadAndTrack = async () => {
      try {
        // Fetch the dynamic code
        const { data: code, error } = await supabase
          .from('dynamic_codes')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !code) {
          setPageType('error');
          return;
        }

        if (code.is_blocked) {
          setPageType('blocked');
          return;
        }

        const target = code.target_url as string;

        // Log scan analytics
        const ua = navigator.userAgent;
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
        const browserMatch = ua.match(/(Chrome|Safari|Firefox|Edge|Opera|Samsung)/i);
        const browser = browserMatch ? browserMatch[1] : 'Unknown';

        // Fire and forget — don't block the page
        supabase.from('scans').insert({
          code_id: id,
          device_type: isMobile ? 'Mobile' : 'Desktop',
          browser: browser,
          country: 'Unknown',
        }).then(() => {});

        supabase
          .from('dynamic_codes')
          .update({ scan_count: (code.scan_count || 0) + 1 })
          .eq('id', id)
          .then(() => {});

        // Determine page type from target_url
        if (target.startsWith('WIFI:')) {
          const info = parseWiFiString(target);
          if (info) {
            setWifiInfo(info);
            setPageType('wifi');
          } else {
            setPageType('error');
          }
        } else if (target.startsWith('tel:')) {
          const phone = parsePhoneNumber(target);
          if (phone) {
            setPhoneNumber(phone);
            setPageType('phone');
          } else {
            setPageType('error');
          }
        } else {
          // For URL types, just redirect
          window.location.href = target;
        }
      } catch {
        setPageType('error');
      }
    };

    loadAndTrack();
  }, [id]);

  const handleCopyPassword = () => {
    if (wifiInfo?.password) {
      navigator.clipboard.writeText(wifiInfo.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (pageType === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (pageType === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center space-y-4 max-w-sm">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight">QR Code Not Found</h1>
          <p className="text-sm text-muted-foreground">This QR code may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  if (pageType === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center space-y-4 max-w-sm">
          <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight">Link Blocked</h1>
          <p className="text-sm text-muted-foreground">This QR code has been disabled by the owner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-foreground flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-background">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground tracking-wider uppercase">Velagio QR Studio</p>
        </div>

        {/* WiFi Card */}
        {pageType === 'wifi' && wifiInfo && (
          <div className="apple-card p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Wifi className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Connect to Network</h1>
              <p className="text-sm text-muted-foreground">Scan complete. Join the Wi-Fi network below.</p>
            </div>

            <div className="space-y-4 bg-muted/30 rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Network</span>
                <span className="text-sm font-bold">{wifiInfo.ssid}</span>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Security</span>
                <span className="text-sm font-medium">{wifiInfo.type === 'nopass' ? 'Open' : wifiInfo.type}</span>
              </div>
              {wifiInfo.password && (
                <>
                  <div className="h-px bg-border/50" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium">
                        {showPassword ? wifiInfo.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] text-primary font-bold uppercase tracking-wide"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {wifiInfo.password && (
              <Button
                onClick={handleCopyPassword}
                className="w-full apple-button h-14 bg-foreground text-background hover:bg-foreground/90 text-base font-bold"
              >
                {copied ? 'Copied!' : 'Copy Password'}
              </Button>
            )}

            <p className="text-center text-[10px] text-muted-foreground">
              Open your device's Wi-Fi settings and select <strong>{wifiInfo.ssid}</strong> to connect.
            </p>
          </div>
        )}

        {/* Phone Card */}
        {pageType === 'phone' && phoneNumber && (
          <div className="apple-card p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Tap to Call</h1>
              <p className="text-sm text-muted-foreground">Scan complete. Call the number below.</p>
            </div>

            <div className="bg-muted/30 rounded-2xl p-5 text-center">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Phone Number</span>
              <span className="text-2xl font-bold tracking-tight">{phoneNumber}</span>
            </div>

            <Button
              asChild
              className="w-full apple-button h-14 bg-foreground text-background hover:bg-foreground/90 text-base font-bold"
            >
              <a href={`tel:${phoneNumber}`}>
                <Phone className="w-5 h-5 mr-2" /> Tap to Call
              </a>
            </Button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground">
          Powered by <a href="https://www.velagiofreeqr.com" className="text-primary font-medium hover:underline">Velagio QR Studio</a>
        </p>
      </div>
    </div>
  );
};

export default GoPage;
