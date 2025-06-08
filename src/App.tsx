
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ConsentProvider } from "@/contexts/ConsentContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEnhancedAnalytics } from "@/hooks/useEnhancedAnalytics";
import CookieBanner from "@/components/CookieBanner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import License from "./pages/License";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PrivacyDashboard from "./pages/PrivacyDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Analytics wrapper component to track route changes
const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const analytics = useEnhancedAnalytics();

  useEffect(() => {
    // Track page views on route changes
    if (analytics.isEnabled) {
      analytics.trackPageView(location.pathname);
      
      // Track navigation events
      analytics.trackFeatureUsage('navigation', {
        to: location.pathname,
        timestamp: Date.now()
      });
    }
  }, [location.pathname, analytics]);

  return <>{children}</>;
};

const App = () => {
  console.log("🚀 App component loaded - Version:", Date.now());
  
  return (
    <QueryClientProvider client={queryClient}>
      <ConsentProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnalyticsWrapper>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/license" element={<License />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/privacy-dashboard" element={<PrivacyDashboard />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <CookieBanner />
              </AnalyticsWrapper>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ConsentProvider>
    </QueryClientProvider>
  );
};

export default App;
