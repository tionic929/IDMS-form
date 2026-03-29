import { useState, useEffect, useRef, useCallback } from 'react';
import { submitApplication, submitEmployeeApplication } from '../../api/students';

import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import type {
    FormState, UserType, ApplicationType,
    VerificationStatus, ApplicationStatus,
} from './types';

const INITIAL_FORM: FormState = {
    idNumber: '', manual_full_name: '', email: '', course: '', schoolLevel: '',
    address: '', guardianName: '', guardianContact: '', lrn: '', department: '',
    contactInfo: '', id_picture: null, signature_picture: null,
    payment_type: 'COR', payment_proof: null, reissuance_reason: '',
};

export function useSubmitForm() {
    const navigate = useNavigate();

    // ── Step & flow ────────────────────────────────────────────────────────────
    const [hasGivenConsent, setHasGivenConsent] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [userType, setUserType] = useState<UserType>(null);
    const [applicationType, setApplicationType] = useState<ApplicationType>(null);
    const applicationTypeRef = useRef<ApplicationType>(null);

    useEffect(() => { applicationTypeRef.current = applicationType; }, [applicationType]);

    // ── Form ───────────────────────────────────────────────────────────────────
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const updateForm = useCallback((patch: Partial<FormState>) => {
        setForm(prev => ({ ...prev, ...patch }));
    }, []);

    // ── ID Verification ────────────────────────────────────────────────────────
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
    const [isSecondIssuance, setIsSecondIssuance] = useState(false);
    const [showReissuanceModal, setShowReissuanceModal] = useState(false);
    const [showExistingRecordModal, setShowExistingRecordModal] = useState(false);
    const [fetchedCourse, setFetchedCourse] = useState('');
    const [idVerifyError, setIdVerifyError] = useState('');

    // ── Email / OTP ────────────────────────────────────────────────────────────
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [expectedEmail, setExpectedEmail] = useState<string | null>(null);
    const [emailError, setEmailError] = useState('');

    // ── Submission ─────────────────────────────────────────────────────────────
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('idle');
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState('');

    // ── Image / Signature ──────────────────────────────────────────────────────
    const [rawIdImage, setRawIdImage] = useState<string | null>(null);
    const [sigType, setSigType] = useState<'draw' | 'upload'>('draw');
    const [showSigPad, setShowSigPad] = useState(false);

    // ── Previews ───────────────────────────────────────────────────────────────
    const [idPreview, setIdPreview] = useState('');
    const [sigPreview, setSigPreview] = useState('');
    const [paymentPreview, setPaymentPreview] = useState('');

    useEffect(() => {
        if (!form.id_picture) { setIdPreview(''); return; }
        const url = URL.createObjectURL(form.id_picture);
        setIdPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.id_picture]);

    useEffect(() => {
        if (!form.signature_picture) { setSigPreview(''); return; }
        const url = URL.createObjectURL(form.signature_picture);
        setSigPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.signature_picture]);

    useEffect(() => {
        if (!form.payment_proof) { setPaymentPreview(''); return; }
        const url = URL.createObjectURL(form.payment_proof);
        setPaymentPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.payment_proof]);

    // ── OTP auto-verify ────────────────────────────────────────────────────────
    useEffect(() => {
        if (generatedCode && inputCode === generatedCode) {
            setIsEmailVerified(true);
        } else {
            setIsEmailVerified(false);
        }
    }, [inputCode, generatedCode]);

    // ── ID verification debounce ───────────────────────────────────────────────
    useEffect(() => {
        // Reset downstream state whenever idNumber changes
        setVerificationStatus('idle');
        setIsEmailVerified(false);
        setIsCodeSent(false);
        setGeneratedCode(null);
        setInputCode('');
        setIsSecondIssuance(false);
        setFetchedCourse('');
        setExpectedEmail(null);
        setIdVerifyError('');

        if (form.idNumber.length < 8) return;

        const timer = setTimeout(async () => {
            const appType = applicationTypeRef.current;
            setIsVerifying(true);
            try {
                const { data: checkData } = await api.post('/students/check-existing', {
                    idNumber: form.idNumber,
                });

                if (checkData.exists) {
                    if (appType === 'NEW') {
                        setVerificationStatus('invalid');
                        setShowExistingRecordModal(true);
                    } else {
                        setVerificationStatus('valid');
                        setIsSecondIssuance(true);
                        setShowReissuanceModal(true);
                    }
                    setFetchedCourse(checkData.data?.course || '');
                    setExpectedEmail(checkData.data?.email || null);
                    updateForm({
                        email: appType === 'NEW' ? (checkData.data?.email || form.email) : form.email,
                        manual_full_name: checkData.data?.manual_full_name || form.manual_full_name,
                        address: checkData.data?.address || form.address,
                        guardianName: checkData.data?.guardianName || form.guardianName,
                        guardianContact: checkData.data?.guardianContact || form.guardianContact,
                        course: checkData.data?.course || form.course,
                    });
                } else {
                    if (appType === 'NEW') {
                        setVerificationStatus('valid');
                    } else {
                        setVerificationStatus('invalid');
                        setIdVerifyError('ID Number not found. Reissuance requires an existing record.');
                    }
                }
            } catch {
                setVerificationStatus('invalid');
                setIdVerifyError('System error. Please verify your connection and try again.');
            } finally {
                setIsVerifying(false);
            }
        }, 800);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.idNumber]);

    // ── Auto-compute payment type ──────────────────────────────────────────────
    useEffect(() => {
        let computedType: FormState['payment_type'];

        if (userType === 'EMPLOYEE') {
            computedType = applicationType === 'NEW' ? 'HR_FORM' : '';
        } else {
            const isDeptShift = form.reissuance_reason === 'Department Shift';
            computedType = (applicationType === 'NEW' || isDeptShift) ? 'COR' : 'OR';
        }

        if (form.payment_type !== computedType) {
            updateForm({ payment_type: computedType });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationType, form.reissuance_reason, userType]);

    // ── Clear LRN if not applicable ──────────────────────────────────────────
    useEffect(() => {
        const isLrnRequired = !['College', 'Masteral', 'Doctoral'].includes(form.schoolLevel);
        if (!isLrnRequired && form.lrn !== '') {
            updateForm({ lrn: '' });
        }
    }, [form.schoolLevel, updateForm]);

    // ── Status polling ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (applicationStatus !== 'pending') return;
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/applications/${form.idNumber}/status`);
                if (res.data.status && res.data.status !== 'pending') {
                    setApplicationStatus(res.data.status as ApplicationStatus);
                    if (res.data.rejection_reason) setRejectionReason(res.data.rejection_reason);
                }
            } catch (e) {
                console.error('Status polling failed', e);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [applicationStatus, form.idNumber]);

    // ── Derived flags ──────────────────────────────────────────────────────────
    const isReissuance = isSecondIssuance || applicationType === 'OLD';
    const isEmployee = userType === 'EMPLOYEE';

    // ── Validation per-step ────────────────────────────────────────────────────
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isStep3Valid = verificationStatus === 'valid';
    const isStep4Valid = isEmailVerified;

    const isStep5Valid = (() => {
        const name = form.manual_full_name.trim().length >= 3;
        const addr = form.address.trim().length >= 5;
        if (!name || !addr) return false;

        if (userType === 'STUDENT') {
            const guardian = form.guardianName.trim().length >= 3 && /^\d{11}$/.test(form.guardianContact);
            if (applicationType === 'NEW') {
                const isLrnRequired = !['College', 'Masteral', 'Doctoral'].includes(form.schoolLevel);
                const lrnOk = isLrnRequired ? form.lrn.trim().length >= 6 : true;
                return guardian && lrnOk && form.course !== '';
            }
            const hasReason = form.reissuance_reason !== '';
            const courseOk = form.reissuance_reason === 'Department Shift' ? form.course !== '' : true;
            return guardian && hasReason && courseOk;
        }

        if (userType === 'EMPLOYEE') {
            if (applicationType === 'NEW') {
                return form.contactInfo.trim().length >= 7 && form.department.trim().length >= 2;
            }
            return form.reissuance_reason !== '';
        }

        return false;
    })();

    const isStep6Valid = applicationType === 'NEW'
        ? isEmployee
            ? form.id_picture !== null
            : form.id_picture !== null && form.signature_picture !== null && form.payment_proof !== null
        : true;

    const stepCanProgress = (step: number): boolean => {
        switch (step) {
            case 0: return hasGivenConsent;
            case 1: return isEmployee ? true : (userType === 'STUDENT' && form.schoolLevel !== '');
            case 2: return applicationType !== null;
            case 3: return isStep3Valid;
            case 4: return isStep4Valid;
            case 5: return isStep5Valid;
            case 6: return isStep6Valid;
            case 7: return isStep6Valid;
            default: return false;
        }
    };

    // ── Handlers ───────────────────────────────────────────────────────────────
    const goNext = useCallback(() => setCurrentStep(s => s + 1), []);
    const goBack = useCallback(() => setCurrentStep(s => s - 1), []);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, field: 'id_picture' | 'signature_picture') => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (field === 'id_picture') {
                const reader = new FileReader();
                reader.addEventListener('load', () => setRawIdImage(reader.result as string));
                reader.readAsDataURL(file);
            } else {
                updateForm({ [field]: file });
            }
        },
        [updateForm],
    );

    const handleSendCode = useCallback(async () => {
        if (!form.email || !form.email.includes('@')) return;
        setIsSendingCode(true);
        setEmailError('');
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);
        try {
            await api.post('/send-otp', { email: form.email, code });
            setIsCodeSent(true);
        } catch {
            setEmailError('Failed to send verification code. Please try again.');
        } finally {
            setIsSendingCode(false);
        }
    }, [form.email]);

    /**
     * Only called on the FINAL step (step 7). Navigation is handled by goNext.
     * Routes to /students/employee for EMPLOYEE users, /students for STUDENT users.
     * Guardian fields are intentionally excluded from the employee FormData payload.
     */
    const handleSubmit = useCallback(async () => {
        if (!isStep6Valid) return;
        setSubmitError('');

        if (isReissuance) {
            const ok = window.confirm(
                'You are about to re-submit an application for an existing record. '
                + 'This will be marked as a RE-ISSUANCE. Do you want to proceed?',
            );
            if (!ok) return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();

            if (isEmployee) {
                // Employee payload — guardian fields are irrelevant, omit them
                const employeeFields: (keyof FormState)[] = [
                    'idNumber', 'manual_full_name', 'email', 'address',
                    'department', 'contactInfo', 'id_picture', 'reissuance_reason',
                ];
                employeeFields.forEach(key => {
                    const value = form[key];
                    if (value !== null && value !== undefined) {
                        formData.append(key, value as string | Blob);
                    }
                });
                await submitEmployeeApplication(formData);
            } else {
                // Student payload — include all fields
                Object.entries(form).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        formData.append(key, value as string | Blob);
                    }
                });
                await submitApplication(formData);
            }

            setApplicationStatus('pending');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setSubmitError('Submission failed. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [form, isEmployee, isReissuance, isStep6Valid]);

    const handleSwitchToReplacement = useCallback(() => {
        setShowExistingRecordModal(false);
        setApplicationType('OLD');
        setIsSecondIssuance(true);
        setVerificationStatus('valid');
        setCurrentStep(2);
    }, []);

    const handleUseDifferentId = useCallback(() => {
        setShowExistingRecordModal(false);
        updateForm({ idNumber: '' });
        setVerificationStatus('idle');
    }, [updateForm]);

    return {
        // Step
        currentStep, setCurrentStep,
        hasGivenConsent, setHasGivenConsent,
        stepCanProgress, goNext, goBack,

        // User & app type
        userType, setUserType,
        applicationType, setApplicationType,
        isReissuance, isEmployee,

        // Form
        form, updateForm, setForm,

        // ID verify
        isVerifying, verificationStatus,
        isSecondIssuance, fetchedCourse, idVerifyError,
        showReissuanceModal, setShowReissuanceModal,
        showExistingRecordModal, setShowExistingRecordModal,

        // Email / OTP
        inputCode, setInputCode,
        isCodeSent, isSendingCode, isEmailVerified,
        expectedEmail, emailError,
        isValidEmail, handleSendCode,

        // Image / Signature
        rawIdImage, setRawIdImage,
        sigType, setSigType,
        showSigPad, setShowSigPad,
        idPreview, sigPreview, paymentPreview,
        handleFileChange,

        // Submission
        isSubmitting, applicationStatus,
        rejectionReason, submitError,
        handleSubmit,

        // Modal actions
        handleSwitchToReplacement,
        handleUseDifferentId,

        navigate,
    };
}