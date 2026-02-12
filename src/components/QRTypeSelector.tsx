import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Wifi, 
  Phone, 
  Share2, 
  FileText,
  Instagram,
  Youtube,
  Music2,
  Zap
} from 'lucide-react';
import { QRSettings, QRType, WiFiData, SocialData } from '@/types/qr';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface QRTypeSelectorProps {
  settings: QRSettings;
  onChange: (settings: QRSettings) => void;
}

const RESOLVE_URL = 'https://vealgiofreeqr.netlify.app';

const generateRandomString = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const QRTypeSelector: React.FC<QRTypeSelectorProps> = ({ settings, onChange }) => {
  const formatContent = (type: QRType, data: any): string => {
    if (data.isDynamic && data.dynamicId) {
      return `${RESOLVE_URL}?id=${data.dynamicId}`;
    }

    switch (type) {
      case 'url':
        return data.url || '';
      case 'wifi':
        const { ssid, password, type: wifiType, hidden } = data.wifi || {};
        return `WIFI:S:${ssid || ''};T:${wifiType || 'WPA'};P:${password || ''};H:${hidden ? 'true' : 'false'};;`;
      case 'phone':
        return `tel:${data.phone || ''}`;
      case 'social':
        const { platform, username } = data.social || {};
        if (platform === 'instagram') return `https://instagram.com/${username || ''}`;
        if (platform === 'tiktok') return `https://tiktok.com/@${username || ''}`;
        if (platform === 'youtube') return `https://youtube.com/@${username || ''}`;
        return '';
      case 'file':
        return data.url || '';
      default:
        return '';
    }
  };

  const handleTypeChange = (type: string) => {
    const newType = type as QRType;
    const newSettings = { ...settings, type: newType };
    
    // Initialize default data for new types if they don't exist
    if (newType === 'wifi' && !newSettings.wifi) {
      newSettings.wifi = { ssid: '', password: '', type: 'WPA' };
    }
    if (newType === 'social' && !newSettings.social) {
      newSettings.social = { platform: 'instagram', username: '' };
    }
    
    newSettings.content = formatContent(newType, newSettings);
    onChange(newSettings);
  };

  const handleDynamicToggle = async (checked: boolean) => {
    if (checked) {
      // Check if user has content
      const content = formatContent(settings.type, settings);
      if (!content) {
        toast.error('Please enter some content before making it dynamic.');
        return;
      }

      try {
        const id = generateRandomString(6);
        const token = generateRandomString(32);

        const { error } = await supabase.from('dynamic_codes').insert({
          id,
          target_url: content,
          edit_token: token,
          scan_count: 0,
          is_blocked: false,
        });

        if (error) throw error;

        // Save to localStorage
        const myCodes = JSON.parse(localStorage.getItem('my_codes') || '[]');
        myCodes.push(token);
        localStorage.setItem('my_codes', JSON.stringify(myCodes));

        updateSettings({ 
          isDynamic: true, 
          dynamicId: id, 
          editToken: token 
        });
        
        toast.success('Dynamic QR created! You can now edit the link later.');
      } catch (err) {
        console.error(err);
        toast.error('Failed to create dynamic QR. Please try again.');
      }
    } else {
      updateSettings({ 
        isDynamic: false, 
        dynamicId: undefined, 
        editToken: undefined 
      });
    }
  };

  const updateSettings = (updates: Partial<QRSettings>) => {
    const nextSettings = { ...settings, ...updates };
    nextSettings.content = formatContent(nextSettings.type, nextSettings);
    onChange(nextSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider">Dynamic QR</h3>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[10px] font-bold">BETA</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">Allows you to change the destination URL after printing.</p>
        </div>
        <div className="flex items-center gap-3">
          <Zap className={`w-4 h-4 transition-colors ${settings.isDynamic ? 'text-primary' : 'text-muted-foreground/30'}`} />
          <Switch 
            checked={settings.isDynamic} 
            onCheckedChange={handleDynamicToggle}
          />
        </div>
      </div>

      <Tabs value={settings.type} onValueChange={handleTypeChange} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 h-auto p-1 bg-muted/50 rounded-2xl">
          <TabsTrigger value="url" className="flex flex-col gap-1 py-3 rounded-xl data-[state=active]:bg-background">
            <Globe className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">URL</span>
          </TabsTrigger>
          <TabsTrigger value="wifi" className="flex flex-col gap-1 py-3 rounded-xl data-[state=active]:bg-background">
            <Wifi className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Wi-Fi</span>
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex flex-col gap-1 py-3 rounded-xl data-[state=active]:bg-background">
            <Phone className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Phone</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex flex-col gap-1 py-3 rounded-xl data-[state=active]:bg-background">
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Social</span>
          </TabsTrigger>
          <TabsTrigger value="file" className="flex flex-col gap-1 py-3 rounded-xl data-[state=active]:bg-background">
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">File</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="url" className="space-y-4 m-0">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Website URL</Label>
              <Input
                placeholder="https://example.com"
                className="h-12 rounded-xl"
                value={settings.url || ''}
                onChange={(e) => updateSettings({ url: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="wifi" className="space-y-4 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Network Name (SSID)</Label>
                <Input
                  placeholder="My Home WiFi"
                  className="h-12 rounded-xl"
                  value={settings.wifi?.ssid || ''}
                  onChange={(e) => updateSettings({ wifi: { ...settings.wifi!, ssid: e.target.value } })}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Security Type</Label>
                <Select 
                  value={settings.wifi?.type} 
                  onValueChange={(v: any) => updateSettings({ wifi: { ...settings.wifi!, type: v } })}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="nopass">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {settings.wifi?.type !== 'nopass' && (
                <div className="space-y-3 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                  <Input
                    type="password"
                    placeholder="WiFi Password"
                    className="h-12 rounded-xl"
                    value={settings.wifi?.password || ''}
                    onChange={(e) => updateSettings({ wifi: { ...settings.wifi!, password: e.target.value } })}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4 m-0">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
              <Input
                placeholder="+1 (555) 000-0000"
                className="h-12 rounded-xl"
                value={settings.phone || ''}
                onChange={(e) => updateSettings({ phone: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform</Label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${settings.social?.platform === 'instagram' ? 'bg-primary/10 border-primary shadow-sm' : 'bg-muted/30 border-transparent hover:bg-muted/50'}`}
                    onClick={() => updateSettings({ social: { ...settings.social!, platform: 'instagram' } })}
                  >
                    <Instagram className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">Instagram</span>
                  </button>
                  <button
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${settings.social?.platform === 'tiktok' ? 'bg-primary/10 border-primary shadow-sm' : 'bg-muted/30 border-transparent hover:bg-muted/50'}`}
                    onClick={() => updateSettings({ social: { ...settings.social!, platform: 'tiktok' } })}
                  >
                    <Music2 className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">TikTok</span>
                  </button>
                  <button
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${settings.social?.platform === 'youtube' ? 'bg-primary/10 border-primary shadow-sm' : 'bg-muted/30 border-transparent hover:bg-muted/50'}`}
                    onClick={() => updateSettings({ social: { ...settings.social!, platform: 'youtube' } })}
                  >
                    <Youtube className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">YouTube</span>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</Label>
                <Input
                  placeholder="username"
                  className="h-12 rounded-xl"
                  value={settings.social?.username || ''}
                  onChange={(e) => updateSettings({ social: { ...settings.social!, username: e.target.value } })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 m-0">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cloud File Link (PDF/Zip)</Label>
                <Input
                  placeholder="Paste Google Drive or Dropbox link"
                  className="h-12 rounded-xl"
                  value={settings.url || ''}
                  onChange={(e) => updateSettings({ url: e.target.value })}
                />
              </div>
              <div className="p-4 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/20 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3 h-3 text-primary" />
                  How to make permanent PDF QRs
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  To create a QR that always links to your latest document, upload your PDF to Google Drive or Dropbox, set the sharing to "Anyone with the link can view", and paste that link above. You can update the file in your cloud storage anytime without changing the QR code!
                </p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default QRTypeSelector;
