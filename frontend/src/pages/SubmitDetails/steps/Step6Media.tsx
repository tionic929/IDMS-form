import React from 'react';
import {
    Camera, Pencil, RefreshCw, UploadCloud, Info,
    CheckCircle2, Maximize2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeader, InfoBanner } from '../components/SharedUI';
import { cn } from '@/lib/utils';
import type { FormState, UserType, ApplicationType } from '../types';

interface Step6MediaProps {
    form: FormState;
    updateForm: (patch: Partial<FormState>) => void;
    userType: UserType;
    applicationType: ApplicationType;
    isReissuance: boolean;
    idPreview: string;
    sigPreview: string;
    paymentPreview: string;
    sigType: 'draw' | 'upload';
    onSigTypeChange: (t: 'draw' | 'upload') => void;
    onOpenSigPad: () => void;
    onIdFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Step6Media = ({
    form, updateForm, userType, applicationType, isReissuance,
    idPreview, sigPreview, paymentPreview,
    sigType, onSigTypeChange, onOpenSigPad, onIdFileChange,
}: Step6MediaProps) => {
    const showPayment = userType === 'STUDENT' || (userType === 'EMPLOYEE' && applicationType === 'NEW');
    const paymentLabel = userType === 'EMPLOYEE'
        ? 'HR Form'
        : form.payment_type === 'COR'
            ? 'Certificate of Registration (COR)'
            : 'Official Receipt (OR)';

    return (
        <section className="space-y-4 pb-6">
            <SectionHeader icon={<Camera />} title="Photo & Documents" />

            {isReissuance && (
                <InfoBanner icon={<Info size={15} className="text-blue-500" />} variant="blue">
                    Replacement ID: portrait photo and signature are optional if unchanged.
                    Payment proof is still required.
                </InfoBanner>
            )}

            {/* ── Photo & Signature card ── */}
            <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl bg-transparent sm:bg-white -mx-4 sm:mx-0">
                <CardContent className="p-4 sm:p-6 space-y-8">

                    {/* Portrait photo */}
                    <div className="flex flex-col items-center gap-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Portrait Photo {!isReissuance && <span className="text-red-500">*</span>}
                        </label>

                        <div className="relative group">
                            <button
                                type="button"
                                onClick={() => document.getElementById('id-photo-input')?.click()}
                                className={cn(
                                    'w-36 h-36 rounded-full border-2 overflow-hidden flex flex-col items-center justify-center transition-all',
                                    idPreview
                                        ? 'border-[#001f3f] bg-white'
                                        : 'border-dashed border-slate-300 bg-slate-50 hover:border-[#001f3f]/40 hover:bg-white',
                                )}
                            >
                                {idPreview ? (
                                    <img src={idPreview} className="w-full h-full object-cover" alt="ID Preview" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Camera className="h-7 w-7 text-slate-400" />
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Upload</span>
                                    </div>
                                )}
                                {idPreview && (
                                    <div className="absolute inset-0 bg-[#001f3f]/75 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Maximize2 className="text-white h-5 w-5" />
                                    </div>
                                )}
                            </button>

                            {idPreview && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={e => { e.stopPropagation(); document.getElementById('id-photo-input')?.click(); }}
                                    className="absolute -top-1 -right-1 h-9 w-9 p-0 rounded-full shadow-md border border-slate-100 bg-white text-slate-600"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>

                        <input
                            type="file"
                            id="id-photo-input"
                            hidden
                            accept="image/*"
                            onChange={onIdFileChange}
                        />

                        <p className="text-[10px] text-slate-400 font-semibold text-center max-w-[180px] leading-relaxed">
                            Use a clear, professional photo against a plain background.
                        </p>
                    </div>

                    {/* Signature — not for employees */}
                    {userType !== 'EMPLOYEE' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Digital Signature {!isReissuance && <span className="text-red-500">*</span>}
                                </label>
                                {/* Draw / Upload toggle */}
                                <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
                                    {(['draw', 'upload'] as const).map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => {
                                                onSigTypeChange(t);
                                                updateForm({ signature_picture: null });
                                            }}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize',
                                                sigType === t ? 'bg-white text-[#001f3f] shadow-sm' : 'text-slate-500 hover:text-slate-700',
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hidden upload input */}
                            <input
                                type="file"
                                id="sig-upload-input"
                                hidden
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) updateForm({ signature_picture: file });
                                }}
                            />

                            <div
                                className={cn(
                                    'w-full h-40 rounded-2xl border-2 border-dashed flex items-center justify-center',
                                    'relative overflow-hidden transition-all cursor-pointer',
                                    sigPreview
                                        ? 'border-emerald-200 bg-emerald-50/30'
                                        : 'border-slate-200 bg-slate-50 hover:border-[#001f3f]/30 hover:bg-white',
                                )}
                                onClick={() => {
                                    if (sigType === 'draw') onOpenSigPad();
                                    else document.getElementById('sig-upload-input')?.click();
                                }}
                            >
                                {sigPreview ? (
                                    <>
                                        <img src={sigPreview} className="max-w-[65%] max-h-[65%] object-contain" alt="Signature" />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={e => { e.stopPropagation(); updateForm({ signature_picture: null }); }}
                                            className="absolute top-2 right-2 h-7 px-3 rounded-lg bg-white text-[10px] font-black uppercase tracking-wide text-red-500 hover:bg-red-50 border border-slate-200 shadow-sm"
                                        >
                                            Clear
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400 hover:text-[#001f3f] transition-colors">
                                        <Pencil className="h-6 w-6" />
                                        <span className="text-xs font-bold">
                                            {sigType === 'draw' ? 'Tap to Draw Signature' : 'Tap to Upload'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {sigPreview && (
                                <div className="flex items-center gap-2 px-1">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-[11px] font-semibold text-emerald-600">Signature captured</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Payment / HR Form card ── */}
            {showPayment && (
                <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl bg-transparent sm:bg-white -mx-4 sm:mx-0">
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block text-center">
                            Upload {paymentLabel} <span className="text-red-500">*</span>
                        </label>

                        <div
                            className={cn(
                                'w-full min-h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center',
                                'relative overflow-hidden cursor-pointer transition-all',
                                paymentPreview
                                    ? 'border-emerald-200 bg-emerald-50/20'
                                    : 'border-slate-200 bg-slate-50 hover:border-[#001f3f] hover:bg-white',
                            )}
                            onClick={() => document.getElementById('payment-upload-input')?.click()}
                        >
                            {paymentPreview ? (
                                <>
                                    <img
                                        src={paymentPreview}
                                        className="w-full h-full object-contain max-h-[220px] p-4"
                                        alt="Payment proof"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={e => { e.stopPropagation(); updateForm({ payment_proof: null }); }}
                                        className="absolute top-2 right-2 h-7 px-3 rounded-lg bg-white/90 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 border border-slate-200 shadow-sm"
                                    >
                                        Remove
                                    </Button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-8 text-slate-400 hover:text-[#001f3f] transition-colors">
                                    <UploadCloud className="h-8 w-8" />
                                    <span className="text-xs font-bold">Tap to Upload</span>
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            id="payment-upload-input"
                            hidden
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) updateForm({ payment_proof: file });
                            }}
                        />

                        <InfoBanner icon={<Info size={14} className="text-amber-500" />} variant="warning">
                            Upload a clear, legible photo of your {paymentLabel}. Blurry or cropped images may cause rejection.
                        </InfoBanner>
                    </CardContent>
                </Card>
            )}
        </section>
    );
};