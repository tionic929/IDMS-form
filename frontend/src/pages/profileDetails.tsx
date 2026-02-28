import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, User, BookOpen,
  Camera, FileCheck, CheckCircle2, ShieldCheck,
  AlertCircle, UploadCloud, RefreshCw, Zap,
  Contact, MapPin, Sparkles, Pencil, Trash2, Maximize2,
  ChevronRight, Info, HelpCircle
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
  'AB': abLogo,
  'BEC': becLogo,
  'BSBA': bsbaLogo,
  'BSCRIM': bscrimLogo,
  'BSED': bsedLogo,
  'BEED': bsedLogo, // Map BEED to Education logo
  'BSGE': bsgeLogo,
  'BSHM': bshmLogo,
  'BSIT': bsitLogo,
  'BSN': bsnLogo,
  'COLA': colaLogo,
  'MASTERAL': masteralLogo,
  'MIDWIFERY': midwiferyLogo
};

const getDeptLogo = (course: string) => {
  const cleanCourse = course.trim().toUpperCase();
  // Try exact match first
  if (DEPT_LOGOS[cleanCourse]) return DEPT_LOGOS[cleanCourse];

  // Try prefix matching (for BSBA-MM, BSED-MATH, etc)
  for (const [key, logo] of Object.entries(DEPT_LOGOS)) {
    if (cleanCourse.startsWith(key)) return logo;
  }

  return null;
};

import Cropper from 'react-easy-crop';
import SignatureCanvas from 'react-signature-canvas';
import { getCroppedImg } from '@/lib/image-utils';

import { verifyIdNumber } from '@/api/reports';
import api from '@/api/axios';

// shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";


const LOCAL_BRIDGE_URL = import.meta.env.VITE_LOCAL_BRIDGE_URL || "https://glacial-samiyah-presutural.ngrok-free.dev";

interface FormState {
  idNumber: string;
  course: string;
  address: string;
  guardianName: string;
  guardianContact: string;
  id_picture: File | null;
  signature_picture: File | null;
}

