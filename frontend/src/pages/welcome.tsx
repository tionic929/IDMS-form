import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Facebook } from 'lucide-react';

// shadcn UI
import { Button } from "@/components/ui/button";
import SiteHeader from '@/components/SiteHeader';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <SiteHeader />

      {/* Main content wrapper to center content vertically */}
      <main className="flex-grow flex flex-col justify-center px-6 py-12 md:py-24">
        <div className="max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
              </span>
              Online Registration is Open
            </div>

            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Northeastern College <br />
                <span className="text-teal-600">ID Application</span>
              </h1>
              <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto">
                Submit your application online and get your official ID at the Northeastern College Information System Technical Support Office.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/submit-details')}
                className="h-14 px-8 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-widest shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-1 active:scale-95 gap-3"
              >
                Start Application
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/how-to-submit')}
                className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs tracking-widest transition-all active:scale-95"
              >
                How to Submit
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer pinned to bottom */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/NcNianIDv2/"
              target="_blank"
              rel="noreferrer"
              className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
            >
              <Facebook size={18} />
            </a>
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Visit us on Facebook</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <FooterLink onClick={() => navigate('/privacy-policy')}>Privacy</FooterLink>
            <FooterLink onClick={() => navigate('/terms-and-conditions')}>Terms</FooterLink>
            <FooterLink onClick={() => navigate('/about')}>Meet the Creators</FooterLink>
          </div>

          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase text-center md:text-right">
            BSIT 4B - IDTECH © {new Date().getFullYear()} Northeastern College
          </p>
        </div>
      </footer>
    </div>
  );
};

const FooterLink = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase hover:text-teal-600 transition-colors"
  >
    {children}
  </button>
);

export default Welcome;