export type QRStyle = 'square' | 'dots';

export type QRType = 'url' | 'wifi' | 'phone' | 'social' | 'file';

export interface WiFiData {
  ssid: string;
  password?: string;
  type: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface SocialData {
  platform: 'instagram' | 'tiktok' | 'youtube';
  username: string;
}

export interface QRSettings {
  type: QRType;
  content: string; // The final formatted string
  url?: string;
  wifi?: WiFiData;
  phone?: string;
  social?: SocialData;
  foreground: string;
  background: string;
  roundness: number;
  pixelStyle: QRStyle;
  logo?: string;
}

export const DEFAULT_SETTINGS: QRSettings = {
  type: 'url',
  content: '',
  url: '',
  foreground: '#000000',
  background: '#FFFFFF',
  roundness: 0,
  pixelStyle: 'square',
};

/** Check if the user has entered meaningful QR content */
export function hasQRContent(settings: QRSettings): boolean {
  switch (settings.type) {
    case 'url':
    case 'file':
      return !!(settings.url && settings.url.trim().length > 0);
    case 'wifi':
      return !!(settings.wifi?.ssid && settings.wifi.ssid.trim().length > 0);
    case 'phone':
      return !!(settings.phone && settings.phone.trim().length > 0);
    case 'social':
      return !!(settings.social?.username && settings.social.username.trim().length > 0);
    default:
      return !!(settings.content && settings.content.trim().length > 0);
  }
}
