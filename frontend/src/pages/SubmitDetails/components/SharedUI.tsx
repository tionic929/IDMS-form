import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ─── FloatingLabelInput ───────────────────────────────────────────────────────

interface FloatingLabelInputProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    status?: 'idle' | 'valid' | 'invalid' | 'orange';
    isLoading?: boolean;
    type?: string;
    icon?: React.ReactNode;
    statusLabel?: string;
    autoComplete?: string;
}

export const FloatingLabelInput = React.memo(({
    label, value, onChange, placeholder, status = 'idle',
    isLoading = false, type = 'text', icon, statusLabel, autoComplete,
}: FloatingLabelInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;

    return (
        <div className="w-full">
            <div className="relative group">
                {/* Floating label */}
                <div className={cn(
                    'absolute left-4 transition-all duration-200 pointer-events-none z-10 flex items-center gap-2',
                    (isFocused || hasValue)
                        ? '-top-2.5 bg-white px-2 scale-90 origin-left text-[#001f3f] font-semibold'
                        : 'top-4 text-slate-400 font-medium',
                )}>
                    {icon && <span className="shrink-0">{icon}</span>}
                    <label className="text-xs">{label}</label>
                    {status === 'orange' && statusLabel && (
                        <span className="text-[10px] font-semibold text-orange-600 ml-2 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-100">
                            {statusLabel}
                        </span>
                    )}
                </div>

                <Input
                    type={type}
                    value={value}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    // Prevent Enter key from bubbling to form submit
                    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                    className={cn(
                        'h-14 border border-slate-200 bg-white px-5 rounded-xl text-sm font-semibold',
                        'transition-all placeholder:text-transparent shadow-sm outline-none',
                        'focus:border-[#001f3f] focus:ring-4 focus:ring-[#001f3f]/5',
                        status === 'valid' && 'border-emerald-400/50 bg-emerald-50/20',
                        status === 'invalid' && 'border-red-400/50 bg-red-50/20',
                        status === 'orange' && 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/10',
                    )}
                />

                {/* Right status icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isLoading && <Loader2 className="animate-spin text-slate-300 h-4 w-4" />}
                    {status === 'valid' && !isLoading && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {status === 'invalid' && !isLoading && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {status === 'orange' && !isLoading && <Zap className="h-4 w-4 text-orange-500 animate-pulse" />}
                </div>
            </div>
        </div>
    );
});

FloatingLabelInput.displayName = 'FloatingLabelInput';

// ─── SectionHeader ────────────────────────────────────────────────────────────

export const SectionHeader = React.memo(({
    icon, title,
}: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-3 pl-1 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#001f3f]/5 flex items-center justify-center text-slate-700">
            {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: 2 } as Record<string, unknown>)}
        </div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    </div>
));

SectionHeader.displayName = 'SectionHeader';

// ─── ReviewRow ────────────────────────────────────────────────────────────────

export const ReviewRow = React.memo(({
    label, value, highlight,
}: { label: string; value: string; highlight?: 'orange' | 'green' }) => (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
        <span className="text-xs font-semibold text-slate-400 shrink-0 w-32">{label}</span>
        <span className={cn(
            'text-sm font-semibold text-right truncate max-w-[60%]',
            highlight === 'orange' && 'text-orange-600',
            highlight === 'green' && 'text-emerald-600',
            !highlight && 'text-slate-800',
        )}>
            {value || '—'}
        </span>
    </div>
));

ReviewRow.displayName = 'ReviewRow';

// ─── InfoBanner ───────────────────────────────────────────────────────────────

interface InfoBannerProps {
    icon: React.ReactNode;
    children: React.ReactNode;
    variant?: 'info' | 'warning' | 'success' | 'orange' | 'blue';
}

export const InfoBanner = ({ icon, children, variant = 'info' }: InfoBannerProps) => {
    const styles: Record<string, string> = {
        info: 'bg-slate-50 border-slate-200 text-slate-600',
        warning: 'bg-amber-50 border-amber-100 text-amber-700',
        success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
        orange: 'bg-orange-50 border-orange-100 text-orange-700',
        blue: 'bg-blue-50 border-blue-100 text-blue-700',
    };
    return (
        <div className={cn('flex items-start gap-3 p-4 rounded-xl border', styles[variant])}>
            <span className="shrink-0 mt-0.5">{icon}</span>
            <p className="text-xs font-medium leading-relaxed">{children}</p>
        </div>
    );
};