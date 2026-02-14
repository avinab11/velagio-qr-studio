import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Upload, 
  ExternalLink, 
  Trash2, 
  Lock, 
  Unlock,
  QrCode,
  ArrowLeft,
  Search,
  Pencil,
  Check,
  X as XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

/** Local QR entry stored in localStorage */
interface LocalQREntry {
  id: string;
  targetUrl: string;
  scanCount: number;
  createdAt: string;
  editToken: string;
}

const STORAGE_KEY = 'velagio_dynamic_qrs';

function loadLocalEntries(): LocalQREntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalQREntry[];
  } catch {
    return [];
  }
}

function saveLocalEntries(entries: LocalQREntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/** Also save to legacy my_codes for backwards compat with QRTypeSelector */
function syncLegacyTokens(entries: LocalQREntry[]) {
  const tokens = entries.map((e) => e.editToken);
  localStorage.setItem('my_codes', JSON.stringify(tokens));
}

const ManagePage: React.FC = () => {
  const [entries, setEntries] = useState<LocalQREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [syncQrData, setSyncQrData] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // On mount, load entries & handle sync URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const syncData = params.get('sync');
    if (syncData) {
      try {
        const imported = JSON.parse(atob(syncData));
        if (Array.isArray(imported)) {
          const current = loadLocalEntries();
          const existingIds = new Set(current.map((e) => e.id));
          const merged = [...current, ...imported.filter((e: LocalQREntry) => !existingIds.has(e.id))];
          saveLocalEntries(merged);
          syncLegacyTokens(merged);
          toast.success('Synced successfully!');
          navigate('/manage', { replace: true });
        }
      } catch (err) {
        console.error('Sync failed', err);
      }
    }

    // Migrate from old my_codes format → new velagio_dynamic_qrs if needed
    migrateOldEntries();

    setEntries(loadLocalEntries());
    setLoading(false);
  }, [location.search]);

  /** Migrate legacy my_codes tokens to new format (best-effort) */
  const migrateOldEntries = () => {
    const existing = loadLocalEntries();
    if (existing.length > 0) return; // Already have data

    const oldTokens: string[] = JSON.parse(localStorage.getItem('my_codes') || '[]');
    if (oldTokens.length === 0) return;

    // We can't reconstruct full entries from tokens alone, but we keep them as placeholders
    // The user will see them when they create new QRs via the updated QRTypeSelector
  };

  const persist = useCallback((next: LocalQREntry[]) => {
    setEntries(next);
    saveLocalEntries(next);
    syncLegacyTokens(next);
  }, []);

  const handleStartEdit = (entry: LocalQREntry) => {
    setEditingId(entry.id);
    setEditValue(entry.targetUrl);
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) {
      toast.error('URL cannot be empty');
      return;
    }
    const next = entries.map((e) =>
      e.id === id ? { ...e, targetUrl: editValue.trim() } : e
    );
    persist(next);
    setEditingId(null);
    toast.success('Destination URL updated!');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    persist(next);
    toast.success('QR code removed.');
  };

  const exportKeys = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `velagio-qr-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exported!');
  };

  const importKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const current = loadLocalEntries();
          const existingIds = new Set(current.map((en) => en.id));
          const merged = [...current, ...imported.filter((en: LocalQREntry) => !existingIds.has(en.id))];
          persist(merged);
          toast.success('Backup imported & merged!');
        }
      } catch {
        toast.error('Invalid backup file.');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = '';
  };

  const generateSyncQr = () => {
    setSyncQrData(btoa(JSON.stringify(entries)));
  };

  return (
    <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Manage Dynamic QRs</h1>
          <p className="text-muted-foreground">Edit destination links and manage your saved QR codes.</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={exportKeys} className="gap-2 h-11 rounded-xl">
            <Download className="w-4 h-4" /> Export Backup
          </Button>
          <div className="relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={importKeys} 
              accept=".json"
            />
            <Button variant="outline" className="gap-2 h-11 rounded-xl">
              <Upload className="w-4 h-4" /> Import Backup
            </Button>
          </div>
          <Button variant="outline" onClick={generateSyncQr} className="gap-2 h-11 rounded-xl">
            <QrCode className="w-4 h-4" /> Sync Phone
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {syncQrData && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="apple-card p-8 bg-primary/5 border-primary/20 flex flex-col items-center gap-6 overflow-hidden"
          >
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Sync to Mobile</h3>
              <p className="text-sm text-muted-foreground">Scan this code with your phone to transfer your QR data.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-white/20">
              <QRCodeSVG 
                value={`${window.location.origin}/manage?sync=${syncQrData}`}
                size={200}
                level="M"
                includeMargin
              />
            </div>
            <Button variant="ghost" onClick={() => setSyncQrData(null)}>Dismiss</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="apple-card h-48 animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="apple-card p-12 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Search className="w-10 h-10 text-primary/50" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No dynamic codes found</h2>
            <p className="text-muted-foreground max-w-md">You haven't created any dynamic QR codes yet. Enable "Dynamic Mode" in the generator to start tracking.</p>
          </div>
          <Button asChild className="apple-button h-12 px-8">
            <Link to="/">Create First QR</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {entries.map(entry => (
            <motion.div 
              key={entry.id}
              layout
              className="apple-card p-6 flex flex-col md:flex-row md:items-center gap-6 group"
            >
              <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-sm border border-border/40 flex-shrink-0 flex items-center justify-center">
                 <QrCode className="w-12 h-12 text-black" />
              </div>
              
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-[10px] tracking-widest px-2">{entry.id}</Badge>
                  <span className="text-xs text-muted-foreground">Created {new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target URL</Label>
                  {editingId === entry.id ? (
                    <div className="flex gap-2">
                      <Input 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-10 rounded-lg flex-1 bg-muted/30 border-primary/40 transition-all"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(entry.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <Button 
                        onClick={() => handleSaveEdit(entry.id)}
                        size="icon"
                        className="h-10 w-10 rounded-lg bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={handleCancelEdit}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-lg"
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <p className="text-sm font-mono truncate flex-1 text-foreground/80">{entry.targetUrl}</p>
                      <Button 
                        onClick={() => handleStartEdit(entry)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-primary/10"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 md:pl-6 md:border-l border-border/40">
                <div className="text-center px-4">
                  <div className="text-2xl font-bold">{entry.scanCount}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Scans</div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    className="h-10 w-10 rounded-lg hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
};

export default ManagePage;
