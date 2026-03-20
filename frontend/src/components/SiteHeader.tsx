import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import nclogo from '@/assets/nc_logo.png';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  showActions?: boolean;
  customAction?: React.ReactNode;
  maxWidth?: string;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ showActions = true, customAction, maxWidth = "max-w-6xl" }) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-border px-6 py-4">
      <div className={cn(maxWidth, "mx-auto flex items-center justify-between")}>
        <Link to="/">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl">
              <img src={nclogo} alt="NC Logo" className="w-12 h-12 object-contain" />
            </div>
            <span className="font-black text-xl tracking-tighter text-teal-600">Northeastern College School ID</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {showActions && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/how-to-submit')}
                className="gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                <HelpCircle className="h-4 w-4" /> Support
              </Button>
              <Button
                variant="default"
                size="sm"
                className="hidden sm:flex rounded-full bg-[#001f3f] hover:bg-[#001f3f]/90 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#001f3f]/10"
                onClick={() => navigate('/submit-details')}
              >
                Get Started
              </Button>
            </>
          )}
          {customAction}
        </div>
      </div>
    </nav>
  );
};

export default SiteHeader;
