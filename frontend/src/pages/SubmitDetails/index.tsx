/**
 * SubmitDetails.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Orchestrator only — all logic lives in useSubmitForm.ts.
 *
 * Key fix vs. previous version:
 *   • The <form> element has NO onSubmit handler. Final submission is triggered
 *     explicitly by the NavButtons "Submit Application" button (type="button")
 *     calling handleSubmit(). This eliminates the accidental submit-on-Enter
 *     bug that was causing partial / premature submissions to the proxy.
 *   • All intermediate "Continue" buttons are type="button" so they never
 *     trigger form submission.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, { lazy, Suspense } from 'react';
import { motion, AnimatePresence, type Transition, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import SiteHeader from '@/components/SiteHeader';

import { useSubmitForm } from './useSubmitForm';
import { Stepper } from './components/Stepper';
import { NavButtons } from './components/NavButtons';

import { Step0Consent } from './steps/Step0Consent';
import { Step1UserType } from './steps/Step1UserType';
import { Step2AppType } from './steps/Step2AppType';
import { Step3IDVerify } from './steps/Step3IDVerify';
import { Step4Email } from './steps/Step4Email';
import { Step5Details } from './steps/Step5Details';
import { Step6Media } from './steps/Step6Media';
import { Step7Review } from './steps/Step7Review';
import { getDeptLogo } from './constants';

const ApplicationModals = lazy(() => import('../ApplicationModals'));

const SLIDE_VARIANTS: Variants = {
    initial: { opacity: 0, x: 28 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -28 },
};

const SLIDE_TRANSITION: Transition = {
    duration: 0.2,
    ease: 'easeInOut' as const,
};

const SubmitDetails: React.FC = () => {
    const form = useSubmitForm();

    const isLastStep = form.currentStep === 7;

    return (
        <div className="min-h-screen bg-white sm:bg-slate-50 font-sans text-zinc-900 pb-28 sm:pb-12 selection:bg-[#001f3f]/10">

            {/* ── Site header ── */}
            <SiteHeader
                showActions={false}
                customAction={
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => form.navigate('/')}
                        className="text-slate-400 hover:text-slate-600 font-semibold text-xs"
                    >
                        Cancel
                    </Button>
                }
            />

            <div className="max-w-xl mx-auto sm:mt-8">

                {/* ── Progress stepper ── */}
                <Stepper currentStep={form.currentStep} />

                {/* ── Step content ── */}
                {/*
          IMPORTANT: this is a plain <div>, NOT a <form>.
          Removing the form element is the simplest way to guarantee that
          pressing Enter anywhere never fires a submit event.
          The submit action is wired explicitly through NavButtons → handleSubmit().
        */}
                <div className="px-4 sm:px-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={form.currentStep}
                            variants={SLIDE_VARIANTS}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={SLIDE_TRANSITION}
                            className="space-y-6"
                        >

                            {form.currentStep === 0 && (
                                <Step0Consent
                                    hasGivenConsent={form.hasGivenConsent}
                                    onChange={form.setHasGivenConsent}
                                />
                            )}

                            {form.currentStep === 1 && (
                                <Step1UserType
                                    userType={form.userType}
                                    schoolLevel={form.form.schoolLevel}
                                    onUserTypeChange={t => {
                                        form.setUserType(t);
                                        if (t === 'EMPLOYEE') form.updateForm({ schoolLevel: '' });
                                    }}
                                    onSchoolLevelChange={lvl => form.updateForm({ schoolLevel: lvl })}
                                />
                            )}

                            {form.currentStep === 2 && (
                                <Step2AppType
                                    userType={form.userType}
                                    applicationType={form.applicationType}
                                    onChange={form.setApplicationType}
                                />
                            )}

                            {form.currentStep === 3 && (
                                <Step3IDVerify
                                    applicationType={form.applicationType}
                                    idNumber={form.form.idNumber}
                                    onIdChange={v => form.updateForm({ idNumber: v })}
                                    isVerifying={form.isVerifying}
                                    verificationStatus={form.verificationStatus}
                                    isSecondIssuance={form.isSecondIssuance}
                                    fetchedCourse={form.fetchedCourse}
                                    course={form.form.course}
                                    errorMessage={form.idVerifyError}
                                />
                            )}

                            {form.currentStep === 4 && (
                                <Step4Email
                                    email={form.form.email}
                                    onEmailChange={v => form.updateForm({ email: v })}
                                    inputCode={form.inputCode}
                                    onInputCodeChange={form.setInputCode}
                                    isCodeSent={form.isCodeSent}
                                    isSendingCode={form.isSendingCode}
                                    isEmailVerified={form.isEmailVerified}
                                    expectedEmail={form.expectedEmail}
                                    emailError={form.emailError}
                                    isValidEmail={form.isValidEmail}
                                    onSendCode={form.handleSendCode}
                                />
                            )}

                            {form.currentStep === 5 && (
                                <Step5Details
                                    form={form.form}
                                    updateForm={form.updateForm}
                                    userType={form.userType}
                                    applicationType={form.applicationType}
                                    isSecondIssuance={form.isSecondIssuance}
                                />
                            )}

                            {form.currentStep === 6 && (
                                <Step6Media
                                    form={form.form}
                                    updateForm={form.updateForm}
                                    userType={form.userType}
                                    applicationType={form.applicationType}
                                    isReissuance={form.isReissuance}
                                    idPreview={form.idPreview}
                                    sigPreview={form.sigPreview}
                                    paymentPreview={form.paymentPreview}
                                    sigType={form.sigType}
                                    onSigTypeChange={t => {
                                        form.setSigType(t);
                                        form.updateForm({ signature_picture: null });
                                    }}
                                    onOpenSigPad={() => form.setShowSigPad(true)}
                                    onIdFileChange={e => form.handleFileChange(e, 'id_picture')}
                                />
                            )}

                            {form.currentStep === 7 && (
                                <Step7Review
                                    form={form.form}
                                    userType={form.userType}
                                    applicationType={form.applicationType}
                                    isReissuance={form.isReissuance}
                                    idPreview={form.idPreview}
                                    sigPreview={form.sigPreview}
                                    paymentPreview={form.paymentPreview}
                                    submitError={form.submitError}
                                />
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* ── Navigation ── */}
                    <NavButtons
                        currentStep={form.currentStep}
                        canProgress={form.stepCanProgress(form.currentStep)}
                        isSubmitting={form.isSubmitting}
                        isLastStep={isLastStep}
                        onBack={form.goBack}
                        onNext={form.goNext}
                        onSubmit={form.handleSubmit}
                        onHelp={() => form.navigate('/how-to-submit')}
                    />
                </div>

                {/* ── Modals (lazy loaded) ── */}
                <Suspense fallback={null}>
                    <ApplicationModals
                        idImageSrc={form.rawIdImage}
                        onIdSaved={file => { form.updateForm({ id_picture: file }); form.setRawIdImage(null); }}
                        onIdCancel={() => form.setRawIdImage(null)}

                        showSignaturePad={form.showSigPad}
                        onSignatureSaved={file => { form.updateForm({ signature_picture: file }); form.setShowSigPad(false); }}
                        onSignatureCancel={() => form.setShowSigPad(false)}

                        applicationStatus={form.applicationStatus}
                        rejectionReason={form.rejectionReason}
                        onGoHome={() => form.navigate('/')}

                        showReplacementModal={form.showReissuanceModal}
                        onDismissReplacement={() => form.setShowReissuanceModal(false)}
                        idNumber={form.form.idNumber}
                        fetchedCourse={form.fetchedCourse}
                        getDeptLogo={(c: string) => getDeptLogo(c) || ''}

                        showExistingRecordModal={form.showExistingRecordModal}
                        onSwitchToReplacement={form.handleSwitchToReplacement}
                        onUseDifferentId={form.handleUseDifferentId}
                    />
                </Suspense>

            </div>
        </div>
    );
};

export default SubmitDetails;