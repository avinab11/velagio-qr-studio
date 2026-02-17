import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Shield className="text-primary w-6 h-6" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">1. Data Collection & Privacy</h2>
          <p>
            At Velagio QR Studio, we offer 100% free, unlimited dynamic and static QR code generation. We believe in absolute privacy: no subscriptions, no sign-ups, and privacy guaranteed. While static QR code generation happens locally within your browser, dynamic QR codes utilize our secure infrastructure to manage redirections and analytics, ensuring your data is handled with the highest security standards.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">2. Cookies</h2>
          <p>
            We use essential cookies to manage your sessions and enable features like dynamic QR code management without requiring a traditional signup or account. This allows you to maintain control over your codes while keeping your personal information private. We do not use tracking cookies or third-party analytics that monitor your behavior across the web for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">3. Third-Party Services</h2>
          <p>
            Our website may contain links to external sites. We are not responsible for the privacy practices or content of these third-party websites. We encourage you to review their policies independently.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">4. Security</h2>
          <p>
            Static QR codes are processed entirely client-side, ensuring your data never leaves your device. For dynamic QR codes, we use secure, encrypted infrastructure to provide features like destination updates and tracking. This hybrid architecture provides both the convenience of advanced features and the highest level of security for your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">5. Updates</h2>
          <p>
            We may update this policy from time to time. Any changes will be posted on this page with an updated effective date.
          </p>
        </section>

        <p className="pt-8 text-sm italic">
          Last updated: February 2026
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
