import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Step0ConsentProps {
    hasGivenConsent: boolean;
    onChange: (v: boolean) => void;
}

export const Step0Consent = ({ hasGivenConsent, onChange }: Step0ConsentProps) => (
    <section className="space-y-6">
        <div className="text-center space-y-2 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Agreement</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Terms & Privacy</h1>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Please review and agree before starting your application.
            </p>
        </div>

        <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl bg-transparent sm:bg-white -mx-4 sm:mx-0">
            <CardContent className="p-4 sm:p-6 space-y-5">
                {/* Policy text */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-600 leading-relaxed space-y-4 shadow-inner">
                    <p>
                        Welcome to the Northeastern College ID Application System. <br />By proceeding, you agree to our{' '}
                        <a
                            href="/terms-and-conditions"
                            target="_blank"
                            className="text-[#001f3f] font-bold underline decoration-2 underline-offset-2 hover:opacity-80 transition-opacity"
                        >
                            Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a
                            href="/privacy-policy"
                            target="_blank"
                            className="text-[#001f3f] font-bold underline decoration-2 underline-offset-2 hover:opacity-80 transition-opacity"
                        >
                            Privacy Policy
                        </a>.
                    </p>
                    <p>
                        You consent that the personal data you provide (Name, Address, ID Number, Photograph, Signature)
                        will be collected, stored, and processed securely by Northeastern College for the purpose of
                        generating your institutional ID card, in compliance with the Data Privacy Act of 2012.
                    </p>
                    <p className="text-xs text-slate-500 bg-white rounded-xl p-3 border border-slate-200">
                        ⚠️ Submitting falsified documents, forged signatures, or deliberately inaccurate information
                        may result in application rejection and potential disciplinary action.
                    </p>
                </div>

                {/* Checkbox */}
                <label className={`
          flex items-start sm:items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer
          transition-all duration-200 group select-none
          ${hasGivenConsent
                        ? 'border-[#001f3f] bg-[#001f3f]/5'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}
        `}>
                    <div className="relative flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <input
                            type="checkbox"
                            className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md cursor-pointer
                         checked:bg-[#001f3f] checked:border-[#001f3f] transition-all"
                            checked={hasGivenConsent}
                            onChange={e => onChange(e.target.checked)}
                        />
                        <CheckCircle2
                            size={13}
                            className="text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                            strokeWidth={3}
                        />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors leading-relaxed">
                        I have read and agree to the Terms & Conditions and Privacy Policy.
                    </span>
                </label>
            </CardContent>
        </Card>
    </section>
);