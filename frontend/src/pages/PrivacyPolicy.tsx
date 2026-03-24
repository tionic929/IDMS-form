import React from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SiteHeader from '@/components/SiteHeader';

const PrivacyPolicy: React.FC = () => {
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#001f3f]/5 flex items-center justify-center text-[#001f3f]">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#001f3f]">Privacy Policy</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Last Updated: March 2026</p>
          </div>
        </div>

        <Card className="border-0 sm:border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-6 sm:p-10 prose prose-slate max-w-none">

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-8 flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-emerald-800 m-0">
                Northeastern College strictly complies with the Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012. We are committed to safeguarding the privacy of our applicants.
              </p>
            </div>

            <TypographySection title="1. Information We Collect">
              <p>When you use the NCID Application System, we collect the following Personally Identifiable Information (PII):</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Identification Details:</strong> Full name, official school ID number, and academic or employee status.</li>
                <li><strong>Contact Information:</strong> Valid email address and home address.</li>
                <li><strong>Academic/Employment Details:</strong> Application category (Student/Employee), associated program level, specific course/department, and relevant application modes (New, Reissuance, Shift).</li>
                <li><strong>Media Uploads:</strong> Digital 2x2 portrait photo, digital signature trace, and proof of payment/HR forms.</li>
              </ul>
            </TypographySection>

            <TypographySection title="2. Purposes for Processing Your Data">
              <p>Your personal information will be processed exclusively for the following purposes:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>To accurately verify identity and validate enrollment or employment statuses within the Northeastern College system.</li>
                <li>To generate, print, and distribute official institutional Identification Cards.</li>
                <li>To maintain an accurate central registry of issued IDs and track lost or reissued card patterns.</li>
                <li>To directly communicate important updates or inquiries regarding your ID application status.</li>
              </ul>
            </TypographySection>

            <TypographySection title="3. Data Retention">
              <p>Following the successful issuance of your identification card, your digital data (including photographs, scanned signatures, and receipts) will be retained securely in our databases for the duration of your active affiliation with Northeastern College. Certain logs may be preserved for historical or auditing compliance before eventual secure deletion.</p>
            </TypographySection>

            <TypographySection title="4. Data Protection & Processing">
              <p>Northeastern College implements robust technical, organizational, and physical security measures to protect your data against accidental, unlawful, or unauthorized destruction, loss, alteration, access, disclosure, or use. Only authorized personnel from the Information and Communications Technology (ICT) Department and assigned administrative officers are permitted to review your submittals.</p>
            </TypographySection>

            <TypographySection title="5. Your Rights as a Data Subject">
              <p>Under the Data Privacy Act, you have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Be informed on how your personal information is processed.</li>
                <li>Access the personal information we hold about you.</li>
                <li>Object to specific forms of data processing or profiling.</li>
                <li>Request the rectification of inaccurate or outdated data.</li>
                <li>Request the erasure of your personal records upon severance from the institution (subject to institutional requirements).</li>
              </ul>
            </TypographySection>

            <TypographySection title="Contact Information">
              <p>If you have questions, concerns, or requests relating to this Privacy Policy or your data, please contact the Northeastern College Data Protection Officer via <span className="font-semibold text-teal-600">dpo@nc.edu.ph</span> or the main ICT office.</p>
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

export default PrivacyPolicy;
