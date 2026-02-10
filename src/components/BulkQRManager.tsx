import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { QRSettings } from '@/types/qr';
import QRPreview from './QRPreview';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface BulkQRManagerProps {
  settings: QRSettings;
}

const BulkQRManager: React.FC<BulkQRManagerProps> = ({ settings }) => {
  const [urls, setUrls] = useState<string>('');
  
  const urlList = urls
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0)
    .slice(0, 50);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Paste URLs (one per line)</label>
          <div className="flex items-center gap-4">
            {urlList.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setUrls('')}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear All
              </Button>
            )}
            <Badge variant="secondary" className="font-mono">{urlList.length} / 50</Badge>
          </div>
        </div>
        <Textarea
          placeholder="https://google.com&#10;https://apple.com&#10;https://velagio.com"
          className="min-h-[120px] rounded-2xl border-border/50 bg-background/50 focus:ring-primary/20"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
        />
        <p className="text-xs text-muted-foreground italic">Generate up to 50 high-res QR codes instantly.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {urlList.map((url, index) => (
            <motion.div
              key={url + index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <QRPreview 
                settings={{ ...settings, content: url }} 
                size={140} 
                id={`qr-bulk-${index}`}
              />
              <p className="text-[10px] text-center text-muted-foreground truncate px-2 font-mono">{url}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {urlList.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-muted/50 rounded-3xl">
            <p className="text-muted-foreground font-medium">Your bulk grid will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkQRManager;