import React from 'react';
import { Layers, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
          <Layers className="text-white dark:text-black w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Velagio QR Studio</h1>
        </div>
      </Link>

      <div className="hidden md:flex items-center gap-4">
        <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 px-3 py-1 flex items-center gap-2 hover:bg-primary/10 transition-colors">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">100% Client-Side Private</span>
        </Badge>
        
        <span className="text-muted-foreground/30">•</span>
        <div className="flex items-center gap-1.5 text-foreground">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">Fast & Free</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
