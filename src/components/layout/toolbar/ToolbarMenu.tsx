
import React from 'react';
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
  const { isAdmin } = useAuth();

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
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin')}>
              <Shield className="w-4 h-4 mr-2" />
              Admin Dashboard
            </DropdownMenuItem>
          </>
        )}
        {!isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin-login')}>
              <Shield className="w-4 h-4 mr-2" />
              Admin Login
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ToolbarMenu;