const SubmitDetails: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    idNumber: '', course: '', address: '', guardianName: '', guardianContact: '',
    id_picture: null, signature_picture: null
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | ''>('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Registry, 3: Media

  // asset states
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [idCroppedAreaPixels, setIdCroppedAreaPixels] = useState<any>(null);
  const [sigCroppedAreaPixels, setSigCroppedAreaPixels] = useState<any>(null);

  const [sigType, setSigType] = useState<'draw' | 'upload'>('draw');
  const [showSigPad, setShowSigPad] = useState(false);
  const [showSigCropper, setShowSigCropper] = useState(false);
  const [tempSigData, setTempSigData] = useState<string | null>(null);
  const [rawIdImage, setRawIdImage] = useState<string | null>(null);
  const [idCropState, setIdCropState] = useState({ x: 0, y: 0 });
  const [idZoomState, setIdZoomState] = useState(1);
  const [sigCropState, setSigCropState] = useState({ x: 0, y: 0 });
  const [sigZoomState, setSigZoomState] = useState(1);

  const [rawSigPoints, setRawSigPoints] = useState<any[]>([]);
  const sigPad = React.useRef<any>(null);

  const isFormIncomplete = !form.idNumber || !form.id_picture || !form.signature_picture;


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'id_picture' | 'signature_picture') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'id_picture') {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const result = reader.result as string;
        setTempImage(result);
        setRawIdImage(result);
        setIdCropState({ x: 0, y: 0 });
        setIdZoomState(1);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    } else {
      setForm(prev => ({ ...prev, [field]: file }));
    }
  };


  const handleCropSave = async () => {
    if (tempImage && idCroppedAreaPixels) {
      const croppedBlob = await getCroppedImg(tempImage, idCroppedAreaPixels, 0, { horizontal: false, vertical: false }, 'image/jpeg');
      if (croppedBlob) {
        const file = new File([croppedBlob], "id_photo.jpg", { type: "image/jpeg" });
        setForm(prev => ({ ...prev, id_picture: file }));
        setIdCropState(crop);
        setIdZoomState(zoom);
        setShowCropper(false);
        setTempImage(null);
      }
    }
  };

  const handleSignatureSave = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      const dataUrl = sigPad.current.getCanvas().toDataURL('image/png');
      const points = sigPad.current.toData();
      setRawSigPoints(points);
      setTempSigData(dataUrl);
      setCrop(sigCropState);
      setZoom(sigZoomState);
      setShowSigPad(false);
      setShowSigCropper(true);
    }
  };

  const handleSigCropSave = async () => {
    if (tempSigData && sigCroppedAreaPixels) {
      const croppedBlob = await getCroppedImg(tempSigData, sigCroppedAreaPixels, 0, { horizontal: false, vertical: false }, 'image/png');
      if (croppedBlob) {
        const file = new File([croppedBlob], "signature.png", { type: "image/png" });
        setForm(prev => ({ ...prev, signature_picture: file }));
        setSigCropState(crop);
        setSigZoomState(zoom);
        setShowSigCropper(false);
        setTempSigData(null);
      }
    }
  };

  const clearSignature = () => {
    if (sigPad.current) {
      sigPad.current.clear();
      setRawSigPoints([]);
      setSigCropState({ x: 0, y: 0 });
      setSigZoomState(1);
    }
  };

  // Previews for ID and Signature
  const [idPreview, setIdPreview] = useState('');
  const [sigPreview, setSigPreview] = useState('');

  useEffect(() => {
    if (!form.id_picture) {
      setIdPreview('');
      return;
    }
    const url = URL.createObjectURL(form.id_picture);
    setIdPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.id_picture]);

  useEffect(() => {
    if (!form.signature_picture) {
      setSigPreview('');
      return;
    }
    const url = URL.createObjectURL(form.signature_picture);
    setSigPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.signature_picture]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormIncomplete) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null) formData.append(key, value as string | Blob);
      });

      await axios.post(`${LOCAL_BRIDGE_URL}/application-submit`, formData, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (form.idNumber.length >= 8) {
      const delayDebounceFn = setTimeout(async () => {
        setIsVerifying(true);
        try {
          const response = await verifyIdNumber(form.idNumber);
          setVerificationStatus('valid');
          setForm(prev => ({
            ...prev,
            course: response.course || prev.course
          }));
        } catch (err) {
          setVerificationStatus('invalid');
          setErrorMessage('School ID not found in registry');
        } finally { setIsVerifying(false); }
      }, 800);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [form.idNumber]);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 pb-20 selection:bg-[#001f3f]/10">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-1.5 rounded-xl">
              <img src={nclogo} alt="NC Logo" className="w-12 h-12 object-contain" />
            </div>
            <span className="font-black text-xl tracking-tighter text-teal-600">
              NCnian School ID
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
          >
            Cancel
          </Button>
        </div>
      </nav>

      <div className="max-w-xl mx-auto mt-8 px-4">
        {/* Horizontal Stepper */}
        <div className="flex items-center justify-between mb-10 px-2">
          {[
            { id: 1, label: 'Info', icon: <User size={14} /> },
            { id: 2, label: 'Registry', icon: <BookOpen size={14} /> },
            { id: 3, label: 'Media', icon: <Sparkles size={14} /> }
          ].map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all border-2",
                  currentStep === s.id ? "bg-[#001f3f] border-[#001f3f] text-white shadow-lg" :
                    currentStep > s.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-400"
                )}>
                  {currentStep > s.id ? <CheckCircle2 size={18} /> : s.icon}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  currentStep === s.id ? "text-[#001f3f]" : "text-slate-400"
                )}>{s.label}</span>
              </div>
              {i < 2 && (
                <div className={cn(
                  "flex-1 h-[2px] mb-6 mx-2 transition-colors",
                  currentStep > s.id ? "bg-emerald-500" : "bg-slate-100"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* STEP 1: Info */}
              {currentStep === 1 && (
                <section className="space-y-4">
                  <SectionHeader icon={<BookOpen />} title="School Credentials" />
                  <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                    <CardContent className="p-8 pb-10 space-y-6">
                      <FloatingLabelInput
                        label="Student ID Number"
                        value={form.idNumber}
                        onChange={(v: string) => setForm({ ...form, idNumber: v })}
                        status={verificationStatus}
                        isLoading={isVerifying}
                      />

                      <AnimatePresence>
                        {verificationStatus === 'valid' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="p-5 bg-blue-50/50 rounded-[2rem] flex items-center gap-4 border border-blue-100"
                          >
                            <div className="p-0.5 bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden shrink-0">
                              {getDeptLogo(form.course) ? (
                                <img
                                  src={getDeptLogo(form.course)!}
                                  alt={form.course}
                                  className="h-10 w-10 object-contain"
                                />
                              ) : (
                                <div className="h-10 w-10 flex items-center justify-center bg-blue-50">
                                  <ShieldCheck className="text-[#001f3f] h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-black/60 tracking-widest leading-none mb-1">ID Confirmed</p>
                              <p className="text-sm font-black text-black/80 tracking-tight">Course: {form.course}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* STEP 2: Registry */}
              {currentStep === 2 && (
                <section className="space-y-4">
                  <SectionHeader icon={<MapPin />} title="Contact & Personal Details" />
                  <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                    <CardContent className="p-8 space-y-6">
                      <FloatingLabelInput
                        label="Full Residence Address"
                        value={form.address}
                        onChange={(v: string) => setForm({ ...form, address: v })}
                      />

                      <div className="space-y-6">
                        <FloatingLabelInput
                          label="Full Name of Guardian"
                          value={form.guardianName}
                          onChange={(v: string) => setForm({ ...form, guardianName: v })}
                        />
                        <FloatingLabelInput
                          label="Guardian Contact No."
                          value={form.guardianContact}
                          onChange={(v: string) => setForm({ ...form, guardianContact: v })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* STEP 3: Media */}
              {currentStep === 3 && (
                <section className="space-y-4 pb-8">
                  <SectionHeader icon={<Sparkles />} title="Picture and Signature" />
                  <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                    <CardContent className="p-8 space-y-8">

                      <div className="flex flex-col items-center gap-6">
                        {/* ID PHOTO TRIGGER */}
                        <div className="w-full max-w-[200px] mx-auto">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block text-center mb-4">Portrait Capture</label>
                          <div className="relative group mx-auto">
                            <button
                              type="button"
                              onClick={() => {
                                if (rawIdImage) {
                                  setTempImage(rawIdImage);
                                  setCrop(idCropState);
                                  setZoom(idZoomState);
                                  setShowCropper(true);
                                } else {
                                  document.getElementById('id-p')?.click();
                                }
                              }}
                              className={cn(
                                "w-40 h-40 mx-auto rounded-full border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden bg-slate-50 hover:bg-white hover:border-[#001f3f] hover:shadow-xl",
                                form.id_picture && "border-solid border-[#001f3f] bg-white"
                              )}
                            >
                              {idPreview ? (
                                <img src={idPreview} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Camera className="h-8 w-8 text-slate-300 group-hover:text-[#001f3f] transition-colors" />
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Select</span>
                                </div>
                              )}

                              {idPreview && (
                                <div className="absolute inset-0 bg-[#001f3f]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                  <Maximize2 className="text-white h-5 w-5" />
                                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Adjust</span>
                                </div>
                              )}
                            </button>

                            {idPreview && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  document.getElementById('id-p')?.click();
                                }}
                                className="absolute top-0 right-0 h-10 w-10 p-0 rounded-full shadow-lg border border-slate-100 bg-white hover:bg-slate-50 text-slate-600 z-20"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <input type="file" id="id-p" hidden onChange={e => handleFileChange(e, 'id_picture')} />
                        </div>

                        {/* SIGNATURE MODULE */}
                        <div className="w-full space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block text-center">Digital Signature</label>
                          <div
                            className={cn(
                              "w-full h-40 rounded-[2rem] border-2 border-slate-100 bg-slate-50 flex items-center justify-center relative overflow-hidden transition-all group hover:border-blue-200 cursor-pointer",
                              form.signature_picture && "border-emerald-100 bg-emerald-50/30"
                            )}
                            onClick={() => setShowSigPad(true)}
                          >
                            {sigPreview ? (
                              <img src={sigPreview} className="max-w-[70%] max-h-[70%] object-contain" />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Pencil className="h-6 w-6 text-slate-300 transition-colors group-hover:text-[#001f3f]" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Touch to Sign</span>
                              </div>
                            )}

                            {sigPreview && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm(prev => ({ ...prev, signature_picture: null }));
                                  setRawSigPoints([]);
                                  setShowSigPad(true);
                                }}
                                className="absolute top-3 right-3 h-8 px-3 rounded-xl bg-white/80 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-white"
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                        <Info size={16} className="text-[#001f3f]/40 shrink-0" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-tight">
                          Photos must be professional. Signatures should be drawn clearly.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex gap-4 pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="h-16 px-8 rounded-full border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                  >
                    Back
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1 && verificationStatus !== 'valid') return;
                      setCurrentStep(prev => prev + 1);
                    }}
                    disabled={currentStep === 1 && verificationStatus !== 'valid'}
                    className="flex-1 h-16 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-xs tracking-[0.2em] transition-all shadow-xl shadow-navy-900/10 active:scale-95 uppercase"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || isFormIncomplete}
                    className="flex-1 h-16 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-xs tracking-[0.2em] transition-all shadow-xl shadow-navy-900/20 active:scale-95 uppercase flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        </AnimatePresence>

        {/* --- MODALS --- */}

        {/* ID PHOTO CROPPER MODAL */}
        <Dialog open={showCropper} onOpenChange={setShowCropper}>
          <DialogContent className="max-w-none w-full sm:max-w-[500px] h-full sm:h-auto p-0 overflow-hidden bg-white sm:rounded-[2.5rem] border-none flex flex-col">
            <DialogHeader className="p-6 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-black/80">
                  <Camera className="h-4 w-4" />
                  Align Portrait
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="relative flex-1 min-h-[400px] bg-slate-900 overflow-hidden">
              {tempImage && (
                <Cropper
                  image={tempImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 4}
                  onCropChange={setCrop}
                  onCropComplete={(_, pixels) => setIdCroppedAreaPixels(pixels)}
                  onZoomChange={setZoom}
                  minZoom={0.1}
                  classes={{
                    containerClassName: "bg-slate-950",
                    mediaClassName: "max-w-none",
                  }}
                />
              )}
            </div>

            <div className="p-8 space-y-6 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-black/50 uppercase tracking-wider shrink-0">Scale</span>
                <Input
                  type="range"
                  value={zoom}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-1.5 p-0 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#001f3f]"
                />
                <span className="text-[11px] font-bold text-black/50 w-8">{zoom.toFixed(1)}x</span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-slate-200"
                  onClick={() => { setShowCropper(false); setTempImage(null); }}
                >
                  Go Back
                </Button>
                <Button
                  className="flex-1 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-[#001f3f] text-white shadow-lg"
                  onClick={handleCropSave}
                >
                  Apply Crop
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* FULL-PAGE SIGNATURE MODAL */}
        <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
          <DialogContent className="max-w-none w-full h-full p-0 bg-white border-none flex flex-col md:max-w-2xl md:h-[70vh] md:rounded-[3rem] md:overflow-hidden">
            <DialogHeader className="p-8 border-b border-slate-100 bg-slate-50/50 backdrop-blur-xl shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-[#001f3f]">
                  <Pencil className="h-4 w-4" />
                  Sign Below
                </DialogTitle>
                <Button variant="ghost" size="sm" onClick={clearSignature} className="text-[10px] font-bold uppercase tracking-widest h-10 px-6 rounded-xl hover:bg-slate-100 text-slate-500">
                  Clear Canvas
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 bg-slate-50 relative overflow-hidden">
              <SignatureCanvas
                ref={(ref) => {
                  sigPad.current = ref;
                  if (ref && rawSigPoints.length > 0) {
                    ref.fromData(rawSigPoints);
                  }
                }}
                penColor="#001f3f"
                backgroundColor="white"
                minWidth={2.5}
                maxWidth={2.5}
                velocityFilterWeight={0}
                canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
              />
            </div>

            <div className="p-8 border-t border-slate-100 bg-white flex gap-4 shrink-0">
              <Button
                variant="outline"
                className="flex-1 h-16 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-slate-200"
                onClick={() => setShowSigPad(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-16 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-[#001f3f] text-white shadow-xl shadow-[#001f3f]/10"
                onClick={handleSignatureSave}
              >
                Confirm Signature
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* SIGNATURE CROPPER MODAL */}
        <Dialog open={showSigCropper} onOpenChange={setShowSigCropper}>
          <DialogContent className="max-w-none w-full sm:max-w-[500px] h-full sm:h-auto p-0 overflow-hidden bg-white sm:rounded-[2.5rem] border-none flex flex-col">
            <DialogHeader className="p-6 border-b border-slate-100 bg-[#001f3f] shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-white">
                  <Maximize2 className="h-4 w-4" />
                  Final Polish
                </DialogTitle>
                <Badge variant="outline" className="text-[10px] font-bold text-white/50 border-white/20 px-3">
                  Signature Mask
                </Badge>
              </div>
            </DialogHeader>

            <div className="relative flex-1 min-h-[400px] bg-slate-50 overflow-hidden">
              {tempSigData && (
                <Cropper
                  image={tempSigData}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onCropComplete={(_, pixels) => setSigCroppedAreaPixels(pixels)}
                  onZoomChange={setZoom}
                  minZoom={0.1}
                  restrictPosition={false}
                  classes={{
                    containerClassName: "bg-white",
                    mediaClassName: "max-w-none",
                  }}
                />
              )}
            </div>

            <div className="p-8 space-y-6 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Adjust</span>
                <Input
                  type="range"
                  value={zoom}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-1.5 p-0 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#001f3f]"
                />
                <span className="text-[11px] font-bold text-[#001f3f] w-8">{zoom.toFixed(1)}x</span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-slate-200"
                  onClick={() => { setShowSigCropper(false); setShowSigPad(true); }}
                >
                  Try Again
                </Button>
                <Button
                  className="flex-1 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-[#001f3f] text-white shadow-lg"
                  onClick={handleSigCropSave}
                >
                  Save Final
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-center mt-10 bottom-0 text-[10px] font-medium text-slate-400">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/how-to-submit')}
          className="gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" /> Support
        </Button>
      </p>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="flex items-center gap-4 pl-2">
    <div className="w-12 h-12 rounded-2xl bg-[#001f3f]/5 flex items-center justify-center text-black/80">
      {(React.cloneElement(icon as React.ReactElement, { size: 20, strokeWidth: 2.5 } as any))}
    </div>
    <h2 className="text-base font-extrabold uppercase tracking-tight text-black/80">{title}</h2>
  </div>
);

const FloatingLabelInput = ({ label, value, onChange, placeholder, status = 'idle', isLoading = false, type = "text" }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="w-full">
      <div className="relative group">
        <div className={cn(
          "absolute left-6 transition-all pointer-events-none z-10",
          (isFocused || hasValue) ? "-top-2.5 bg-white px-2 scale-90 text-[#001f3f] font-black" : "top-4 text-slate-400 font-bold"
        )}>
          <label className="text-[10px] uppercase tracking-[0.2em]">{label}</label>
        </div>
        <Input
          type={type}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={e => onChange(e.target.value)}
          className={cn(
            "h-14 border border-slate-200 bg-white px-6 rounded-2xl text-base font-semibold transition-all placeholder:text-transparent",
            "focus:border-[#001f3f] focus:ring-4 focus:ring-navy-900/5 outline-none shadow-sm",
            status === 'valid' && "border-emerald-500/30 bg-emerald-50/10",
            status === 'invalid' && "border-red-500/30 bg-red-50/10"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && <Loader2 className="animate-spin text-slate-300 h-4 w-4" />}
          {status === 'valid' && !isLoading && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          {status === 'invalid' && !isLoading && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
      </div>
    </div>
  );
};

export default SubmitDetails;
