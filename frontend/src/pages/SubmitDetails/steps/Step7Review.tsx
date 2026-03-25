import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader, ReviewRow } from '../components/SharedUI';
import type { FormState, UserType, ApplicationType } from '../types';

interface Step7ReviewProps {
    form: FormState;
    userType: UserType;
    applicationType: ApplicationType;
    isReissuance: boolean;
    idPreview: string;
    sigPreview: string;
    paymentPreview: string;
    submitError: string;
}

const MediaThumb = ({
    src, alt, shape = 'square', fallback,
}: { src: string; alt: string; shape?: 'circle' | 'square'; fallback: string }) =>
    src ? (
        <img
            src={src}
            alt={alt}
            className={`h-10 ${shape === 'circle' ? 'w-10 rounded-full' : 'max-w-[120px] rounded-lg p-1'} object-cover border-2 border-emerald-200`}
        />
    ) : (
        <span className="text-xs font-bold text-slate-400">{fallback}</span>
    );

export const Step7Review = ({
    form, userType, applicationType, isReissuance,
    idPreview, sigPreview, paymentPreview, submitError,
}: Step7ReviewProps) => {
    const paymentLabel = userType === 'EMPLOYEE' && applicationType === 'NEW'
        ? 'HR Form'
        : userType === 'EMPLOYEE' && applicationType === 'OLD'
            ? 'N/A'
            : 'Payment Proof';

    const paymentUploaded = !!paymentPreview || (userType === 'EMPLOYEE' && applicationType === 'OLD');

    return (
        <section className="space-y-4">
            <SectionHeader icon={<ShieldCheck />} title="Review & Submit" />

            <p className="text-xs text-slate-500 font-medium px-1">
                Double-check your information before submitting. You cannot edit after submission.
            </p>

            <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl bg-transparent sm:bg-white -mx-4 sm:mx-0">
                <CardContent className="p-4 sm:p-6 divide-y divide-slate-50">

                    {/* Identity */}
                    <div className="pb-4 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Identity</p>
                        <ReviewRow label="Applicant Type" value={userType ?? '—'} />
                        <ReviewRow
                            label="Application Mode"
                            value={isReissuance ? 'Replacement / Re-issuance' : 'New Application'}
                            highlight={isReissuance ? 'orange' : 'green'}
                        />
                        <ReviewRow label="ID Number" value={form.idNumber} />
                        <ReviewRow label="Full Name" value={form.manual_full_name} />
                        <ReviewRow label="Email" value={form.email} />
                    </div>

                    {/* Academic / Employment */}
                    <div className="py-4 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Details</p>
                        {form.course && <ReviewRow label="Course / Dept" value={form.course} />}
                        {form.address && <ReviewRow label="Address" value={form.address} />}
                        {form.department && <ReviewRow label="Department" value={form.department} />}
                        {form.reissuance_reason && (
                            <ReviewRow label="Replacement Reason" value={form.reissuance_reason} />
                        )}
                        <ReviewRow label="Payment Type" value={form.payment_type || '—'} />
                    </div>

                    {/* Uploads */}
                    <div className="pt-4 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Uploads</p>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">Portrait Photo</span>
                            <MediaThumb
                                src={idPreview}
                                alt="ID"
                                shape="circle"
                                fallback={isReissuance ? 'Not updated' : '⚠ Missing'}
                            />
                        </div>

                        {userType !== 'EMPLOYEE' && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-400">Signature</span>
                                <MediaThumb
                                    src={sigPreview}
                                    alt="Signature"
                                    shape="square"
                                    fallback={isReissuance ? 'Not updated' : '⚠ Missing'}
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">{paymentLabel}</span>
                            {paymentUploaded
                                ? <CheckCircle2 className="text-emerald-500 h-5 w-5" />
                                : <AlertCircle className="text-red-500 h-5 w-5" />}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reissuance warning */}
            {isReissuance && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <Zap size={15} className="text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-orange-700 leading-relaxed">
                        This submission will be flagged as a <strong>RE-ISSUANCE</strong> and will update
                        your existing record on file.
                    </p>
                </div>
            )}

            {/* Submit error */}
            {submitError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle size={15} className="text-red-500 shrink-0" />
                    <p className="text-xs font-semibold text-red-700">{submitError}</p>
                </div>
            )}
        </section>
    );
};