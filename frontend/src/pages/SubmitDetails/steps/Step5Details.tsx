import React from 'react';
import { BookOpen, User, MapPin, FileCheck, Contact, Briefcase, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingLabelInput, SectionHeader, InfoBanner } from '../components/SharedUI';
import { getFilteredCourses, REISSUANCE_REASONS } from '../constants';
import type { FormState, UserType, ApplicationType } from '../types';

interface Step5DetailsProps {
    form: FormState;
    updateForm: (patch: Partial<FormState>) => void;
    userType: UserType;
    applicationType: ApplicationType;
    isSecondIssuance: boolean;
}

export const Step5Details = ({
    form, updateForm, userType, applicationType, isSecondIssuance,
}: Step5DetailsProps) => {
    const isNew = applicationType === 'NEW';
    const isOld = applicationType === 'OLD';

    return (
        <section className="space-y-4">
            <SectionHeader icon={<BookOpen />} title="Personal Details" />

            {isSecondIssuance && (
                <InfoBanner icon={<Zap size={15} className="text-orange-500" />} variant="orange">
                    Some fields are pre-filled from your existing record. Review and update if needed.
                </InfoBanner>
            )}

            <Card className="border-0 sm:border border-slate-200 shadow-none sm:shadow-sm rounded-none sm:rounded-2xl bg-transparent sm:bg-white -mx-4 sm:mx-0">
                <CardContent className="p-2 sm:p-6 space-y-5">

                    {/* Full name */}
                    <FloatingLabelInput
                        label="Full Name (as on your enrollment form)"
                        value={form.manual_full_name}
                        onChange={v => updateForm({ manual_full_name: v })}
                        status={form.manual_full_name.length === 0 ? 'idle' : form.manual_full_name.length >= 3 ? 'valid' : 'invalid'}
                        icon={<User className="h-4 w-4" />}
                        autoComplete="name"
                    />

                    {/* Address — not required for employee reissuance */}
                    {!(userType === 'EMPLOYEE' && isOld) && (
                        <FloatingLabelInput
                            label="Full Residence Address"
                            value={form.address}
                            onChange={v => updateForm({ address: v })}
                            status={form.address.length === 0 ? 'idle' : form.address.length >= 5 ? 'valid' : 'invalid'}
                            icon={<MapPin className="h-4 w-4" />}
                            autoComplete="street-address"
                        />
                    )}

                    {/* ── STUDENT fields ── */}
                    {userType === 'STUDENT' && (
                        <>
                            {/* Course (NEW only) */}
                            {isNew && (
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-xs font-bold text-slate-500 block px-1 uppercase tracking-widest">
                                            Course / Program <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full h-14 border border-slate-200 bg-white px-5 rounded-xl text-sm
                                 font-semibold focus:border-[#001f3f] focus:ring-4 focus:ring-[#001f3f]/5
                                 outline-none shadow-sm transition-all"
                                            value={form.course}
                                            onChange={e => updateForm({ course: e.target.value })}
                                        >
                                            <option value="">Select Course…</option>
                                            {getFilteredCourses(form.schoolLevel).map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            {/* LRN (NEW only; skip for College/Masteral/Doctoral) */}
                            {isNew && !['College', 'Masteral/Doctoral'].includes(form.schoolLevel) && (
                                <FloatingLabelInput
                                    label="LRN (Learner Reference Number)"
                                    value={form.lrn}
                                    onChange={v => updateForm({ lrn: v.replace(/\D/g, '').slice(0, 12) })}
                                    status={form.lrn.length === 0 ? 'idle' : form.lrn.length >= 6 ? 'valid' : 'invalid'}
                                    icon={<FileCheck className="h-4 w-4" />}
                                />
                            )}

                            {/* Guardian */}
                            <FloatingLabelInput
                                label="Full Name of Guardian"
                                value={form.guardianName}
                                onChange={v => updateForm({ guardianName: v })}
                                status={form.guardianName.length === 0 ? 'idle' : form.guardianName.length >= 3 ? 'valid' : 'invalid'}
                                icon={<Contact className="h-4 w-4" />}
                            />
                            <FloatingLabelInput
                                label="Guardian Contact No. (09XXXXXXXXX)"
                                value={form.guardianContact}
                                onChange={v => updateForm({ guardianContact: v.replace(/\D/g, '').slice(0, 11) })}
                                status={form.guardianContact.length === 0 ? 'idle' : /^\d{11}$/.test(form.guardianContact) ? 'valid' : 'invalid'}
                            />
                        </>
                    )}

                    {/* ── EMPLOYEE NEW fields ── */}
                    {userType === 'EMPLOYEE' && isNew && (
                        <>
                            <FloatingLabelInput
                                label="Department / Role"
                                value={form.department}
                                onChange={v => updateForm({ department: v })}
                                status={form.department.length === 0 ? 'idle' : form.department.length >= 2 ? 'valid' : 'invalid'}
                                icon={<Briefcase className="h-4 w-4" />}
                            />
                            <FloatingLabelInput
                                label="Contact Number"
                                value={form.contactInfo}
                                onChange={v => updateForm({ contactInfo: v.replace(/\D/g, '').slice(0, 11) })}
                                status={form.contactInfo.length === 0 ? 'idle' : form.contactInfo.length >= 7 ? 'valid' : 'invalid'}
                            />
                        </>
                    )}

                    {/* ── Replacement reason (OLD only) ── */}
                    {isOld && (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 block px-1 uppercase tracking-widest">
                                    Reason for Replacement <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full h-14 border border-slate-200 bg-white px-5 rounded-xl text-sm
                             font-semibold focus:border-[#001f3f] focus:ring-4 focus:ring-[#001f3f]/5
                             outline-none shadow-sm transition-all"
                                    value={form.reissuance_reason}
                                    onChange={e => updateForm({ reissuance_reason: e.target.value })}
                                >
                                    <option value="">Select Reason…</option>
                                    {REISSUANCE_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Department shift — new course selection */}
                            <AnimatePresence>
                                {userType === 'STUDENT' && form.reissuance_reason === 'Department Shift' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-xs font-bold text-slate-500 block px-1 uppercase tracking-widest">
                                            New Department / Course <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full h-14 border border-slate-200 bg-white px-5 rounded-xl text-sm
                                 font-semibold focus:border-[#001f3f] focus:ring-4 focus:ring-[#001f3f]/5
                                 outline-none shadow-sm transition-all"
                                            value={form.course}
                                            onChange={e => updateForm({ course: e.target.value })}
                                        >
                                            <option value="">Select New Course…</option>
                                            {getFilteredCourses(form.schoolLevel).map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </CardContent>
            </Card>
        </section>
    );
};