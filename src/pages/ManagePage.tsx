import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Upload, 
  RefreshCw, 
  ExternalLink, 
  Trash2, 
  Lock, 
  Unlock,
  QrCode,
  ArrowLeft,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AnalyticsDashboard from '@/components/studio/AnalyticsDashboard';
import { QRCodeSVG } from 'qrcode.react';

interface DynamicCode {
  id: string;
  target_url: string;
  edit_token: string;
  is_blocked: boolean;
  scan_count: number;
  created_at: string;
}

const ManagePage: React.FC = () => {
  const [codes, setCodes] = useState<DynamicCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState<DynamicCode | null>(null);
  const [view, setView] = useState<'list' | 'analytics'>('list');
  const [syncQrData, setSyncQrData] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle sync from URL
    const params = new URLSearchParams(location.search);
    const syncData = params.get('sync');
    if (syncData) {
      try {
        const tokens = JSON.parse(atob(syncData));
        if (Array.isArray(tokens)) {
          const currentTokens = JSON.parse(localStorage.getItem('my_codes') || '[]');
          const mergedTokens = Array.from(new Set([...currentTokens, ...tokens]));
          localStorage.setItem('my_codes', JSON.stringify(mergedTokens));
          toast.success('Synced successfully!');
          // Remove query param
          navigate('/manage', { replace: true });
        }
      } catch (err) {
        console.error('Sync failed', err);
      }
    }

    fetchMyCodes();
  }, [location.search]);

  const fetchMyCodes = async () => {
    setLoading(true);
    const myTokens = JSON.parse(localStorage.getItem('my_codes') || '[]');
    
    if (myTokens.length === 0) {
      setCodes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('dynamic_codes')
        .select('*')
        .in('edit_token', myTokens);

      if (error) throw error;
      setCodes(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your codes.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUrl = async (id: string, editToken: string, newUrl: string) => {
    try {
      const { error } = await supabase
        .from('dynamic_codes')
        .update({ target_url: newUrl })
        .match({ id, edit_token: editToken });

      if (error) throw error;
      
      setCodes(codes.map(c => c.id === id ? { ...c, target_url: newUrl } : c));
      toast.success('URL updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update URL.');
    }
  };

  const handleToggleBlock = async (id: string, editToken: string, isBlocked: boolean) => {
    try {
      const { error } = await supabase
        .from('dynamic_codes')
        .update({ is_blocked: !isBlocked })
        .match({ id, edit_token: editToken });

      if (error) throw error;
      
      setCodes(codes.map(c => c.id === id ? { ...c, is_blocked: !isBlocked } : c));
      toast.success(isBlocked ? 'Link unblocked' : 'Link blocked');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update block status.');
    }
  };

  const handleDelete = (id: string, editToken: string) => {
    // Only remove from local storage and UI for guest view
    const myTokens = JSON.parse(localStorage.getItem('my_codes') || '[]');
    const newTokens = myTokens.filter((t: string) => t !== editToken);
    localStorage.setItem('my_codes', JSON.stringify(newTokens));
    setCodes(codes.filter(c => c.id !== id));
    toast.success('Removed from your dashboard');
  };

  const exportKeys = () => {
    const myTokens = localStorage.getItem('my_codes') || '[]';
    const blob = new Blob([myTokens], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `velagio-qr-keys-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Keys exported successfully!');
  };

  const importKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const tokens = JSON.parse(event.target?.result as string);
        if (Array.isArray(tokens)) {
          const currentTokens = JSON.parse(localStorage.getItem('my_codes') || '[]');
          const mergedTokens = Array.from(new Set([...currentTokens, ...tokens]));
          localStorage.setItem('my_codes', JSON.stringify(mergedTokens));
          fetchMyCodes();
          toast.success('Keys imported and merged!');
        }
      } catch (err) {
        toast.error('Invalid keys file.');
      }
    };
    reader.readAsText(file);
  };

  const generateSyncQr = () => {
    const tokens = localStorage.getItem('my_codes') || '[]';
    setSyncQrData(tokens);
  };

  if (view === 'analytics' && selectedCode) {
    return (
      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-12 space-y-8">
        <Button variant="ghost" onClick={() => setView('list')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to List
        </Button>
        <AnalyticsDashboard code={selectedCode} />
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Manage Dynamic QRs</h1>
          <p className="text-muted-foreground">Edit your destination links and track scan performance.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportKeys} className="gap-2 h-11 rounded-xl">
            <Download className="w-4 h-4" /> Export Keys
          </Button>
          <div className="relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={importKeys} 
              accept=".json"
            />
            <Button variant="outline" className="gap-2 h-11 rounded-xl">
              <Upload className="w-4 h-4" /> Import Keys
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
              <p className="text-sm text-muted-foreground">Scan this code with your phone to transfer your edit keys.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-white/20">
              <QRCodeSVG 
                value={`${window.location.origin}/manage?sync=${btoa(syncQrData)}`}
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
      ) : codes.length === 0 ? (
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
          {codes.map(code => (
            <motion.div 
              key={code.id}
              layout
              className="apple-card p-6 flex flex-col md:flex-row md:items-center gap-6 group"
            >
              <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-sm border border-border/40 flex-shrink-0 flex items-center justify-center">
                 <QrCode className="w-12 h-12 text-black" />
              </div>
              
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-[10px] tracking-widest px-2">{code.id}</Badge>
                  <span className="text-xs text-muted-foreground">Created {new Date(code.created_at).toLocaleDateString()}</span>
                  {code.is_blocked && (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-none font-bold text-[10px]">BLOCKED</Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={code.target_url} 
                      onChange={(e) => setCodes(codes.map(c => c.id === code.id ? { ...c, target_url: e.target.value } : c))}
                      className="h-10 rounded-lg flex-1 bg-muted/30 border-transparent focus:bg-background focus:border-primary/40 transition-all"
                    />
                    <Button 
                      onClick={() => handleUpdateUrl(code.id, code.edit_token, code.target_url)}
                      className="h-10 px-4 rounded-lg bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 md:pl-6 md:border-l border-border/40">
                <div className="text-center px-4">
                  <div className="text-2xl font-bold">{code.scan_count}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Scans</div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCode(code);
                      setView('analytics');
                    }}
                    className="h-10 gap-2 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <BarChart3 className="w-4 h-4" /> View Stats
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleToggleBlock(code.id, code.edit_token, code.is_blocked)}
                      className="h-10 w-10 rounded-lg transition-colors hover:bg-muted/50"
                      title={code.is_blocked ? "Unblock Link" : "Block Link"}
                    >
                      {code.is_blocked ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-orange-500" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(code.id, code.edit_token)}
                      className="h-10 w-10 rounded-lg hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
