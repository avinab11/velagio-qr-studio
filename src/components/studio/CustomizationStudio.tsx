import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { QRSettings, QRStyle } from '@/types/qr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Palette, Sliders, Image as ImageIcon } from 'lucide-react';

interface CustomizationStudioProps {
  settings: QRSettings;
  onChange: (settings: QRSettings) => void;
}

const CustomizationStudio: React.FC<CustomizationStudioProps> = ({ settings, onChange }) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ ...settings, logo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    onChange({ ...settings, logo: undefined });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Colors Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Colors</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="space-y-1.5 min-w-0">
            <Label className="text-[10px] sm:text-xs font-medium uppercase tracking-tight sm:tracking-wider">Foreground</Label>
            <div className="flex items-center gap-1.5 sm:gap-3 p-1.5 sm:p-2 border rounded-xl bg-muted/30 overflow-hidden">
              <label className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 cursor-pointer">
                <div
                  className="w-full h-full rounded-lg border border-border/60 shadow-sm"
                  style={{ backgroundColor: settings.foreground }}
                />
                <input
                  type="color"
                  value={settings.foreground}
                  onChange={(e) => onChange({ ...settings, foreground: e.target.value })}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </label>
              <Input
                value={settings.foreground.toUpperCase()}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith('#')) val = '#' + val;
                  if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                    onChange({ ...settings, foreground: val });
                  }
                }}
                className="h-7 sm:h-8 min-w-0 flex-1 font-mono text-[10px] sm:text-xs bg-transparent border-none focus-visible:ring-0 px-0.5 sm:px-1"
              />
            </div>
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label className="text-[10px] sm:text-xs font-medium uppercase tracking-tight sm:tracking-wider">Background</Label>
            <div className="flex items-center gap-1.5 sm:gap-3 p-1.5 sm:p-2 border rounded-xl bg-muted/30 overflow-hidden">
              <label className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 cursor-pointer">
                <div
                  className="w-full h-full rounded-lg border border-border/60 shadow-sm"
                  style={{ backgroundColor: settings.background }}
                />
                <input
                  type="color"
                  value={settings.background}
                  onChange={(e) => onChange({ ...settings, background: e.target.value })}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </label>
              <Input
                value={settings.background.toUpperCase()}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith('#')) val = '#' + val;
                  if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                    onChange({ ...settings, background: val });
                  }
                }}
                className="h-7 sm:h-8 min-w-0 flex-1 font-mono text-[10px] sm:text-xs bg-transparent border-none focus-visible:ring-0 px-0.5 sm:px-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Styling Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Styling</h3>
        </div>
        
        <div className="space-y-4">
          <Label className="text-xs font-medium">Pixel Style</Label>
          <Tabs 
            value={settings.pixelStyle} 
            onValueChange={(val) => onChange({ ...settings, pixelStyle: val as QRStyle })}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="square" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Square</TabsTrigger>
              <TabsTrigger value="dots" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Dots</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium">Corner Roundness</Label>
          </div>
          <Slider
            value={[settings.roundness]}
            max={50}
            step={1}
            onValueChange={(val) => onChange({ ...settings, roundness: val[0] })}
            className="py-4"
          />
        </div>
      </div>

      {/* Logo Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Logo</h3>
        </div>
        
        {settings.logo ? (
          <div className="relative group overflow-hidden rounded-2xl border-2 border-primary/20 bg-muted/30 p-4 flex flex-col items-center">
            <img src={settings.logo} alt="QR Logo" className="w-20 h-20 object-contain rounded-lg" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={clearLogo}
            >
              <X className="w-4 h-4" />
            </Button>
            <p className="mt-2 text-xs text-muted-foreground font-medium">Custom Logo Active</p>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/20 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Upload Logo (PNG/JPG)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </label>
        )}
      </div>
    </div>
  );
};

export default CustomizationStudio;
