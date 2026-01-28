import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  requireSuperAdmin?: boolean;
}

const AdminLayout = ({ children, title, subtitle, requireSuperAdmin = false }: AdminLayoutProps) => {
  const { user, isLoading, isSuperAdmin } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close the sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isMobile ? isSidebarOpen : true} onClose={() => setIsSidebarOpen(false)} />
      <main className="md:ml-64">
        <TopNav
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
