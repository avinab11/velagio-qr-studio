import React from 'react';
import { FileText } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <FileText className="text-primary w-6 h-6" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Terms of Use</h1>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing Velagio QR Studio, you agree to comply with these terms. If you do not agree, please refrain from using our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">2. Use License</h2>
          <p>
            We grant you a free, unlimited license to generate and download dynamic and static QR codes for personal or commercial use. There are no subscriptions, no sign-ups required, and no limits on the number of codes you can create. 100% free forever.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">3. Prohibited Use</h2>
          <p>
            You may not use our service to generate QR codes for illegal activities, phishing, or spreading malware. We reserve the right to block access if misuse is detected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">4. Disclaimer</h2>
          <p>
            The QR codes are provided as is without any warranty. While we strive for 100 percent reliability, we are not responsible for any issues arising from the use of generated codes in print or digital media.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">5. Limitations</h2>
          <p>
            In no event shall Velagio QR Studio be liable for any damages arising out of the use or inability to use the materials on our website.
          </p>
        </section>

        <p className="pt-8 text-sm italic">
          Last updated: February 2026
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
