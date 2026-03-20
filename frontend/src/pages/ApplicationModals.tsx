import React, { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import SignatureCanvas from 'react-signature-canvas';
import { getCroppedImg } from '@/lib/image-utils';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, Pencil, Maximize2 } from 'lucide-react';

interface ApplicationModalsProps {
  idImageSrc: string | null;
  onIdSaved: (file: File) => void;
  onIdCancel: () => void;

  showSignaturePad: boolean;
  onSignatureSaved: (file: File) => void;
  onSignatureCancel: () => void;
}

export default function ApplicationModals({
  idImageSrc,
  onIdSaved,
  onIdCancel,
  showSignaturePad,
  onSignatureSaved,
  onSignatureCancel
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
    </>
  );
}
