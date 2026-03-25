import React from 'react';
import { Mail, KeyIcon, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput, SectionHeader, InfoBanner } from '../components/SharedUI';

interface Step4EmailProps {
    email: string;
    onEmailChange: (v: string) => void;
    inputCode: string;
    onInputCodeChange: (v: string) => void;
    isCodeSent: boolean;
    isSendingCode: boolean;
    isEmailVerified: boolean;
    expectedEmail: string | null;
    emailError: string;
    isValidEmail: (e: string) => boolean;
    onSendCode: () => void;
}

export const Step4Email = ({
    email, onEmailChange,
    inputCode, onInputCodeChange,
    isCodeSent, isSendingCode, isEmailVerified,
    expectedEmail, emailError, isValidEmail, onSendCode,
}: Step4EmailProps) => {
    const emailMismatch =
        expectedEmail !== null &&
        email.length > 5 &&
        email.toLowerCase() !== expectedEmail.toLowerCase();

    const sendDisabled =
        isSendingCode ||
        !isValidEmail(email) ||
        isEmailVerified ||
        emailMismatch;

    const emailStatus = (() => {
        if (isEmailVerified) return 'valid';
        if (email.length === 0) return 'idle';
        if (!isValidEmail(email)) return 'invalid';
        if (emailMismatch) return 'invalid';
        return 'idle';
    })() as 'idle' | 'valid' | 'invalid';

    return (
        <section className="space-y-4">
            <SectionHeader icon={<Mail />} title="Email Verification" />

            <InfoBanner icon={<Info size={15} className="text-slate-400" />} variant="info">
                A 6-digit code will be sent to your school email to confirm your identity.
            </InfoBanner>

            <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl bg-transparent sm:bg-white -mx-4 sm:mx-0">
                <CardContent className="p-2 sm:p-6 space-y-5">
                    {/* Email + Send button */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1">
                            <FloatingLabelInput
                                label="Official Email Address"
                                value={email}
                                onChange={onEmailChange}
                                type="email"
                                icon={<Mail className="h-4 w-4" />}
                                status={emailStatus}
                                autoComplete="email"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={onSendCode}
                            disabled={sendDisabled}
                            className="h-14 px-5 rounded-xl bg-[#001f3f] text-white font-bold text-xs shrink-0 disabled:opacity-40"
                        >
                            {isSendingCode
                                ? <Loader2 className="animate-spin h-4 w-4" />
                                : isCodeSent ? 'Resend' : 'Get Code'}
                        </Button>
                    </div>

                    {/* Email mismatch warning */}
                    <AnimatePresence>
                        {emailMismatch && (
                            <motion.div
                                key="mismatch"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 px-1 text-red-500"
                            >
                                <AlertCircle size={13} />
                                <p className="text-[11px] font-bold uppercase tracking-wide">
                                    Email does not match our records for this ID number
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* API error */}
                    {emailError && (
                        <p className="text-xs font-semibold text-red-600 px-2">{emailError}</p>
                    )}

                    {/* OTP input */}
                    <AnimatePresence>
                        {isCodeSent && !isEmailVerified && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden space-y-3"
                            >
                                <FloatingLabelInput
                                    label="6-Digit Verification Code"
                                    value={inputCode}
                                    onChange={onInputCodeChange}
                                    type="text"
                                    icon={<KeyIcon className="h-4 w-4" />}
                                    autoComplete="one-time-code"
                                />
                                <p className="text-xs text-blue-600 font-semibold px-1">
                                    📬 Check your email inbox for the code.
                                </p>
                            </motion.div>
                        )}

                        {/* Verified state */}
                        {isEmailVerified && (
                            <motion.div
                                key="verified"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100"
                            >
                                <CheckCircle2 className="text-emerald-500 h-5 w-5 shrink-0" />
                                <span className="text-sm font-semibold text-emerald-700">
                                    Email verified successfully.
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </section>
    );
};