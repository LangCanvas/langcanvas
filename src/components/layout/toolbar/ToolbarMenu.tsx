
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ChevronDown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ToolbarMenu: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, user, validateSession } = useAuth();
  const [authState, setAuthState] = useState({ isAdmin: false, isAuthenticated: false });

  // Track auth state changes with local state to ensure we have the latest values
  useEffect(() => {
    console.log('🔧 ToolbarMenu auth state updated:', { isAdmin, isAuthenticated, userEmail: user?.email });
    setAuthState({ isAdmin, isAuthenticated });
  }, [isAdmin, isAuthenticated, user]);

  const handleAdminDashboard = () => {
    console.log('🔧 Admin Dashboard clicked - Current auth state:', authState);
    console.log('🔧 Validating session before navigation...');
    
    // Validate session before navigation
    const isSessionValid = validateSession();
    console.log('🔧 Session validation result:', isSessionValid);
    
    if (isSessionValid && authState.isAuthenticated && authState.isAdmin) {
      console.log('🔧 Session valid - navigating to /admin');
      navigate('/admin');
    } else {
      console.log('🔧 Session invalid or not admin - redirecting to admin login');
      navigate('/admin-login');
    }
  };

  const handleAdminLogin = () => {
    console.log('🔧 Admin Login clicked - navigating to /admin-login');
    navigate('/admin-login');
  };

  // Double-check auth state for rendering
  const shouldShowAdminDashboard = authState.isAuthenticated && authState.isAdmin;
  console.log('🔧 ToolbarMenu render decision:', { shouldShowAdminDashboard, authState });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-600 hover:text-gray-800 touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          <MoreVertical className="w-4 h-4 mr-1" />
          <span className="hidden md:inline">Menu</span>
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate('/license')}>
          License (MIT)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/terms')}>
          Terms & Conditions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/privacy')}>
          Privacy Policy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/privacy-dashboard')}>
          Privacy Dashboard
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {shouldShowAdminDashboard ? (
          <DropdownMenuItem onClick={handleAdminDashboard}>
            <Shield className="w-4 h-4 mr-2" />
            Admin Dashboard
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleAdminLogin}>
            <Shield className="w-4 h-4 mr-2" />
            Admin Login
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ToolbarMenu;
