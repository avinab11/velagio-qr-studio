import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BlockedPage: React.FC = () => {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full apple-card p-12 text-center space-y-8 bg-red-500/5 border-red-500/20">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Link Blocked</h1>
          <p className="text-muted-foreground leading-relaxed">
            This QR code has been flagged or manually blocked by its owner. The destination URL is currently unavailable.
          </p>
        </div>

        <Button asChild className="apple-button h-12 px-8 w-full bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90">
          <Link to="/" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Generator
          </Link>
        </Button>
      </div>
    </main>
  );
};

export default BlockedPage;
