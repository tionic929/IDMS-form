import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, UserCircle, FileText, CheckCircle, Send, HelpCircle,
  Sparkles, Contact, ShieldCheck, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import nclogo from '@/assets/nc_logo.png';

// shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SiteHeader from '@/components/SiteHeader';

const NC_TEAL = '#00928a';

const steps = [
  {
    title: "Prepare Your COR/Receipt and ID Number",
    desc: "Gather your Student Details, and other information before starting.",
    icon: <UserCircle className="h-5 w-5" />,
  },
  {
    title: "Fill the Application Form",
    desc: "Navigate to 'Submit Details' and ensure all personal information fields are correctly filled.",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Upload Documents",
    desc: "Attach a clear 2×2 profile picture and your signature as required by the system.",
    icon: <CheckCircle className="h-5 w-5" />,
  },
  {
    title: "Final Submission",
    desc: "Review your summary and click 'Submit'. A confirmation message will appear once successful.",
    icon: <Send className="h-5 w-5" />,
  },
];

const Instructions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white sm:bg-slate-50 font-sans pb-20 selection:bg-[#001f3f]/10">
      <SiteHeader />

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* Left Column: Introduction */}
          <motion.div
            className="lg:col-span-5 space-y-8 lg:sticky lg:top-32"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-6">
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-teal-100 bg-teal-50/30 text-teal-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                Guide / How to
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a2b3c] tracking-tight leading-[1.1]">
                How to Submit <br />
                <span className="text-teal-600">Details.</span>
              </h1>
              <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-md">
                Follow these simple steps to ensure your profiling information is correctly recorded in the <span className="text-[#1a2b3c] font-bold">Northeastern College Information System.</span>
              </p>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <p className="text-slate-400 text-xs font-semibold">
                Having trouble? Contact ICT Support at <br />
                <a href="mailto:support@nc.edu.ph" className="text-teal-600 hover:underline underline-offset-4 decoration-2 font-bold">
                  support@nc.edu.ph
                </a>
              </p>
            </div>
          </motion.div>

          {/* Right Column: Steps & CTA */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="border-none shadow-[0_30px_70px_-20px_rgba(0,0,0,0.06)] overflow-hidden rounded-[3.5rem] bg-white">
              <CardContent className="p-8 md:p-12 lg:p-14">
                {/* Steps Area */}
                <div className="space-y-0 relative">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-8 group">
                      {/* Icon + Step Connector */}
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full border border-teal-100 bg-teal-50/50 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all duration-300 text-teal-600 shadow-sm">
                          {step.icon}
                        </div>
                        {i < steps.length - 1 && (
                          <div className="w-[1.5px] h-12 bg-slate-100 my-2" />
                        )}
                      </div>
                      {/* Step Labels */}
                      <div className="pb-8 pt-2">
                        <h3 className="text-xl font-bold text-[#1a2b3c] mb-1.5 group-hover:text-teal-600 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Section - Solid Teal Block */}
                <div className="mt-6 p-8 md:p-10 rounded-[2.5rem] bg-teal-600 text-white relative overflow-hidden group shadow-xl shadow-teal-600/20">
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-1 text-center md:text-left">
                      <h3 className="font-bold text-xl">Ready to start?</h3>
                      <p className="text-teal-50/80 text-sm font-medium">The process takes less than 5 minutes.</p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => navigate('/submit-details')}
                      className="bg-white hover:bg-teal-50 text-teal-600 h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-lg transition-all active:scale-95 border-none w-full md:w-auto"
                    >
                      Start Submission
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Instructions;
