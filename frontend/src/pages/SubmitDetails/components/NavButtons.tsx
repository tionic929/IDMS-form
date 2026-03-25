import React from 'react';
import { ArrowLeft, ChevronRight, ShieldCheck, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TOTAL_STEPS } from '../constants';

interface NavButtonsProps {
    currentStep: number;
    canProgress: boolean;
    isSubmitting: boolean;
    isLastStep: boolean;
    onBack: () => void;
    onNext: () => void;
    onSubmit: () => void;
    onHelp: () => void;
}

export const NavButtons = React.memo(({
    currentStep, canProgress, isSubmitting,
    isLastStep, onBack, onNext, onSubmit, onHelp,
}: NavButtonsProps) => (
    <div className={cn(
        'fixed sm:relative bottom-0 left-0 right-0 z-40',
        'flex flex-nowrap items-center gap-2 sm:gap-3',
        'p-4 sm:p-0 sm:pt-4 sm:mt-6',
        'bg-white/95 sm:bg-transparent',
        'backdrop-blur-md sm:backdrop-blur-none',
        'border-t border-slate-100 sm:border-0',
        'shadow-[0_-4px_24px_rgba(0,0,0,0.06)] sm:shadow-none',
    )}>
        {/* Help button */}
        <Button
            type="button"
            variant="ghost"
            onClick={onHelp}
            title="Help & Support"
            className="h-12 w-12 sm:w-auto px-0 sm:px-5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center shrink-0"
        >
            <HelpCircle size={19} className="sm:mr-2" />
            <span className="hidden sm:inline font-semibold text-sm">Help</span>
        </Button>

        {/* Back button */}
        {currentStep > 0 && (
            <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="h-12 px-4 sm:px-7 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all text-sm shadow-sm"
            >
                <ArrowLeft size={15} className="sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
            </Button>
        )}

        {/* Continue / Submit */}
        {!isLastStep ? (
            <Button
                type="button"           /* ← never "submit" until the final step */
                onClick={onNext}
                disabled={!canProgress}
                className={cn(
                    'flex-1 h-12 rounded-xl font-bold text-sm transition-all shadow-sm',
                    'bg-[#001f3f] hover:bg-[#001f3f]/90 text-white',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
            >
                Continue
                <ChevronRight size={17} className="ml-1.5" />
            </Button>
        ) : (
            <Button
                type="button"           /* ← explicit button click triggers handleSubmit, NOT form onSubmit */
                onClick={onSubmit}
                disabled={isSubmitting || !canProgress}
                className={cn(
                    'flex-1 h-12 rounded-xl font-bold text-sm transition-all shadow-sm',
                    'bg-[#001f3f] hover:bg-[#001f3f]/90 text-white',
                    'flex items-center justify-center gap-2.5',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
            >
                {isSubmitting
                    ? <><RefreshCw className="h-4 w-4 animate-spin" /> Submitting…</>
                    : <><ShieldCheck className="h-4 w-4" /> Submit Application</>
                }
            </Button>
        )}
    </div>
));

NavButtons.displayName = 'NavButtons';