import React from 'react';
import { GraduationCap, Briefcase, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type UserType } from '../types';
import { SCHOOL_LEVELS } from '../constants';

interface Step1UserTypeProps {
    userType: UserType;
    schoolLevel: string;
    onUserTypeChange: (t: UserType) => void;
    onSchoolLevelChange: (l: string) => void;
}

const TYPE_OPTIONS = [
    { type: 'STUDENT' as UserType, icon: GraduationCap, desc: 'Currently enrolled student' },
    { type: 'EMPLOYEE' as UserType, icon: Briefcase, desc: 'Faculty & Staff member' },
];

export const Step1UserType = ({
    userType, schoolLevel, onUserTypeChange, onSchoolLevelChange,
}: Step1UserTypeProps) => (
    <section className="space-y-6">
        <div className="text-center space-y-2 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Step 1</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Who are you?</h1>
            <p className="text-sm text-slate-500">Select your role at Northeastern College.</p>
        </div>

        {/* User type cards */}
        <div className="grid grid-cols-2 gap-3">
            {TYPE_OPTIONS.map(({ type, icon: Icon, desc }) => {
                const selected = userType === type;
                return (
                    <button
                        key={type}
                        type="button"
                        onClick={() => onUserTypeChange(type)}
                        className={cn(
                            'flex flex-col items-center gap-3 py-7 px-4 rounded-2xl border-2 transition-all relative',
                            selected
                                ? 'border-[#001f3f] bg-[#001f3f]/5 text-[#001f3f] shadow-sm'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:shadow-sm',
                        )}
                    >
                        <Icon size={30} strokeWidth={1.5} className={selected ? 'text-[#001f3f]' : 'text-slate-400'} />
                        <div className="text-center">
                            <p className="font-bold text-sm">{type}</p>
                            <p className={cn('text-xs mt-1 leading-tight', selected ? 'text-[#001f3f]/70' : 'text-slate-400')}>
                                {desc}
                            </p>
                        </div>
                        {selected && (
                            <CheckCircle2 size={17} className="text-[#001f3f] absolute top-3 right-3" />
                        )}
                    </button>
                );
            })}
        </div>

        {/* School level — only for students */}
        <AnimatePresence>
            {userType === 'STUDENT' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="space-y-3 pt-2">
                        <p className="text-xs font-bold text-center text-slate-500 uppercase tracking-widest">
                            School Level <span className="text-red-500">*</span>
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SCHOOL_LEVELS.map(lvl => (
                                <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => onSchoolLevelChange(lvl)}
                                    className={cn(
                                        'py-3 px-2 rounded-xl border-2 text-xs font-semibold text-center transition-all',
                                        schoolLevel === lvl
                                            ? 'border-[#001f3f] bg-[#001f3f]/5 text-[#001f3f]'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                                    )}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </section>
);