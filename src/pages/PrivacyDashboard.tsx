
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trash2, Download, Shield, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const PrivacyDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consentData, setConsentData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    // Load consent preferences
    const consent = localStorage.getItem('langcanvas-consent');
    if (consent) {
      setConsentData(JSON.parse(consent));
    }

    // Load analytics data
    const analytics = localStorage.getItem('langcanvas-analytics');
    if (analytics) {
      setAnalyticsData(JSON.parse(analytics));
    }
  }, []);

  const handleDeleteAllData = () => {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      // Clear all LangCanvas related data
      const keys = Object.keys(localStorage).filter(key => key.startsWith('langcanvas-'));
      keys.forEach(key => localStorage.removeItem(key));
      
      // Clear session storage
      const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('langcanvas-'));
      sessionKeys.forEach(key => sessionStorage.removeItem(key));

      toast({
        title: "Data Deleted",
        description: "All your data has been permanently deleted.",
      });

      setConsentData(null);
      setAnalyticsData(null);
    }
  };

  const handleExportData = () => {
    const data = {
      consent: consentData,
      analytics: analyticsData,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'langcanvas-privacy-data.json';
    link.click();
    
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your data has been downloaded as a JSON file.",
    });
  };

  const toggleConsent = (category: string) => {
    const newConsent = {
      ...consentData,
      [category]: !consentData?.[category],
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('langcanvas-consent', JSON.stringify(newConsent));
    setConsentData(newConsent);

    toast({
      title: "Preferences Updated",
      description: `${category} consent has been ${newConsent[category] ? 'enabled' : 'disabled'}.`,
    });
  };

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
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Dashboard</h1>
          <p className="text-muted-foreground">Manage your privacy settings and view your data</p>
        </div>

        <div className="grid gap-6">
          {/* Consent Management */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Consent Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Essential Cookies</h3>
                  <p className="text-sm text-muted-foreground">Required for application functionality</p>
                </div>
                <div className="text-green-600 text-sm font-medium">Always Active</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Anonymous usage statistics</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleConsent('analytics')}
                  className="p-1"
                >
                  {consentData?.analytics ? 
                    <ToggleRight className="w-8 h-8 text-green-600" /> : 
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  }
                </Button>
              </div>
            </div>

            {consentData && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                <p className="text-blue-800 dark:text-blue-200">
                  Last updated: {new Date(consentData.lastUpdated || Date.now()).toLocaleDateString()}
                </p>
              </div>
            )}
          </Card>

          {/* Data Overview */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Your Data
            </h2>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Stored Data</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Application preferences</li>
                    <li>• Workflow data</li>
                    <li>• Consent preferences</li>
                    {analyticsData && <li>• Anonymous usage statistics</li>}
                  </ul>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Storage Location</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your browser (localStorage)</li>
                    <li>• Your device only</li>
                    <li>• No external servers</li>
                    <li>• Encrypted when applicable</li>
                  </ul>
                </div>
              </div>

              {analyticsData && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Analytics Summary</h3>
                  <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <p>Sessions: {analyticsData.sessions || 0}</p>
                    <p>Page views: {analyticsData.pageViews || 0}</p>
                    <p>First visit: {analyticsData.firstVisit ? new Date(analyticsData.firstVisit).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Data Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Data Management</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleExportData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
              
              <Button onClick={handleDeleteAllData} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Data
              </Button>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Note:</strong> Deleting your data will reset all preferences and remove any saved workflows. 
                Consider exporting your data first if you want to keep a backup.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyDashboard;
