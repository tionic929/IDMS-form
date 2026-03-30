import React from 'react';
import {
    User, BookOpen, Camera, ShieldCheck,
    Mail, IdCard, FileText,
} from 'lucide-react';

import abLogo from '@/assets/dept_logo/ab.webp';
import becLogo from '@/assets/dept_logo/bec.webp';
import bsbaLogo from '@/assets/dept_logo/bsba.webp';
import bscrimLogo from '@/assets/dept_logo/bscrim.webp';
import bsedLogo from '@/assets/dept_logo/bsed.webp';
import bsgeLogo from '@/assets/dept_logo/bsge.webp';
import bshmLogo from '@/assets/dept_logo/bshm.webp';
import bsitLogo from '@/assets/dept_logo/bsit.webp';
import bsnLogo from '@/assets/dept_logo/bsn.webp';
import colaLogo from '@/assets/dept_logo/cola.webp';
import masteralLogo from '@/assets/dept_logo/masteral.webp';
import midwiferyLogo from '@/assets/dept_logo/midwifery.webp';

const DEPT_LOGOS: Record<string, string> = {
    AB: abLogo, BEC: becLogo, BSBA: bsbaLogo, BSCRIM: bscrimLogo,
    BSED: bsedLogo, BEED: bsedLogo, BSGE: bsgeLogo, BSHM: bshmLogo,
    BSIT: bsitLogo, BSN: bsnLogo, COLA: colaLogo, MASTERAL: masteralLogo,
    MIDWIFERY: midwiferyLogo,
    MAED: masteralLogo, 'MAED-LL': masteralLogo, MBA: masteralLogo, 
    MPA: masteralLogo, 'ED.D': masteralLogo, PHD: masteralLogo,
};

export const getDeptLogo = (course: string): string | null => {
    const clean = course.trim().toUpperCase();
    if (DEPT_LOGOS[clean]) return DEPT_LOGOS[clean];
    for (const [key, logo] of Object.entries(DEPT_LOGOS)) {
        if (clean.startsWith(key)) return logo;
    }
    return null;
};

export const REISSUANCE_REASONS = [
    'Lost ID', 'Damaged ID', 'Department Shift', 'Correction of Entry', 'Other',
];

export const COURSES = [
    'BSBA', 'BSN', 'BSCRIM', 'BSED', 'BSHM', 'BSIT', 'BSGE',
    'MASTERAL', 'EMPLOYEE', 'MIDWIFERY', 'AB', 'JD', 'ABM', 'ICT', 'STEM', 'HUMMS', 'BEC',
    'MAED', 'MAED-LL', 'MBA', 'MPA', 'ED.D', 'PHD'
];

export const getFilteredCourses = (level: string): string[] => {
    if (level === 'BEC (Elem/Kinder/JHS)') return ['BEC'];
    if (level === 'SHS') return ['ABM', 'ICT', 'STEM', 'HUMMS'];
    if (level === 'College') return ['BSBA', 'BSN', 'BSCRIM', 'BSED', 'BSHM', 'BSIT', 'BSGE', 'MIDWIFERY', 'AB', 'JD'];
    if (level === 'Masteral/Doctoral') return ['MAED', 'MAED-LL', 'MBA', 'MPA', 'ED.D', 'PHD'];
    return COURSES;
};

export const SCHOOL_LEVELS = [
    'BEC (Elem/Kinder/JHS)', 'SHS', 'College', 'Masteral/Doctoral',
] as const;

// Steps: 0=Consent, 1=UserType, 2=AppType, 3=IDVerify, 4=EmailVerify, 5=Details, 6=Media, 7=Submit
export const STEP_LABELS = [
    { label: 'Consent', icon: React.createElement(FileText, { size: 14 }) },
    { label: 'Applicant', icon: React.createElement(User, { size: 14 }) },
    { label: 'Category', icon: React.createElement(FileText, { size: 14 }) },
    { label: 'ID Number', icon: React.createElement(IdCard, { size: 14 }) },
    { label: 'Email', icon: React.createElement(Mail, { size: 14 }) },
    { label: 'Details', icon: React.createElement(BookOpen, { size: 14 }) },
    { label: 'Media', icon: React.createElement(Camera, { size: 14 }) },
    { label: 'Submit', icon: React.createElement(ShieldCheck, { size: 14 }) },
];

export const TOTAL_STEPS = STEP_LABELS.length - 1; // 7