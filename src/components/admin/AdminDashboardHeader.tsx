
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardHeaderProps {
  user: {
    name?: string;
    email?: string;
    picture?: string;
  } | null;
  onSignOut: () => void;
}

export const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({
  user,
  onSignOut
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    onSignOut();
    navigate('/');
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to LangCanvas
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Unified analytics and user insights</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <img 
            src={user?.picture} 
            alt={user?.name} 
            className="w-8 h-8 rounded-full"
          />
          <div className="text-sm">
            <div className="font-medium">{user?.name}</div>
            <div className="text-muted-foreground">{user?.email}</div>
          </div>
          <Badge variant="secondary">Admin</Badge>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
