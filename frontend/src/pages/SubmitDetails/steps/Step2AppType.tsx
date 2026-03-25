import React from 'react';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApplicationType, UserType } from '../types';

interface Step2AppTypeProps {
    userType: UserType;
    applicationType: ApplicationType;
    onChange: (t: ApplicationType) => void;
}

const APP_OPTIONS = [
    {
        type: 'NEW' as ApplicationType,
        label: 'First-time Applicant',
        desc: 'Never had an ID from this school',
        icon: Sparkles,
    },
    {
        type: 'OLD' as ApplicationType,
        label: 'Replacement ID',
        desc: 'Lost, damaged, or updating existing ID',
        icon: RefreshCw,
    },
];

export const Step2AppType = ({ userType, applicationType, onChange }: Step2AppTypeProps) => (
    <section className="space-y-6">
        <div className="text-center space-y-2 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                {userType} · Step 2
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Application Type</h1>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Select <strong>First-time</strong> if you have never received an institutional ID.
            </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {APP_OPTIONS.map(({ type, label, desc, icon: Icon }) => {
                const selected = applicationType === type;
                return (
                    <button
                        key={type!}
                        type="button"
                        onClick={() => onChange(type)}
                        className={cn(
                            'flex flex-col items-center gap-4 py-8 px-5 rounded-2xl border-2 transition-all relative text-left',
                            selected
                                ? 'border-[#001f3f] bg-[#001f3f]/5 shadow-sm'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:shadow-sm',
                        )}
                    >
                        <Icon
                            size={28}
                            strokeWidth={1.5}
                            className={selected ? 'text-[#001f3f]' : 'text-slate-400'}
                        />
                        <div className="text-center space-y-1">
                            <p className={cn('font-bold text-sm', selected ? 'text-[#001f3f]' : 'text-slate-700')}>{label}</p>
                            <p className={cn('text-xs leading-tight', selected ? 'text-[#001f3f]/70' : 'text-slate-400')}>
                                {desc}
                            </p>
                        </div>
                        {selected && <CheckCircle2 size={17} className="text-[#001f3f] absolute top-3 right-3" />}
                    </button>
                );
            })}
        </div>
    </section>
);