import React from 'react';
import { Layers, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/30 border-t border-border/50 py-20 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Why Lumina QR?</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed text-[13px] md:text-sm">
            <p>
              In an era of subscription-locked tools and tracking pixels, Lumina (by Velagio) stands for the original promise of the web: accessibility, privacy, and permanence.
            </p>
            <p>
              Our QR codes are static, meaning the data is encoded directly into the pixels. They never expire, they don't redirect through middle-man servers, and they work perfectly offline.
            </p>
            <p>
              Designed for professional print marketing, from luxury business cards to enterprise-scale packaging, Lumina ensures your digital-to-physical connection remains unbreakable and beautifully crafted.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-end items-start md:items-end">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Layers className="text-white dark:text-black w-4 h-4" />
            </div>
            <span className="font-bold text-xl">Velagio.</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Velagio QR Studio. All rights reserved.</p>
          <div className="flex flex-col md:items-end gap-6 mt-6">
            <div className="flex gap-6">
              <Link to="/blog" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Blogs</Link>
              <Link to="/privacy" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Terms of Use</Link>
            </div>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
