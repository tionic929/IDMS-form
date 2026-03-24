import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SiteHeader from '@/components/SiteHeader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, User, BookOpen,
  Camera, FileCheck, CheckCircle2, ShieldCheck,
  AlertCircle, UploadCloud, RefreshCw, Zap,
  Contact, MapPin, Sparkles, Pencil, Trash2, Maximize2,
  ChevronRight, Info, HelpCircle, Mail, KeyIcon, Receipt,
  GraduationCap, Briefcase, IdCard, FileText
} from 'lucide-react';

import nclogo from '@/assets/nc_logo.png';

// Department Logos
import abLogo from '@/assets/dept_logo/ab.webp';
import becLogo from '@/assets/dept_logo/bec.webp';
import bsbaLogo from '@/assets/dept_logo/bsba.webp';
import bscrimLogo from '@/assets/dept_logo/bscrim.webp';
import bsedLogo from '@/assets/dept_logo/bsed.webp';
import bsgeLogo from '@/assets/dept_logo/bsge.webp';
import bshmLogo from '@/assets/dept_logo/bshm.webp';
import bsitLogo from '@/assets/dept_logo/bsit.webp';
import bsnLogo from '@/assets/dept_logo/bsn.webp';
import colaLogo from '@/assets/dept_logo/cola.webp';
import masteralLogo from '@/assets/dept_logo/masteral.webp';
import midwiferyLogo from '@/assets/dept_logo/midwifery.webp';

const DEPT_LOGOS: Record<string, string> = {
  'AB': abLogo, 'BEC': becLogo, 'BSBA': bsbaLogo, 'BSCRIM': bscrimLogo,
  'BSED': bsedLogo, 'BEED': bsedLogo, 'BSGE': bsgeLogo, 'BSHM': bshmLogo,
  'BSIT': bsitLogo, 'BSN': bsnLogo, 'COLA': colaLogo, 'MASTERAL': masteralLogo,
  'MIDWIFERY': midwiferyLogo
};

const getDeptLogo = (course: string) => {
  const clean = course.trim().toUpperCase();
  if (DEPT_LOGOS[clean]) return DEPT_LOGOS[clean];
  for (const [key, logo] of Object.entries(DEPT_LOGOS)) {
    if (clean.startsWith(key)) return logo;
  }
  return null;
};

const ApplicationModals = lazy(() => import('./ApplicationModals'));
import api from '@/api/axios';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type UserType = 'STUDENT' | 'EMPLOYEE' | null;
type ApplicationType = 'NEW' | 'OLD' | null;

