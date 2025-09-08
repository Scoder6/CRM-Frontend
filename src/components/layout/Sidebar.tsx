import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  X 
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-sidebar">
      {/* Mobile close button */}
      {onClose && (
        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="text-lg font-semibold text-sidebar-foreground">Navigation</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Navigation - Fixed height with scroll */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">
            Main Menu
          </h3>
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="border-t p-4 flex-shrink-0">
        <div className="text-xs text-sidebar-foreground/70">
          CRM Pro v1.0
        </div>
      </div>
    </div>
  );
};