import React from 'react';
import { IdCard, CheckCircle2, AlertCircle, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingLabelInput, SectionHeader, InfoBanner } from '../components/SharedUI';
import { getDeptLogo } from '../constants';
import type { ApplicationType, VerificationStatus } from '../types';

interface Step3IDVerifyProps {
    applicationType: ApplicationType;
    idNumber: string;
    onIdChange: (v: string) => void;
    isVerifying: boolean;
    verificationStatus: VerificationStatus;
    isSecondIssuance: boolean;
    fetchedCourse: string;
    course: string;
    errorMessage: string;
}

export const Step3IDVerify = ({
    applicationType, idNumber, onIdChange,
    isVerifying, verificationStatus, isSecondIssuance,
    fetchedCourse, course, errorMessage,
}: Step3IDVerifyProps) => (
    <section className="space-y-4">
        <SectionHeader icon={<IdCard />} title={applicationType === 'NEW' ? 'Enter Your ID Number' : 'ID Verification'} />

        {applicationType === 'OLD' && (
            <InfoBanner icon={<Info size={15} className="text-slate-400" />} variant="info">
                Your ID must already exist in our records to apply for a replacement.
            </InfoBanner>
        )}

        <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl bg-transparent sm:bg-white -mx-4 sm:mx-0">
            <CardContent className="p-2 sm:p-6 space-y-5">
                <FloatingLabelInput
                    label="School ID Number"
                    value={idNumber}
                    onChange={onIdChange}
                    status={isSecondIssuance ? 'orange' : verificationStatus}
                    isLoading={isVerifying}
                    icon={<IdCard className="h-4 w-4" />}
                    autoComplete="off"
                />

                <AnimatePresence mode="wait">
                    {/* Invalid state */}
                    {verificationStatus === 'invalid' && !isVerifying && (
                        <motion.div
                            key="invalid"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100"
                        >
                            <AlertCircle className="text-red-500 h-5 w-5 shrink-0" />
                            <span className="text-sm font-medium text-red-700">{errorMessage}</span>
                        </motion.div>
                    )}

                    {/* Valid — new applicant */}
                    {verificationStatus === 'valid' && !isVerifying && !isSecondIssuance && (
                        <motion.div
                            key="valid-new"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100"
                        >
                            <CheckCircle2 className="text-emerald-500 h-5 w-5 shrink-0" />
                            <span className="text-sm font-medium text-emerald-700">
                                Valid ID Number. You may proceed.
                            </span>
                        </motion.div>
                    )}

                    {/* Valid — reissuance (existing record found) */}
                    {verificationStatus === 'valid' && !isVerifying && isSecondIssuance && (
                        <motion.div
                            key="valid-reissue"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-3"
                        >
                            <div className="flex items-center gap-2">
                                <Zap className="text-orange-500 h-4 w-4 shrink-0" />
                                <span className="text-xs font-black uppercase tracking-widest text-orange-700">
                                    Existing Record Found
                                </span>
                            </div>

                            {(fetchedCourse || course) && (
                                <div className="flex items-center gap-4 pl-6 border-l-2 border-orange-200 ml-1">
                                    {getDeptLogo(fetchedCourse || course) && (
                                        <img
                                            src={getDeptLogo(fetchedCourse || course)!}
                                            alt="Dept Logo"
                                            className="w-10 h-10 object-contain shrink-0 opacity-80"
                                        />
                                    )}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-500/60 mb-0.5">
                                            Registered Program
                                        </p>
                                        <p className="text-sm font-black text-orange-900">
                                            {fetchedCourse || course}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    </section>
);