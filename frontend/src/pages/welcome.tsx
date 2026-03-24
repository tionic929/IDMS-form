import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ArrowRight, HelpCircle, ClipboardCheck, ShieldCheck, Facebook, Sparkles } from 'lucide-react';
import nclogo from '@/assets/nc_logo.png';
import ncbg from '@/assets/ncbg.png';

// shadcn UI
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SiteHeader from '@/components/SiteHeader';

const NC_TEAL = '#00928a';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-20 lg:py-24 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-10"
        >
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Online Registration is Open
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-[0.95] tracking-tight">
              Northeastern College <br /><span className="text-teal-500">ID</span> Application
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-lg font-medium leading-relaxed">
              Submit your application online and get your official ID at Northeastern College Information System Technical Support Office.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/submit-details')}
              className="group h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs tracking-widest shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 gap-3"
            >
              Start Application
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/how-to-submit')}
              className="h-14 px-8 rounded-2xl border-border bg-background text-foreground hover:bg-accent font-black text-xs tracking-widest transition-all active:scale-95"
            >
              How to Submit
            </Button>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block relative"
        >
          {/* Background Glow */}
          <div className="absolute inset-x-0 -top-16 h-64 bg-primary/20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />

          <div className="grid grid-cols-2 gap-6 relative z-10">
            <FeatureCard
              icon={<ClipboardCheck className="text-primary h-6 w-6" />}
              title="Quick Approval"
              desc="No more waiting weeks. Your ID gets processed and approved in record time."
              delay={0}
            />

            <FeatureCard
              icon={<ShieldCheck className="text-primary h-6 w-6" />}
              title="Safe & Private"
              desc="We keep your personal information locked away and strictly confidential."
              delay={0.1}
            />

            <FeatureCard
              icon={<HelpCircle className="text-primary h-6 w-6" />}
              title="Easy to Use"
              desc="Simple, step-of-step instructions help you finish your application without any stress."
              delay={0.2}
            />

            {/* Call to Action Card */}
            <div className="p-8 rounded-[2.5rem] bg-zinc-950 text-white flex flex-col justify-end space-y-4 shadow-2xl border border-white/10 overflow-hidden relative group h-full">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Easy Apply</p>
                <h3 className="text-xl font-black tracking-tight mt-1">Ready to start?</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">Get your ID today and enjoy a faster school experience.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-border bg-card py-12 lg:py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center flex-col md:flex-row lg:flex-row gap-2">
            <span className="text-[10px] font-black text-muted-foreground tracking-[0.3em]">visit our facebook page</span>
            <div className="flex gap-2">
              <a href="https://www.facebook.com/NcNianIDv2/" target="_blank" className="h-10 w-10 flex items-center justify-center rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm">
                <Facebook size={18} />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/privacy-policy')}
              className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase hover:text-primary transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate('/terms-and-conditions')}
              className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase hover:text-primary transition-colors"
            >
              Terms & Conditions
            </button>
          </div>
          <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase text-center md:text-right">
            Build 0.5B © {new Date().getFullYear()} Northeastern College · Developed by <br /><span className="text-foreground">Sherwin Adonis Vizcarra - II</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay, bgImage }: { icon: React.ReactNode; title: string; desc: string; delay: number; bgImage?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative p-6 rounded-[2rem] border border-border overflow-hidden group h-full bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >
    {/* Optional Background Image Layer */}
    {bgImage && (
      <div
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 scale-100 group-hover:scale-110 pointer-events-none transition-transform duration-700"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    )}

    <div className="relative z-10 flex flex-col h-full">
      <div className="mb-4 p-3 w-fit rounded-2xl bg-primary/5 group-hover:bg-zinc-300 transition-colors duration-300">
        <div className="group-hover:text-zinc-950 transition-colors duration-300">
          {icon}
        </div>
      </div>
      <h3 className="font-black text-sm text-foreground uppercase tracking-tight mb-2 group-hover:text-zinc-950 transition-colors">{title}</h3>
      <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{desc}</p>
    </div>
  </motion.div>
);

export default Welcome;