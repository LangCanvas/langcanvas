
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, Settings, X } from 'lucide-react';
import { useConsent } from '@/contexts/ConsentContext';
import { useNavigate } from 'react-router-dom';

const CookieBanner = () => {
  const { showBanner, acceptAll, rejectAll, hideBanner } = useConsent();
  const navigate = useNavigate();

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto bg-card border shadow-lg">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  We Value Your Privacy
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We use essential cookies to make our application work. We'd also like to use optional analytics 
                  cookies to help us improve LangCanvas. All data is stored locally on your device and never 
                  transmitted to external servers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={acceptAll} className="flex-1 sm:flex-none">
                  Accept All
                </Button>
                
                <Button onClick={rejectAll} variant="outline" className="flex-1 sm:flex-none">
                  Essential Only
                </Button>
                
                <Button 
                  onClick={() => navigate('/privacy')} 
                  variant="ghost" 
                  className="flex-1 sm:flex-none"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <span>Read our </span>
                <button 
                  onClick={() => navigate('/privacy')}
                  className="underline hover:text-foreground"
                >
                  Privacy Policy
                </button>
                <span> for more details.</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={hideBanner}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieBanner;
