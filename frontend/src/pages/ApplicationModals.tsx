import React, { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import SignatureCanvas from 'react-signature-canvas';
import { getCroppedImg } from '@/lib/image-utils';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, Pencil, Maximize2, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ApplicationModalsProps {
  idImageSrc: string | null;
  onIdSaved: (file: File) => void;
  onIdCancel: () => void;

  showSignaturePad: boolean;
  onSignatureSaved: (file: File) => void;
  onSignatureCancel: () => void;

  // Status & Success
  applicationStatus?: 'idle' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string | null;
  onGoHome?: () => void;

  // Replacement / Existing
  showReplacementModal?: boolean;
  onDismissReplacement?: () => void;
  idNumber?: string;
  fetchedCourse?: string;
  getDeptLogo?: (course: string) => string;

  showExistingRecordModal?: boolean;
  onSwitchToReplacement?: () => void;
  onUseDifferentId?: () => void;
}

export default function ApplicationModals({
  idImageSrc,
  onIdSaved,
  onIdCancel,
  showSignaturePad,
  onSignatureSaved,
  onSignatureCancel,
  applicationStatus = 'idle',
  rejectionReason = null,
  onGoHome = () => {},
  showReplacementModal = false,
  onDismissReplacement = () => {},
  idNumber = '',
  fetchedCourse = '',
  getDeptLogo = () => '',
  showExistingRecordModal = false,
  onSwitchToReplacement = () => {},
  onUseDifferentId = () => {}
}: ApplicationModalsProps) {

  // ── ID Cropper State ──
  const [idCrop, setIdCrop] = useState({ x: 0, y: 0 });
  const [idZoom, setIdZoom] = useState(1);
  const [idCroppedAreaPixels, setIdCroppedAreaPixels] = useState<any>(null);

  // ── Signature State ──
  const sigPad = useRef<any>(null);
  const [rawSigPoints, setRawSigPoints] = useState<any[]>([]);
  
  const [showSigCropper, setShowSigCropper] = useState(false);
  const [tempSigData, setTempSigData] = useState<string | null>(null);
  const [sigCrop, setSigCrop] = useState({ x: 0, y: 0 });
  const [sigZoom, setSigZoom] = useState(1);
  const [sigCroppedAreaPixels, setSigCroppedAreaPixels] = useState<any>(null);

  // ── Handlers ──
  const handleIdCropSave = async () => {
    if (idImageSrc && idCroppedAreaPixels) {
      const croppedBlob = await getCroppedImg(idImageSrc, idCroppedAreaPixels, 0, { horizontal: false, vertical: false }, 'image/jpeg');
      if (croppedBlob) {
        const file = new File([croppedBlob], "id_photo.jpg", { type: "image/jpeg" });
        onIdSaved(file);
      }
    }
  };

  const handleSignatureConfirm = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      const dataUrl = sigPad.current.getCanvas().toDataURL('image/png');
      const points = sigPad.current.toData();
      setRawSigPoints(points);
      setTempSigData(dataUrl);
      setShowSigCropper(true);
      onSignatureCancel(); // hide the pad
    }
  };

  const handleSigCropSave = async () => {
    if (tempSigData && sigCroppedAreaPixels) {
      const croppedBlob = await getCroppedImg(tempSigData, sigCroppedAreaPixels, 0, { horizontal: false, vertical: false }, 'image/png');
      if (croppedBlob) {
        const file = new File([croppedBlob], "signature.png", { type: "image/png" });
        onSignatureSaved(file);
        setShowSigCropper(false);
        setTempSigData(null);
      }
    }
  };

  return (
    <>
      {/* ── ID Cropper ── */}
      <Dialog open={!!idImageSrc} onOpenChange={(open) => !open && onIdCancel()}>
        <DialogContent className="max-w-none w-full sm:max-w-[500px] h-full sm:h-auto p-0 overflow-hidden bg-white sm:rounded-[2.5rem] border-none flex flex-col z-[100]">
          <DialogHeader className="p-6 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-black/80">
              <Camera className="h-4 w-4" /> Align Portrait
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex-1 min-h-[400px] bg-slate-900 overflow-hidden">
            {idImageSrc && (
              <Cropper
                image={idImageSrc} crop={idCrop} zoom={idZoom} aspect={3 / 4}
                onCropChange={setIdCrop}
                onCropComplete={(_, pixels) => setIdCroppedAreaPixels(pixels)}
                onZoomChange={setIdZoom} minZoom={0.1}
                classes={{ containerClassName: "bg-slate-950", mediaClassName: "max-w-none" }}
              />
            )}
          </div>
          <div className="p-8 space-y-6 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-black/50 uppercase tracking-wider shrink-0">Scale</span>
              <Input type="range" value={idZoom} min={0.1} max={3} step={0.1}
                onChange={(e) => setIdZoom(Number(e.target.value))}
                className="h-1.5 p-0 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#001f3f]"
              />
              <span className="text-[11px] font-bold text-black/50 w-8">{idZoom.toFixed(1)}x</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline"
                className="flex-1 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-slate-200"
                onClick={onIdCancel}>
                Go Back
              </Button>
              <Button className="flex-1 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-[#001f3f] text-white shadow-lg"
                onClick={handleIdCropSave}>
                Apply Crop
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Signature Pad ── */}
      <Dialog open={showSignaturePad} onOpenChange={(open) => !open && onSignatureCancel()}>
        <DialogContent className="max-w-none w-full h-full p-0 bg-white border-none flex flex-col md:max-w-2xl md:h-[70vh] md:rounded-[3rem] md:overflow-hidden z-[100]">
          <DialogHeader className="p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-[#001f3f]">
                <Pencil className="h-4 w-4" /> Sign Below
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => sigPad.current?.clear()}
                className="text-[10px] font-bold uppercase tracking-widest h-10 px-6 rounded-xl hover:bg-slate-100 text-slate-500">
                Clear Canvas
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-slate-50 relative overflow-hidden">
            <SignatureCanvas
              ref={(ref) => {
                sigPad.current = ref;
                if (ref && rawSigPoints.length > 0) ref.fromData(rawSigPoints);
              }}
              penColor="#001f3f" backgroundColor="white"
              minWidth={2.5} maxWidth={2.5} velocityFilterWeight={0}
              canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
            />
          </div>
          <div className="p-8 border-t border-slate-100 bg-white flex gap-4 shrink-0">
            <Button variant="outline"
              className="flex-1 h-16 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-slate-200"
              onClick={onSignatureCancel}>Cancel</Button>
            <Button
              className="flex-1 h-16 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-[#001f3f] text-white shadow-xl"
              onClick={handleSignatureConfirm}>Confirm Signature</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Signature Cropper ── */}
      <Dialog open={showSigCropper} onOpenChange={setShowSigCropper}>
        <DialogContent className="max-w-none w-full sm:max-w-[500px] h-full sm:h-auto p-0 overflow-hidden bg-white sm:rounded-[2.5rem] border-none flex flex-col z-[100]">
          <DialogHeader className="p-6 border-b border-slate-100 bg-[#001f3f] shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-white">
                <Maximize2 className="h-4 w-4" /> Final Polish
              </DialogTitle>
              <Badge variant="outline" className="text-[10px] font-bold text-white/50 border-white/20 px-3">
                Signature Mask
              </Badge>
            </div>
          </DialogHeader>
          <div className="relative flex-1 min-h-[400px] bg-slate-50 overflow-hidden">
            {tempSigData && (
              <Cropper
                image={tempSigData} crop={sigCrop} zoom={sigZoom} aspect={4 / 3}
                onCropChange={setSigCrop}
                onCropComplete={(_, pixels) => setSigCroppedAreaPixels(pixels)}
                onZoomChange={setSigZoom} minZoom={0.1} restrictPosition={false}
                classes={{ containerClassName: "bg-white", mediaClassName: "max-w-none" }}
              />
            )}
          </div>
          <div className="p-8 space-y-6 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Adjust</span>
              <Input type="range" value={sigZoom} min={0.1} max={3} step={0.1}
                onChange={(e) => setSigZoom(Number(e.target.value))}
                className="h-1.5 p-0 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#001f3f]"
              />
              <span className="text-[11px] font-bold text-[#001f3f] w-8">{sigZoom.toFixed(1)}x</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline"
                className="flex-1 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-slate-200"
                onClick={() => { setShowSigCropper(false); onSignatureCancel(); }}>Cancel</Button>
              <Button
                className="flex-1 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-[#001f3f] text-white shadow-lg"
                onClick={handleSigCropSave}>Save Final</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* ── Pending Notification Modal ── */}
      <Dialog open={applicationStatus === 'pending'} onOpenChange={onGoHome}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl z-[100]">
          <div className="bg-amber-500 p-8 flex flex-col items-center justify-center text-white relative">
            <Clock className="h-16 w-16 mb-4 animate-pulse opacity-90" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-center">Under Review</h2>
            <p className="text-amber-100 mt-2 text-center text-sm font-medium">Your application is in queue</p>
          </div>
          <div className="p-8 bg-slate-50 text-center space-y-4">
            <p className="text-slate-600 text-sm">
              Please wait while the administrator reviews your details. Do not close this page.
              <br/><br/>
              <b><span className="text-amber-600 animate-pulse">Waiting for approval...</span></b>
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-800 space-y-1.5 shadow-sm">
              <span className="font-bold uppercase tracking-wider block text-[10px]">Portfolio Demo Notice:</span>
              <p className="leading-normal">
                To test the approval flow, open another tab, go to the <a href="/login" target="_blank" className="font-bold underline text-[#001f3f] hover:opacity-85">Admin Login</a>, and sign in with:
              </p>
              <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200/60 font-mono text-[10px] space-y-0.5 shadow-inner">
                <div>Email: <span className="font-bold select-all">admin@svizcarra.online</span></div>
                <div>Password: <span className="font-bold select-all">admin0929</span></div>
              </div>
              <p className="text-[10px] text-amber-600 leading-normal pt-1 border-t border-amber-200/50">
                ⚠️ Loading and database queries may take several seconds as this demo runs on Render's free tier.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Approved Success Modal ── */}
      <Dialog open={applicationStatus === 'approved'} onOpenChange={onGoHome}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl z-[100]">
          <div className="bg-emerald-600 p-10 flex flex-col items-center justify-center text-white">
            <CheckCircle2 className="h-20 w-20 mb-4 opacity-90" />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-center leading-none">Record<br/>Complete</h2>
          </div>
          <div className="p-8 bg-white text-center space-y-6 flex flex-col items-center">
            <p className="text-slate-500 font-medium text-sm">
              Your ID Application has been thoroughly verified and securely registered in the primary database.
            </p>
            <Button
              onClick={onGoHome}
              className="h-14 px-8 rounded-xl font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white w-full max-w-[200px]"
            >
              Return Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Rejected Modal ── */}
      <Dialog open={applicationStatus === 'rejected'} onOpenChange={onGoHome}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl z-[100]">
          <div className="bg-red-600 p-10 flex flex-col items-center justify-center text-white">
            <XCircle className="h-20 w-20 mb-4 opacity-90" />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-center leading-none">Application<br/>Declined</h2>
          </div>
          <div className="p-8 bg-white space-y-6">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">
              <span className="text-[10px] font-bold uppercase tracking-widest block mb-1 opacity-70">Reason for Rejection</span>
              <p className="font-medium">{rejectionReason || "Your application did not pass verification."}</p>
            </div>
            <p className="text-slate-500 text-sm text-center">
              Please correct the issues and submit a new application.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={onGoHome}
                className="h-14 px-8 rounded-xl font-bold uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white w-full max-w-[200px]"
              >
                Start Over
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Replacement Confirmation Modal (OLD student) ── */}
      <Dialog open={showReplacementModal} onOpenChange={onDismissReplacement}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl z-[100]">
          <div className="bg-orange-500 p-8 flex flex-col items-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <RefreshCw className="h-16 w-16 mb-4 opacity-90 relative z-10" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-center relative z-10">Record Verified</h2>
            <p className="text-orange-100 mt-2 text-center text-sm font-medium relative z-10">Proceeding with ID Replacement</p>
          </div>
          <div className="p-8 bg-slate-50 flex flex-col items-center gap-6">
            <div className="relative h-24 w-24 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white overflow-hidden shrink-0">
              <img src={getDeptLogo(fetchedCourse)} alt={fetchedCourse} className="h-16 w-16 object-contain" />
            </div>
            <div className="text-center w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Student ID</span>
              <div className="bg-white border border-slate-200 py-3 rounded-xl shadow-sm text-xl font-black text-slate-800 tracking-wider">
                {idNumber}
              </div>
            </div>
            <p className="text-slate-500 text-sm text-center leading-relaxed">
              Your active record was found. Please provide the reason for replacement and confirm your details.
            </p>
            <Button
              className="w-full h-14 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-black text-white shadow-lg"
              onClick={onDismissReplacement}
            >
              Continue Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Existing Record Redirect (NEW student) ── */}
      <Dialog open={showExistingRecordModal} onOpenChange={onUseDifferentId}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl z-[100]">
          <div className="bg-red-500 p-8 flex flex-col items-center text-white">
            <AlertCircle className="h-16 w-16 mb-4 opacity-90" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-center">Record Exists</h2>
            <p className="text-red-100 mt-2 text-center text-sm font-medium block">ID Number is already registered</p>
          </div>
          <div className="p-8 bg-white space-y-6">
            <p className="text-slate-600 text-sm italic text-center text-balance leading-relaxed">
              Our system shows this ID has already been issued. Are you trying to request a replacement?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full h-14 rounded-xl font-bold uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center justify-center gap-2"
                onClick={onSwitchToReplacement}
              >
                <RefreshCw className="h-4 w-4" /> Request Replacement instead
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 rounded-xl font-bold uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
                onClick={onUseDifferentId}
              >
                Use Different ID
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
