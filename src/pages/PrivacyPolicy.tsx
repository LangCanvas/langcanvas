
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-8">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-1">Privacy-First Approach</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  LangCanvas is designed with privacy as a core principle. We collect minimal data and store it locally on your device whenever possible.
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Essential Data (No Consent Required)</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Application preferences (sidebar state, theme settings) - stored locally in your browser</li>
                  <li>Workflow data you create - stored locally in your browser</li>
                  <li>Technical data necessary for the application to function</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Optional Analytics Data (Requires Your Consent)</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Anonymous usage statistics (page views, session duration)</li>
                  <li>Feature usage patterns to improve the application</li>
                  <li>Anonymous user count for understanding application popularity</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  This data is stored locally on your device and never transmitted to external servers.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <Eye className="w-5 h-5 text-blue-600 mb-2" />
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Essential Data</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Used solely to provide application functionality and remember your preferences.
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <Eye className="w-5 h-5 text-purple-600 mb-2" />
                <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Analytics Data</h3>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  Used to understand usage patterns and improve the application experience.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Data Storage and Security</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Local Storage:</strong> All your data is stored locally in your browser using localStorage and sessionStorage</li>
              <li><strong>No Server Storage:</strong> We do not store your personal data on external servers</li>
              <li><strong>Encryption:</strong> Sensitive analytics data is encrypted before local storage</li>
              <li><strong>Data Retention:</strong> Analytics data expires automatically after 30 days</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Your Privacy Rights</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <Trash2 className="w-4 h-4 text-red-500 mr-3 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Right to Delete</h3>
                  <p className="text-muted-foreground text-sm">You can delete all your data at any time through the Privacy Dashboard.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Eye className="w-4 h-4 text-blue-500 mr-3 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Right to Access</h3>
                  <p className="text-muted-foreground text-sm">View all data we have about you through the Privacy Dashboard.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="w-4 h-4 text-green-500 mr-3 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Right to Control</h3>
                  <p className="text-muted-foreground text-sm">Manage your consent preferences and opt out of analytics at any time.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Cookies and Tracking</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>Cookie Notice:</strong> We use minimal essential cookies for application functionality. 
                Any non-essential tracking requires your explicit consent through our cookie banner.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground">Cookie Categories:</h3>
              <ul className="space-y-2">
                <li className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span><strong>Essential Cookies:</strong> Application functionality</span>
                  <span className="text-green-600 text-sm">Always Active</span>
                </li>
                <li className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span><strong>Analytics Cookies:</strong> Usage statistics</span>
                  <span className="text-blue-600 text-sm">Your Choice</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. International Users</h2>
            <p className="text-muted-foreground leading-relaxed">
              This privacy policy complies with GDPR (EU), CCPA (California), and other major privacy regulations. 
              Since all data is stored locally on your device, there are no international data transfers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or your data rights, please contact us through 
              the LangCanvas application or visit our Privacy Dashboard for immediate data management options.
            </p>
          </section>

          <div className="pt-6 border-t">
            <Button 
              onClick={() => navigate('/privacy-dashboard')}
              className="w-full sm:w-auto"
            >
              <Shield className="w-4 h-4 mr-2" />
              Open Privacy Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
