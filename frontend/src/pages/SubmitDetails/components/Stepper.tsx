import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEP_LABELS, TOTAL_STEPS } from '../constants';

interface StepperProps {
    currentStep: number;
}

export const Stepper = React.memo(({ currentStep }: StepperProps) => {
    if (currentStep === 0) return null;

    const visibleLabels = STEP_LABELS.slice(1); // skip consent step (step 0) in stepper UI

    return (
        <>
            {/* ── Desktop stepper ── */}
            <div className="hidden sm:flex items-center justify-between mb-10 px-2 overflow-x-auto gap-1">
                {visibleLabels.map((s, i) => {
                    const stepId = i + 1;
                    const isActive = currentStep === stepId;
                    const isComplete = currentStep > stepId;

                    return (
                        <React.Fragment key={stepId}>
                            <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <div className={cn(
                                    'h-9 w-9 rounded-full flex items-center justify-center transition-all border-2',
                                    isActive && 'bg-[#001f3f] border-[#001f3f] text-white shadow-md',
                                    isComplete && 'bg-emerald-500 border-emerald-500 text-white',
                                    !isActive && !isComplete && 'bg-white border-slate-200 text-slate-400',
                                )}>
                                    {isComplete ? <CheckCircle2 size={15} /> : s.icon}
                                </div>
                                <span className={cn(
                                    'text-[10px] font-bold tracking-wider whitespace-nowrap uppercase',
                                    isActive ? 'text-[#001f3f]' : 'text-slate-400',
                                )}>
                                    {s.label}
                                </span>
                            </div>

                            {i < visibleLabels.length - 1 && (
                                <div className={cn(
                                    'flex-1 h-[2px] mb-5 transition-colors min-w-[8px] rounded-full',
                                    isComplete ? 'bg-emerald-400' : 'bg-slate-200',
                                )} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* ── Mobile progress bar ── */}
            <div className="sm:hidden px-4 py-3 bg-white border-b border-slate-100 mb-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Step {currentStep} of {TOTAL_STEPS}
                    </span>
                    <span className="text-xs font-bold text-[#001f3f]">
                        {STEP_LABELS[currentStep]?.label}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                    />
                </div>
            </div>
        </>
    );
});

Stepper.displayName = 'Stepper';