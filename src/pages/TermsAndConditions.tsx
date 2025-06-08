
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to LangCanvas
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using LangCanvas, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              LangCanvas is a visual workflow editor for creating and managing language processing workflows. The service allows users to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Create visual workflow diagrams</li>
              <li>Export and import workflow configurations</li>
              <li>Validate workflow structures</li>
              <li>Access the application through a web browser</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">Users agree to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Use the service in compliance with all applicable laws and regulations</li>
              <li>Not attempt to gain unauthorized access to the service or its related systems</li>
              <li>Not use the service for any illegal or unauthorized purpose</li>
              <li>Respect the intellectual property rights of others</li>
              <li>Not interfere with or disrupt the service or servers</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Privacy and Data Collection</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
              use, and protect your information. By using LangCanvas, you consent to our data practices as 
              described in our Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The LangCanvas service and its original content, features, and functionality are owned by Balazs Devay 
              and are protected by international copyright, trademark, patent, trade secret, and other intellectual 
              property laws. The service is licensed under the MIT License.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Disclaimer of Warranties</h2>
            <div className="bg-muted/50 p-4 rounded border-l-4 border-orange-500">
              <p className="text-muted-foreground leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                OR NON-INFRINGEMENT.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              IN NO EVENT SHALL LANGCANVAS OR ITS CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, 
              GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes 
              by updating the "Last updated" date at the top of this page. Your continued use of the service after 
              any modifications indicates your acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">9. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms shall be governed by and construed in accordance with applicable laws, without regard to 
              conflict of law provisions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">10. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us through the 
              LangCanvas application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