interface FormState {
  idNumber: string;
  manual_full_name: string;
  email: string;
  course: string;
  schoolLevel: string;
  address: string;
  guardianName: string;
  guardianContact: string;
  lrn: string;
  department: string;
  contactInfo: string;
  id_picture: File | null;
  signature_picture: File | null;
  payment_type: 'COR' | 'OR' | 'HR_FORM' | '';
  payment_proof: File | null;
  reissuance_reason: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const REISSUANCE_REASONS = ['Lost ID', 'Damaged ID', 'Department Shift', 'Correction of Entry', 'Other'];
const COURSES = [
  'BSBA', 'BSN', 'BSCRIM', 'BSED', 'BSHM', 'BSIT', 'BSGE',
  'MASTERAL', 'EMPLOYEE', 'MIDWIFERY', 'AB', 'JD', 'ABM', 'ICT', 'STEM', 'HUMMS', 'BEC'
];

const getFilteredCourses = (level: string) => {
  if (level === 'BEC (Elem/Kinder/JHS)') return ['BEC'];
  if (level === 'SHS') return ['ABM', 'ICT', 'STEM', 'HUMMS'];
  if (level === 'College') return ['BSBA', 'BSN', 'BSCRIM', 'BSED', 'BSHM', 'BSIT', 'BSGE', 'MIDWIFERY', 'AB', 'JD'];
  if (level === 'Masteral') return ['MASTERAL'];
  if (level === 'Doctoral') return ['DOCTORAL', 'JD'];
  return COURSES;
};

// Steps: 0=UserType, 1=AppType, 2=IDVerify, 3=EmailVerify, 4=Details, 5=Media, 6=Submit
const STEP_LABELS = [
  { label: 'Consent', icon: <FileText size={14} /> },
  { label: 'Applicant', icon: <User size={14} /> },
  { label: 'Category', icon: <FileText size={14} /> },
  { label: 'ID Number', icon: <IdCard size={14} /> },
  { label: 'Email', icon: <Mail size={14} /> },
  { label: 'Details', icon: <BookOpen size={14} /> },
  { label: 'Media', icon: <Camera size={14} /> },
  { label: 'Submit', icon: <ShieldCheck size={14} /> },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const SubmitDetails: React.FC = () => {
  const navigate = useNavigate();

  // ── Step & flow state ──
  const [hasGivenConsent, setHasGivenConsent] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<UserType>(null);
  const [applicationType, setApplicationType] = useState<ApplicationType>(null);
  const applicationTypeRef = useRef<ApplicationType>(null);

  // Keep ref in sync
  useEffect(() => { applicationTypeRef.current = applicationType; }, [applicationType]);

  // ── Form state ──
  const [form, setForm] = useState<FormState>({
    idNumber: '', manual_full_name: '', email: '', course: '', schoolLevel: '', address: '',
    guardianName: '', guardianContact: '', lrn: '', department: '', contactInfo: '',
    id_picture: null, signature_picture: null, payment_type: 'COR',
    payment_proof: null, reissuance_reason: ''
  });

  // ── ID Verification state ──
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [isSecondIssuance, setIsSecondIssuance] = useState(false);
  const [showReissuanceModal, setShowReissuanceModal] = useState(false);
  const [showExistingRecordModal, setShowExistingRecordModal] = useState(false);
  const [fetchedCourse, setFetchedCourse] = useState('');

  // ── Email / OTP state ──
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [expectedEmail, setExpectedEmail] = useState<string | null>(null);

  // ── Submission & Status state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // ── Status Polling ──
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (applicationStatus === 'pending') {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/applications/${form.idNumber}/status`);
          if (res.data.status && res.data.status !== 'pending') {
            setApplicationStatus(res.data.status as any);
            if (res.data.rejection_reason) {
              setRejectionReason(res.data.rejection_reason);
            }
          }
        } catch (e) {
          console.error('Status polling failed', e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [applicationStatus, form.idNumber]);

  // ── Image / Signature state ──
  const [rawIdImage, setRawIdImage] = useState<string | null>(null);
  const [sigType, setSigType] = useState<'draw' | 'upload'>('draw');
  const [showSigPad, setShowSigPad] = useState(false);

  // ── Previews ──
  const [idPreview, setIdPreview] = useState('');
  const [sigPreview, setSigPreview] = useState('');
  const [paymentPreview, setPaymentPreview] = useState('');

  useEffect(() => {
    if (!form.id_picture) { setIdPreview(''); return; }
    const url = URL.createObjectURL(form.id_picture);
    setIdPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.id_picture]);

  useEffect(() => {
    if (!form.signature_picture) { setSigPreview(''); return; }
    const url = URL.createObjectURL(form.signature_picture);
    setSigPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.signature_picture]);

  useEffect(() => {
    if (!form.payment_proof) { setPaymentPreview(''); return; }
    const url = URL.createObjectURL(form.payment_proof);
    setPaymentPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.payment_proof]);

  // ── OTP auto-verify ──
  useEffect(() => {
    if (generatedCode && inputCode === generatedCode) {
      setIsEmailVerified(true);
    } else {
      setIsEmailVerified(false);
    }
  }, [inputCode, generatedCode]);

  // ── ID verification debounce ──
  useEffect(() => {
    setVerificationStatus('idle');
    setIsEmailVerified(false);
    setIsCodeSent(false);
    setGeneratedCode(null);
    setInputCode('');
    setIsSecondIssuance(false);
    setFetchedCourse('');
    setExpectedEmail(null);

    if (form.idNumber.length >= 8) {
      const timer = setTimeout(async () => {
        const appType = applicationTypeRef.current;
        setIsVerifying(true);
        try {
          const { data: checkData } = await api.post('/students/check-existing', { idNumber: form.idNumber });

          if (checkData.exists) {
            if (appType === 'NEW') {
              // NEW applicant but record exists — block and show redirect modal
              setVerificationStatus('invalid');
              setShowExistingRecordModal(true);
            } else {
              // OLD applicant — proceed with reissuance flow
              setVerificationStatus('valid');
              setIsSecondIssuance(true);
              setShowReissuanceModal(true);
            }
            setFetchedCourse(checkData.data?.course || '');
            setExpectedEmail(checkData.data.email || null);
            setForm(prev => ({
              ...prev,
              email: appType === 'NEW' ? (checkData.data.email || prev.email) : prev.email,
              manual_full_name: checkData.data.manual_full_name || prev.manual_full_name,
              address: checkData.data.address || prev.address,
              guardianName: checkData.data.guardianName || prev.guardianName,
              guardianContact: checkData.data.guardianContact || prev.guardianContact,
              course: checkData.data.course || prev.course,
            }));
          } else {
            if (appType === 'NEW') {
              setVerificationStatus('valid');
            } else {
              setVerificationStatus('invalid');
              setErrorMessage('ID Number not found. Reissuance requires an existing record.');
            }
          }
        } catch {
          setVerificationStatus('invalid');
          setErrorMessage('System error. Please verify connection and try again.');
        } finally {
          setIsVerifying(false);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.idNumber]);

  // ── Auto-compute Payment Type ──
  useEffect(() => {
    if (userType === 'EMPLOYEE') {
      if (applicationType === 'NEW') {
        const computedType = 'HR_FORM';
        if (form.payment_type !== computedType) {
          setForm(prev => ({ ...prev, payment_type: computedType }));
        }
      } else {
        if (form.payment_type !== '') {
          setForm(prev => ({ ...prev, payment_type: '' }));
        }
      }
    } else {
      const isDeptShift = form.reissuance_reason === 'Department Shift';
      const computedType = (applicationType === 'NEW' || isDeptShift) ? 'COR' : 'OR';
      if (form.payment_type !== computedType) {
        setForm(prev => ({ ...prev, payment_type: computedType }));
      }
    }
  }, [applicationType, form.reissuance_reason, userType]);

  // ─── Step Validation ─────────────────────────────────────────────────────

  const isStep2Valid = verificationStatus === 'valid';

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStep3Valid = isEmailVerified;

  const isStep4Valid = (() => {
    if (userType === 'STUDENT') {
      if (applicationType === 'NEW') {
        return (
          form.manual_full_name.trim().length >= 3 &&
          form.address.trim().length >= 5 &&
          form.guardianName.trim().length >= 3 &&
          /^\d{11}$/.test(form.guardianContact) &&
          form.lrn.trim().length >= 6 &&
          form.course !== ''
        );
      }
      // OLD/reissuance student
      return (
        form.manual_full_name.trim().length >= 3 &&
        form.address.trim().length >= 5 &&
        form.guardianName.trim().length >= 3 &&
        /^\d{11}$/.test(form.guardianContact) &&
        form.reissuance_reason !== '' &&
        (form.reissuance_reason === 'Department Shift' ? form.course !== '' : true)
      );
    }
    if (userType === 'EMPLOYEE') {
      if (applicationType === 'NEW') {
        return (
          form.manual_full_name.trim().length >= 3 &&
          form.address.trim().length >= 5 &&
          form.contactInfo.trim().length >= 7 &&
          form.department.trim().length >= 2
        );
      }
      // OLD/reissuance employee
      return (
        form.manual_full_name.trim().length >= 3 &&
        form.reissuance_reason !== ''
      );
    }
    return false;
  })();

  const isReissuance = isSecondIssuance || applicationType === 'OLD';
  const isStep5Valid = applicationType === 'NEW'
    ? userType === 'EMPLOYEE'
      ? form.id_picture !== null && form.payment_proof !== null
      : form.id_picture !== null && form.signature_picture !== null && form.payment_proof !== null
    : true;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'id_picture' | 'signature_picture') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (field === 'id_picture') {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setRawIdImage(reader.result as string);
      });
      reader.readAsDataURL(file);
    } else {
      setForm(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleSendCode = async () => {
    if (!form.email || !form.email.includes('@')) return;
    setIsSendingCode(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    try {
      await api.post('/send-otp', {
        email: form.email,
        code: code,
      });
      setIsCodeSent(true);
    } catch (error) {
      setErrorMessage('Failed to send verification code. Please try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isReissuance) {
      if (!window.confirm('You are about to re-submit an application for an existing record. This will be marked as a RE-ISSUANCE. Do you want to proceed?')) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null) formData.append(key, value as string | Blob);
      });
      await api.post('/students', formData);
      setApplicationStatus('pending');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setApplicationStatus('idle');
      setErrorMessage('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => setCurrentStep(prev => prev + 1);
  const goBack = () => setCurrentStep(prev => prev - 1);

  // ─── Render helpers ───────────────────────────────────────────────────────

  const stepCanProgress = (): boolean => {
    if (currentStep === 0) return hasGivenConsent;
    if (currentStep === 1) {
      if (userType === 'EMPLOYEE') return true;
      if (userType === 'STUDENT') return form.schoolLevel !== '';
      return false;
    }
    if (currentStep === 2) return applicationType !== null;
    if (currentStep === 3) return isStep2Valid;
    if (currentStep === 4) return isStep3Valid;
    if (currentStep === 5) return isStep4Valid;
    if (currentStep === 6) return isStep5Valid;
    return false;
  };

  const isLastStep = currentStep === 7;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-full bg-white sm:bg-slate-50 font-sans text-zinc-900 pb-28 sm:pb-10 selection:bg-[#001f3f]/10">

      <SiteHeader
        showActions={false}
        customAction={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-slate-600 font-semibold text-xs transition-colors"
          >
            Cancel
          </Button>
        }
      />

      <div className="max-w-xl mx-auto sm:mt-8">

        {/* Stepper — Desktop */}
        {currentStep > 0 && (
          <div className="hidden sm:flex items-center justify-between mb-8 px-4 overflow-x-auto gap-1">
            {STEP_LABELS.slice(1).map((s, i) => {
              const stepId = i + 1;
              return (
                <React.Fragment key={stepId}>
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center transition-all border-2",
                      currentStep === stepId ? "bg-[#001f3f] border-[#001f3f] text-white shadow-sm" :
                        currentStep > stepId ? "bg-emerald-500 border-emerald-500 text-white" :
                          "bg-white border-slate-200 text-slate-400"
                    )}>
                      {currentStep > stepId ? <CheckCircle2 size={15} /> : s.icon}
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold tracking-wider whitespace-nowrap",
                      currentStep === stepId ? "text-[#001f3f]" : "text-slate-400"
                    )}>{s.label}</span>
                  </div>
                  {i < STEP_LABELS.length - 2 && (
                    <div className={cn(
                      "flex-1 h-[1px] mb-5 transition-colors min-w-[8px]",
                      currentStep > stepId ? "bg-emerald-500" : "bg-slate-200"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Stepper — Mobile */}
        {currentStep > 0 && (
          <div className="sm:hidden px-4 py-4 bg-slate-50/50 border-b border-slate-100 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Step {currentStep} of 7</span>
              <span className="text-xs font-bold text-[#001f3f]">{STEP_LABELS[currentStep]?.label}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-4 sm:px-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >

              {/* ── STEP 0: Privacy Consent ── */}
              {currentStep === 0 && (
                <section className="space-y-6">
                  <div className="text-center space-y-2 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Agreement</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Terms & Privacy</h1>
                    <p className="text-sm text-slate-500">Please review the terms before starting your application.</p>
                  </div>

                  <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl overflow-hidden bg-transparent sm:bg-white -mx-4 sm:mx-0">
                    <CardContent className="p-4 sm:p-6 space-y-6">
                      <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed font-medium space-y-4 shadow-inner">
                        <p>
                          Welcome to the Northeastern College ID Application System. By proceeding with this application, you agree to our <a href="/terms-and-conditions" target="_blank" className="text-[#001f3f] font-bold underline decoration-2 underline-offset-2 hover:text-[#001f3f]/80 transition-colors">Terms and Conditions</a> and our <a href="/privacy-policy" target="_blank" className="text-[#001f3f] font-bold underline decoration-2 underline-offset-2 hover:text-[#001f3f]/80 transition-colors">Privacy Policy</a>.
                        </p>
                        <p>
                          You consent that the personal data you provide (such as your Name, Address, ID Number, Photograph, and Signature) will be collected, stored, and processed securely by Northeastern College for the explicit purpose of generating your institutional ID card, in compliance with the Data Privacy Act of 2012.
                        </p>
                        <p>
                          Submitting falsified documents, forged signatures, or deliberately inaccurate information may lead to the rejection of your application and potential disciplinary action.
                        </p>
                      </div>

                      <label className="flex items-start sm:items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                        <div className="relative flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                          <input 
                            type="checkbox" 
                            className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-[#001f3f] checked:border-[#001f3f] transition-all"
                            checked={hasGivenConsent}
                            onChange={(e) => setHasGivenConsent(e.target.checked)}
                          />
                          <CheckCircle2 size={14} className="text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 select-none group-hover:text-slate-900 transition-colors">
                          I have read and agree to the Terms & Conditions and Privacy Policy.
                        </span>
                      </label>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* ── STEP 1: User Type ── */}
              {currentStep === 1 && (
                <section className="space-y-6">
                  <div className="text-center space-y-2 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Applicant Type</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Who are you?</h1>
                    <p className="text-sm text-slate-500">Please select your role.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {([
                      { type: 'STUDENT' as UserType, icon: <GraduationCap size={32} />, desc: 'Currently enrolled' },
                      { type: 'EMPLOYEE' as UserType, icon: <Briefcase size={32} />, desc: 'Faculty and Staff' }
                    ]).map(({ type, icon, desc }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setUserType(type);
                          if (type === 'EMPLOYEE') {
                            setForm(prev => ({ ...prev, schoolLevel: '' }));
                          }
                        }}
                        className={cn(
                          "flex flex-col items-center gap-3 py-6 px-4 rounded-2xl border transition-all relative",
                          userType === type
                            ? "border-[#001f3f] bg-[#001f3f]/5 text-[#001f3f] shadow-sm"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        )}
                      >
                        <div className={cn(userType === type ? "text-[#001f3f]" : "text-slate-400")}>
                          {icon}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-sm">{type}</p>
                          <p className={cn("text-xs mt-1", userType === type ? "text-[#001f3f]/70" : "text-slate-400")}>{desc}</p>
                        </div>
                        {userType === type && (
                          <CheckCircle2 size={18} className="text-[#001f3f] absolute top-3 right-3" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* School Level Selection for Students */}
                  <AnimatePresence>
                    {userType === 'STUDENT' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <h3 className="text-center font-semibold text-slate-700 text-sm">Select School Level <span className="text-red-500">*</span></h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {['BEC (Elem/Kinder/JHS)', 'SHS', 'College', 'Masteral', 'Doctoral'].map(lvl => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, schoolLevel: lvl }))}
                              className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center",
                                form.schoolLevel === lvl
                                  ? "border-[#001f3f] bg-[#001f3f]/5 text-[#001f3f] shadow-sm"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                              )}
                            >
                              <span className="font-medium text-xs">{lvl}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              )}

              {/* ── STEP 2: Application Type ── */}
              {currentStep === 2 && (
                <section className="space-y-6">
                  <div className="text-center space-y-2 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {userType} Application
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Application Category</h1>
                    <p className="text-sm text-slate-500">
                      Select <strong>First-time Applicant</strong> if you have never applied for an ID before.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {([
                      { type: 'NEW' as ApplicationType, label: 'First-time Applicant', desc: 'No previous ID issued', icon: <Sparkles size={32} /> },
                      { type: 'OLD' as ApplicationType, label: 'Replacement ID', desc: 'Replacing an existing ID', icon: <RefreshCw size={32} /> },
                    ]).map(({ type, label, desc, icon }) => (
                      <button
                        key={type!}
                        type="button"
                        onClick={() => setApplicationType(type)}
                        className={cn(
                          "flex flex-col items-center gap-3 py-6 px-4 rounded-2xl border transition-all relative",
                          applicationType === type
                            ? "border-[#001f3f] bg-[#001f3f]/5 text-[#001f3f] shadow-sm"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        )}
                      >
                        <div className={cn(applicationType === type ? "text-[#001f3f]" : "text-slate-400")}>{icon}</div>
                        <div className="text-center">
                          <p className="font-semibold text-sm">{label}</p>
                          <p className={cn("text-xs mt-1", applicationType === type ? "text-[#001f3f]/70" : "text-slate-400")}>{desc}</p>
                        </div>
                        {applicationType === type && <CheckCircle2 size={18} className="text-[#001f3f] absolute top-3 right-3" />}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* ── STEP 3: ID Verification ── */}
              {currentStep === 3 && (
                <section className="space-y-4">
                  <SectionHeader icon={<IdCard />} title={applicationType === 'NEW' ? "Enter ID Number" : "ID Verification"} />
                  {applicationType === 'OLD' && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <Info size={16} className="text-slate-400 shrink-0" />
                      <p className="text-xs font-medium text-slate-600 leading-tight">
                        Your ID must exist in our records to apply for a replacement.
                      </p>
                    </div>
                  )}

                  <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl overflow-hidden bg-transparent sm:bg-white -mx-4 sm:mx-0">
                    <CardContent className="p-2 sm:p-6 space-y-6">
                      <FloatingLabelInput
                        label="School ID Number"
                        value={form.idNumber}
                        onChange={(v: string) => setForm({ ...form, idNumber: v })}
                        status={isSecondIssuance ? 'orange' : verificationStatus}
                        isLoading={isVerifying}
                        icon={<IdCard className="h-4 w-4" />}
                      />

                      <AnimatePresence>
                        {verificationStatus === 'invalid' && !isVerifying && applicationType === 'OLD' && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3"
                          >
                            <AlertCircle className="text-red-500 h-5 w-5 shrink-0" />
                            <span className="text-sm font-medium text-red-700">{errorMessage}</span>
                          </motion.div>
                        )}

                        {verificationStatus === 'valid' && !isVerifying && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                          >
                            {!isSecondIssuance ? (
                              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500 h-5 w-5 shrink-0" />
                                <span className="text-sm font-medium text-emerald-700">
                                  Valid ID. You may now proceed.
                                </span>
                              </div>
                            ) : (
                              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-4">
                                <div className="flex items-center gap-3">
                                  <Zap className="text-orange-500 h-5 w-5 shrink-0" />
                                  <span className="text-sm font-bold text-orange-700 uppercase tracking-tight">
                                    Existing Record Found
                                  </span>
                                </div>
                                
                                {(fetchedCourse || form.course) && (
                                  <div className="flex items-center gap-4 pl-8 border-l-2 border-orange-200/50 ml-2.5">
                                    {getDeptLogo(fetchedCourse || form.course) && (
                                      <img
                                        src={getDeptLogo(fetchedCourse || form.course)!}
                                        alt="Dept Logo"
                                        className="w-10 h-10 object-contain shrink-0 opacity-80"
                                      />
                                    )}
                                    <div className="space-y-0.5">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-600/60">Registered Program</p>
                                      <p className="text-sm font-black text-orange-900 leading-tight">
                                        {fetchedCourse || form.course}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* ── STEP 4: Email Verification ── */}
              {currentStep === 4 && (
                <section className="space-y-4">
                  <SectionHeader icon={<Mail />} title="Email Verification" />
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Info size={16} className="text-slate-400 shrink-0" />
                    <p className="text-xs font-medium text-slate-600 leading-tight">
                      A 6-digit code will be sent to your school email address to confirm identity.
                    </p>
                  </div>

                  <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl overflow-hidden bg-transparent sm:bg-white -mx-4 sm:mx-0">
                    <CardContent className="p-2 sm:p-6 space-y-6">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1">
                          <FloatingLabelInput
                            label="Official Email Address"
                            value={form.email}
                            onChange={(v: string) => setForm({ ...form, email: v })}
                            type="email"
                            icon={<Mail className="h-4 w-4" />}
                            status={isEmailVerified ? 'valid' : (form.email.length > 0 ? (isValidEmail(form.email) ? (expectedEmail ? (form.email.toLowerCase() === expectedEmail.toLowerCase() ? 'idle' : 'invalid') : 'idle') : 'invalid') : 'idle')}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleSendCode}
                          disabled={isSendingCode || !isValidEmail(form.email) || isEmailVerified || (expectedEmail !== null && form.email.toLowerCase() !== expectedEmail.toLowerCase())}
                          className="h-14 px-5 rounded-xl bg-[#001f3f] text-white font-semibold text-xs mt-1 sm:mt-0 shrink-0"
                        >
                          {isSendingCode
                            ? <Loader2 className="animate-spin h-4 w-4" />
                            : isCodeSent ? 'Resend' : 'Get Code'
                          }
                        </Button>
                      </div>

                      {expectedEmail && form.email.length > 5 && form.email.toLowerCase() !== expectedEmail.toLowerCase() && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="px-2 py-1 flex items-center gap-2 text-red-500"
                        >
                          <AlertCircle size={12} />
                          <p className="text-[10px] font-bold uppercase tracking-tight">Email does not match our records for this ID</p>
                        </motion.div>
                      )}

                      <AnimatePresence>
                        {isCodeSent && !isEmailVerified && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                          >
                            <FloatingLabelInput
                              label="6-Digit Verification Code"
                              value={inputCode}
                              onChange={setInputCode}
                              type="text"
                              icon={<KeyIcon className="h-4 w-4" />}
                            />
                            <p className="text-xs text-blue-600 font-medium px-2">
                              Check your email inbox for the verification code.
                            </p>
                          </motion.div>
                        )}

                        {isEmailVerified && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3"
                          >
                            <CheckCircle2 className="text-emerald-500 h-5 w-5" />
                            <span className="text-sm font-medium text-emerald-700">Email verified successfully.</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* ── STEP 5: Details Form ── */}
              {currentStep === 5 && (
                <section className="space-y-4">
                  <SectionHeader icon={<BookOpen />} title="Personal Details" />

                  {isSecondIssuance && (
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <Zap size={16} className="text-orange-500 shrink-0" />
                      <p className="text-xs font-medium text-orange-700 leading-tight">
                        Some fields are pre-filled from your existing record. Please review and update as needed.
                      </p>
                    </div>
                  )}

                  <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl overflow-hidden bg-transparent sm:bg-white -mx-4 sm:mx-0">
                    <CardContent className="p-2 sm:p-6 space-y-6">
                      <FloatingLabelInput
                        label="Full Name (as written on your form)"
                        value={form.manual_full_name}
                        onChange={(v: string) => setForm({ ...form, manual_full_name: v })}
                        status={form.manual_full_name.length > 0 ? (form.manual_full_name.length >= 3 ? 'valid' : 'invalid') : 'idle'}
                        icon={<User className="h-4 w-4" />}
                      />

                      <FloatingLabelInput
                        label="Full Residence Address"
                        value={form.address}
                        onChange={(v: string) => setForm({ ...form, address: v })}
                        status={form.address.length > 0 ? (form.address.length >= 5 ? 'valid' : 'invalid') : 'idle'}
                        icon={<MapPin className="h-4 w-4" />}
                      />

                      {/* STUDENT-specific fields */}
                      {userType === 'STUDENT' && (
                        <>
                          {/* Course selection for NEW application */}
                          {applicationType === 'NEW' && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-2 mb-4 mt-2"
                            >
                              <label className="text-xs font-semibold text-slate-500 block px-2">
                                Course / Program <span className="text-red-500">*</span>
                              </label>
                              <select
                                className="w-full h-14 border border-slate-200 bg-white px-6 rounded-xl text-base font-semibold focus:border-[#001f3f] focus:ring-4 focus:ring-navy-900/5 outline-none shadow-sm"
                                value={form.course}
                                onChange={(e) => setForm({ ...form, course: e.target.value })}
                              >
                                <option value="">Select Course...</option>
                                {getFilteredCourses(form.schoolLevel).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </motion.div>
                          )}

                          {applicationType === 'NEW' && (
                            <FloatingLabelInput
                              label="LRN (Learner Reference Number)"
                              value={form.lrn}
                              onChange={(v: string) => setForm({ ...form, lrn: v.replace(/\D/g, '').slice(0, 12) })}
                              status={form.lrn.length > 0 ? (form.lrn.length >= 6 ? 'valid' : 'invalid') : 'idle'}
                              icon={<FileCheck className="h-4 w-4" />}
                            />
                          )}

                          {/* Shared Guardian Fields for Students */}
                          <FloatingLabelInput
                            label="Full Name of Guardian"
                            value={form.guardianName}
                            onChange={(v: string) => setForm({ ...form, guardianName: v })}
                            status={form.guardianName.length > 0 ? (form.guardianName.length >= 3 ? 'valid' : 'invalid') : 'idle'}
                            icon={<Contact className="h-4 w-4" />}
                          />
                          <FloatingLabelInput
                            label="Guardian Contact No. (09XXXXXXXXX)"
                            value={form.guardianContact}
                            onChange={(v: string) => setForm({ ...form, guardianContact: v.replace(/\D/g, '').slice(0, 11) })}
                            status={form.guardianContact.length > 0 ? (form.guardianContact.length === 11 ? 'valid' : 'invalid') : 'idle'}
                          />
                        </>
                      )}

                      {/* EMPLOYEE-specific fields */}
                      {userType === 'EMPLOYEE' && applicationType === 'NEW' && (
                        <>
                          <FloatingLabelInput
                            label="Department / Role"
                            value={form.department}
                            onChange={(v: string) => setForm({ ...form, department: v })}
                            status={form.department.length > 0 ? (form.department.length >= 2 ? 'valid' : 'invalid') : 'idle'}
                            icon={<Briefcase className="h-4 w-4" />}
                          />
                          <FloatingLabelInput
                            label="Contact Number"
                            value={form.contactInfo}
                            onChange={(v: string) => setForm({ ...form, contactInfo: v.replace(/\D/g, '').slice(0, 11) })}
                            status={form.contactInfo.length > 0 ? (form.contactInfo.length >= 7 ? 'valid' : 'invalid') : 'idle'}
                          />
                        </>
                      )}

                      {/* Reason for Replacement (Shared for OLD Students and Employees) */}
                      {applicationType === 'OLD' && (
                        <>
                          <div className="space-y-2 mt-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block px-2">
                              Reason for Replacement <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full h-14 border border-slate-200 bg-white px-6 rounded-2xl text-base font-semibold focus:border-[#001f3f] focus:ring-4 focus:ring-navy-900/5 outline-none shadow-sm"
                              value={form.reissuance_reason}
                              onChange={(e) => setForm({ ...form, reissuance_reason: e.target.value })}
                            >
                              <option value="">Select Reason...</option>
                              {REISSUANCE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>

                          {/* Department Shift — only case where course is editable */}
                          {userType === 'STUDENT' && form.reissuance_reason === 'Department Shift' && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-2 mt-4"
                            >
                              <label className="text-xs font-semibold text-slate-500 block px-2">
                                New Department / Course <span className="text-red-500">*</span>
                              </label>
                              <select
                                className="w-full h-14 border border-slate-200 bg-white px-6 rounded-xl text-base font-semibold focus:border-[#001f3f] focus:ring-4 focus:ring-navy-900/5 outline-none shadow-sm"
                                value={form.course}
                                onChange={(e) => setForm({ ...form, course: e.target.value })}
                              >
                                <option value="">Select New Course...</option>
                                {getFilteredCourses(form.schoolLevel).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </motion.div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* ── STEP 6: Media Upload ── */}
              {currentStep === 6 && (
                <section className="space-y-4 pb-8">
                  <SectionHeader icon={<Camera />} title="Photo & Signature" />

                  {isReissuance && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <Info size={16} className="text-blue-500 shrink-0" />
                      <p className="text-xs font-medium text-blue-700 leading-tight">
                        Replacement ID: photo and signature are optional if unchanged. Payment proof is still required.
                      </p>
                    </div>
                  )}

                  <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl overflow-hidden bg-transparent sm:bg-white -mx-4 sm:mx-0">
                    <CardContent className="p-2 sm:p-6 space-y-8">
                      {/* ID PHOTO */}
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-full max-w-[200px] mx-auto">
                          <label className="text-xs font-semibold text-slate-500 block text-center mb-4">
                            Portrait Photo {!isReissuance && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative group mx-auto">
                            <button
                              type="button"
                              onClick={() => {
                                document.getElementById('id-p')?.click();
                              }}
                              className={cn(
                                "w-40 h-40 mx-auto rounded-full border border-slate-200 flex flex-col items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden bg-slate-50 hover:bg-slate-100",
                                form.id_picture && "border-solid border-[#001f3f] bg-white"
                              )}
                            >
                              {idPreview ? (
                                <img src={idPreview} className="w-full h-full object-cover" alt="ID Preview" />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Camera className="h-8 w-8 text-slate-400 group-hover:text-[#001f3f] transition-colors" />
                                  <span className="text-xs font-semibold text-slate-500">Select</span>
                                </div>
                              )}
                              {idPreview && (
                                <div className="absolute inset-0 bg-[#001f3f]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                  <Maximize2 className="text-white h-5 w-5" />
                                  <span className="text-xs font-semibold text-white">Adjust</span>
                                </div>
                              )}
                            </button>
                            {idPreview && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); document.getElementById('id-p')?.click(); }}
                                className="absolute top-0 right-0 h-10 w-10 p-0 rounded-full shadow-lg border border-slate-100 bg-white hover:bg-slate-50 text-slate-600 z-20"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <input type="file" id="id-p" hidden accept="image/*" onChange={e => handleFileChange(e, 'id_picture')} />
                        </div>

                        {/* SIGNATURE */}
                        {userType !== 'EMPLOYEE' && (
                          <div className="w-full space-y-4">
                            <div className="flex items-center justify-between px-2">
                              <label className="text-xs font-semibold text-slate-500">
                                Digital Signature {!isReissuance && <span className="text-red-500">*</span>}
                              </label>
                              <div className="flex bg-slate-100 p-1 rounded-xl">
                                {(['draw', 'upload'] as const).map(t => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSigType(t);
                                      if (t === 'draw' && form.signature_picture)
                                        setForm(prev => ({ ...prev, signature_picture: null }));
                                      if (t === 'upload' && form.signature_picture) {
                                        setForm(prev => ({ ...prev, signature_picture: null }));
                                      }
                                    }}
                                    className={cn(
                                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
                                      sigType === t ? "bg-white text-[#001f3f] shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <input
                              type="file" id="sig-file-upload" hidden accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) { setForm(prev => ({ ...prev, signature_picture: file })); }
                              }}
                            />

                            <div
                              className={cn(
                                "w-full h-40 rounded-2xl border-2 border-slate-100 bg-slate-50 flex items-center justify-center relative overflow-hidden transition-all group hover:border-[#001f3f]/30 cursor-pointer",
                                sigPreview && "border-solid border-emerald-100 bg-emerald-50/30"
                              )}
                              onClick={() => {
                                if (sigType === 'draw') setShowSigPad(true);
                                else document.getElementById('sig-file-upload')?.click();
                              }}
                            >
                              {sigPreview ? (
                                <img src={sigPreview} className="max-w-[70%] max-h-[70%] object-contain" alt="Signature" />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Pencil className="h-6 w-6 text-slate-400 group-hover:text-[#001f3f] transition-colors" />
                                  <span className="text-xs font-semibold text-slate-500">
                                    {sigType === 'draw' ? 'Touch to Sign' : 'Tap to Upload'}
                                  </span>
                                </div>
                              )}
                              {sigPreview && (
                                <Button
                                  type="button" variant="ghost" size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setForm(prev => ({ ...prev, signature_picture: null }));
                                  }}
                                  className="absolute top-3 right-3 h-8 px-3 rounded-xl bg-white text-xs font-semibold text-red-500 hover:bg-slate-50 border border-slate-200 shadow-sm"
                                >
                                  Reset
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                        <Info size={16} className="text-[#001f3f]/40 shrink-0" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-tight">
                          Photos must be professional. Signatures should be drawn clearly on a white background.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment / HR Form Upload */}
                  {(userType === 'STUDENT' || (userType === 'EMPLOYEE' && applicationType === 'NEW')) && (
                    <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl overflow-hidden bg-transparent sm:bg-white -mx-4 sm:mx-0">
                      <CardContent className="p-2 sm:p-6 space-y-6">
                        <div className="space-y-3">
                          <label className="text-xs font-semibold text-slate-500 block text-center">
                            {userType === 'EMPLOYEE'
                              ? 'Upload HR Form'
                              : `Upload ${form.payment_type === 'COR' ? 'Certificate of Registration (COR)' : 'Official Receipt (OR)'}`} <span className="text-red-500">*</span>
                          </label>
                          <div
                            className={cn(
                              "w-full min-h-[160px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden transition-all group hover:border-[#001f3f] hover:bg-white cursor-pointer",
                              form.payment_proof && "border-solid border-emerald-200 bg-emerald-50/30"
                            )}
                            onClick={() => document.getElementById('payment-upload')?.click()}
                          >
                            {paymentPreview ? (
                              <img src={paymentPreview} className="w-full h-full object-contain max-h-[240px] p-4" alt="Payment proof" />
                            ) : (
                              <div className="flex flex-col items-center gap-3 py-6">
                                <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-[#001f3f] transition-colors" />
                                <span className="text-xs font-semibold text-slate-500">Tap to Upload</span>
                              </div>
                            )}
                            {paymentPreview && (
                              <Button
                                type="button" variant="ghost" size="sm"
                                onClick={(e) => { e.stopPropagation(); setForm(prev => ({ ...prev, payment_proof: null })); }}
                                className="absolute top-3 right-3 h-8 px-3 rounded-xl bg-white/80 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-white"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <input
                            type="file" id="payment-upload" hidden
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setForm(prev => ({ ...prev, payment_proof: file }));
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <Info size={16} className="text-amber-500/60 shrink-0" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 leading-tight">
                            Upload a clear photo of your {form.payment_type === 'COR' ? 'Certificate of Registration' : 'Official Receipt'}.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </section>
              )}

              {/* ── STEP 7: Review & Submit ── */}
              {currentStep === 7 && (
                <section className="space-y-4">
                  <SectionHeader icon={<ShieldCheck />} title="Review & Submit" />

                  <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl overflow-hidden bg-transparent sm:bg-white -mx-4 sm:mx-0">
                    <CardContent className="p-2 sm:p-6 space-y-5">
                      <ReviewRow label="User Type" value={userType ?? '—'} />
                      <ReviewRow label="Application Mode" value={isReissuance ? 'Replacement' : 'New Application'} highlight={isReissuance ? 'orange' : 'green'} />
                      <ReviewRow label="ID Number" value={form.idNumber} />
                      <ReviewRow label="Full Name" value={form.manual_full_name} />
                      <ReviewRow label="Email" value={form.email} />
                      {form.course && <ReviewRow label="Course / Dept" value={form.course} />}
                      {form.address && <ReviewRow label="Address" value={form.address} />}
                      {form.reissuance_reason && <ReviewRow label="Replacement Reason" value={form.reissuance_reason} />}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 w-28">ID Photo</span>
                        {idPreview
                          ? <img src={idPreview} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200" alt="ID" />
                          : <span className="text-xs font-bold text-slate-400">{isReissuance ? 'Not updated' : 'Missing'}</span>}
                      </div>
                      {userType !== 'EMPLOYEE' && (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-500 w-28">Signature</span>
                          {sigPreview
                            ? <img src={sigPreview} className="h-10 max-w-[120px] object-contain border border-slate-200 rounded-lg p-1" alt="Sig" />
                            : <span className="text-xs font-bold text-slate-400">{isReissuance ? 'Not updated' : 'Missing'}</span>}
                        </div>
                      )}
                      <ReviewRow label="Payment Type" value={form.payment_type} />
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 w-28">
                          {userType === 'EMPLOYEE' ? (applicationType === 'NEW' ? 'HR Form' : 'Payment Proof') : 'Payment Proof'}
                        </span>
                        {paymentPreview || (userType === 'EMPLOYEE' && applicationType === 'OLD') // Employee replacement implies they already uploaded earlier if needed or none needed
                          ? <CheckCircle2 className="text-emerald-500 h-5 w-5" />
                          : <AlertCircle className="text-red-500 h-5 w-5" />}
                      </div>
                    </CardContent>
                  </Card>

                  {isReissuance && (
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <Zap size={16} className="text-orange-500 shrink-0" />
                      <p className="text-xs font-semibold text-orange-700 leading-tight">
                        This submission will be marked as a RE-ISSUANCE and will update your existing record.
                      </p>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      <p className="text-xs font-semibold text-red-700 leading-tight">
                        Submission failed. Please check your connection and try again.
                      </p>
                    </div>
                  )}
                </section>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation Buttons ── */}
          <div className="fixed sm:relative bottom-0 left-0 right-0 p-4 sm:p-0 bg-white/90 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-slate-200 sm:border-0 z-40 flex flex-nowrap items-center gap-2 sm:gap-3 pt-4 sm:pt-4 sm:pb-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sm:shadow-none mt-2 sm:mt-6">
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/how-to-submit')}
              className="h-14 w-14 sm:w-auto px-0 sm:px-6 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all flex items-center justify-center shrink-0"
              title="Help & Support"
            >
              <HelpCircle size={20} className="sm:mr-2" />
              <span className="hidden sm:inline font-semibold text-sm">Help</span>
            </Button>

            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="h-14 px-4 sm:px-8 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all text-sm shadow-sm"
              >
                <ArrowLeft size={16} className="sm:mr-2" /> <span className="hidden sm:inline">Back</span>
              </Button>
            )}

            {currentStep < 7 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={!stepCanProgress()}
                className="flex-1 h-14 rounded-xl bg-[#001f3f] hover:bg-[#001f3f]/90 text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50"
              >
                Continue <ChevronRight size={18} className="ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !isStep5Valid}
                className="flex-1 h-14 rounded-xl bg-[#001f3f] hover:bg-[#001f3f]/90 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting
                  ? <><RefreshCw className="h-5 w-5 animate-spin" /> Submitting…</>
                  : <><ShieldCheck className="h-5 w-5" /> Submit Application</>
                }
              </Button>
            )}
          </div>
        </form>

        {/* ── MODALS ── */}

        <Suspense fallback={null}>
          <ApplicationModals
            idImageSrc={rawIdImage}
            onIdSaved={(file) => { setForm(prev => ({ ...prev, id_picture: file })); setRawIdImage(null); }}
            onIdCancel={() => setRawIdImage(null)}

            showSignaturePad={showSigPad}
            onSignatureSaved={(file) => { setForm(prev => ({ ...prev, signature_picture: file })); setShowSigPad(false); }}
            onSignatureCancel={() => setShowSigPad(false)}

            applicationStatus={applicationStatus}
            rejectionReason={rejectionReason}
            onGoHome={() => navigate('/')}

            showReplacementModal={showReissuanceModal}
            onDismissReplacement={() => setShowReissuanceModal(false)}
            idNumber={form.idNumber}
            fetchedCourse={fetchedCourse}
            getDeptLogo={(c) => getDeptLogo(c) || ''}

            showExistingRecordModal={showExistingRecordModal}
            onSwitchToReplacement={() => {
              setShowExistingRecordModal(false);
              setApplicationType('OLD');
              setIsSecondIssuance(true);
              setVerificationStatus('valid');
              setCurrentStep(2);
            }}
            onUseDifferentId={() => {
              setShowExistingRecordModal(false);
              setForm(prev => ({ ...prev, idNumber: '' }));
              setVerificationStatus('idle');
            }}
          />
        </Suspense>

      </div>

      <p className="hidden text-center mt-10 bottom-0"></p>
    </div>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────────

const SectionHeader = React.memo(({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-3 pl-1">
    <div className="w-10 h-10 rounded-xl bg-[#001f3f]/5 flex items-center justify-center text-slate-700">
      {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: 2 } as any)}
    </div>
    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
  </div>
));

const ReviewRow = React.memo(({
  label, value, highlight
}: {
  label: string; value: string; highlight?: 'orange' | 'green';
}) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <span className="text-xs font-semibold text-slate-500 shrink-0">{label}</span>
    <span className={cn(
      "text-sm font-semibold text-right truncate max-w-[60%]",
      highlight === 'orange' && "text-orange-600",
      highlight === 'green' && "text-emerald-600",
      !highlight && "text-slate-800"
    )}>
      {value}
    </span>
  </div>
));

const FloatingLabelInput = React.memo(({
  label, value, onChange, placeholder, status = 'idle',
  isLoading = false, type = "text", icon, statusLabel
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="w-full">
      <div className="relative group">
        <div className={cn(
          "absolute left-4 transition-all pointer-events-none z-10 flex items-center gap-2",
          (isFocused || hasValue)
            ? "-top-2.5 bg-white px-2 scale-90 text-[#001f3f] font-semibold"
            : "top-4 text-slate-400 font-medium"
        )}>
          {icon && <span className="shrink-0">{icon}</span>}
          <label className="text-xs">{label}</label>
          {status === 'orange' && statusLabel && (
            <span className="text-[10px] font-semibold text-orange-600 ml-2 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-100">
              {statusLabel}
            </span>
          )}
        </div>
        <Input
          type={type}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-14 border border-slate-200 bg-white px-5 rounded-xl text-sm font-semibold transition-all placeholder:text-transparent",
            "focus:border-[#001f3f] focus:ring-4 focus:ring-navy-900/5 outline-none shadow-sm",
            status === 'valid' && "border-emerald-500/30 bg-emerald-50/10",
            status === 'invalid' && "border-red-500/30 bg-red-50/10",
            status === 'orange' && "border-orange-500 bg-orange-50 ring-2 ring-orange-500/10"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && <Loader2 className="animate-spin text-slate-300 h-4 w-4" />}
          {status === 'valid' && !isLoading && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          {status === 'invalid' && !isLoading && <AlertCircle className="h-4 w-4 text-red-500" />}
          {status === 'orange' && !isLoading && <Zap className="h-4 w-4 text-orange-500 animate-pulse" />}
        </div>
      </div>
    </div>
  );
});

export default SubmitDetails;