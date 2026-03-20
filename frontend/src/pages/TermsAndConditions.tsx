import React from 'react';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SiteHeader from '@/components/SiteHeader';

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 text-slate-800">
      <SiteHeader
        showActions={false}
        customAction={
          <Button
            variant="ghost" size="sm" onClick={() => navigate(-1)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#001f3f]/5 flex items-center justify-center text-[#001f3f]">
            <FileText size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#001f3f]">Terms and Conditions</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Last Updated: March 2026</p>
          </div>
        </div>

        <Card className="border-0 sm:border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-6 sm:p-10 prose prose-slate max-w-none">
            
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-8 flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-emerald-800 m-0">
                Please read these terms and conditions carefully before using our application. By accessing or using the NCID Application System, you agree to be bound by these terms.
              </p>
            </div>

            <TypographySection title="1. Purpose of the Application">
              <p>The Northeastern College ID Application System (NCID) is a digital platform designed for the submission and processing of applications for formal school identification cards for currently enrolled students, faculty, and administrative staff.</p>
            </TypographySection>

            <TypographySection title="2. Accuracy of Information">
              <p>You agree to provide true, accurate, current, and complete information about yourself as prompted by the application form. You are responsible for ensuring the accuracy of your submitted personal details, including but not limited to, your official ID number, affiliated department/course, and correctly spelled full name.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Providing false documentation, forged payment receipts (OR/COR), or using another individual’s credentials is strictly prohibited.</li>
                <li>Applications containing deliberate misinformation or profane language will be automatically rejected.</li>
              </ul>
            </TypographySection>

            <TypographySection title="3. Data Collection & Media Requirements">
              <p>As part of the ID generation process, you will be required to upload a professional 2x2 photograph containing your face alongside a digital signature.</p>
              <p className="mt-2">You acknowledge and agree that:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Photographs failing to meet standard academic/professional criteria (e.g., obscuring the face, inappropriate attire) will be rejected, thus delaying the issuance of the ID.</li>
                <li>Digital signatures must be authentic and accurately reflect your legally binding signature.</li>
              </ul>
            </TypographySection>

            <TypographySection title="4. Reissuance and Replacements">
              <p>Applications marked under "Replacement ID" (Reissuance) due to loss, damage, or department shift are subject to standard reissuance protocols. You confirm that any details updated during a re-issuance (such as address or contact details) supersede previous records.</p>
            </TypographySection>

            <TypographySection title="5. System Availability">
              <p>While we strive to ensure the NCID System is available uninterrupted, access may be occasionally suspended or restricted to allow for repairs, maintenance, or the introduction of new facilities. Northeastern College bears no liability for delays in ID processing resulting from unscheduled system downtimes.</p>
            </TypographySection>

            <TypographySection title="6. Amendments">
              <p>Northeastern College reserves the right to modify these Terms and Conditions at any time. Significant changes will be explicitly communicated via official school channels. Your continued use of the system following any such changes constitutes your acceptance of the new Terms.</p>
            </TypographySection>

          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const TypographySection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="mb-8">
    <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
    <div className="text-sm text-slate-600 leading-relaxed font-medium">
      {children}
    </div>
  </section>
);

export default TermsAndConditions;
