'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  RefreshCw,
  Maximize2,
  Crop as CropIcon,
  Sparkles,
  Sliders,
} from 'lucide-react';

export type AspectPreset = '1:1' | '4:5' | '16:9' | '21:9' | 'auto';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  fileName?: string;
  defaultAspectRatio?: 'banner' | 'square' | 'portrait' | 'auto';
  onCropComplete: (croppedFile: File) => void;
  onSkipCrop?: () => void;
}

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  fileName = 'gambar.jpg',
  defaultAspectRatio = 'auto',
  onCropComplete,
  onSkipCrop,
}: ImageCropModalProps) {
  // Map default prop to preset
  const getInitialPreset = (): AspectPreset => {
    switch (defaultAspectRatio) {
      case 'square':
        return '1:1';
      case 'portrait':
        return '4:5';
      case 'banner':
        return '16:9';
      default:
        return '1:1';
    }
  };

  const [preset, setPreset] = useState<AspectPreset>(getInitialPreset());
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [naturalDim, setNaturalDim] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Sync initial preset when defaultAspectRatio or modal opens
  useEffect(() => {
    if (isOpen) {
      setPreset(getInitialPreset());
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, defaultAspectRatio]);

  // Load natural image dimensions
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      setNaturalDim({ width: img.naturalWidth, height: img.naturalHeight });
      setPan({ x: 0, y: 0 });
      setZoom(1);
    };
  }, [imageSrc]);

  // Compute numeric aspect ratio (W / H)
  const getAspectRatioNumeric = useCallback((): number => {
    switch (preset) {
      case '1:1':
        return 1;
      case '4:5':
        return 4 / 5;
      case '16:9':
        return 16 / 9;
      case '21:9':
        return 21 / 9;
      case 'auto':
      default:
        if (naturalDim.width > 0 && naturalDim.height > 0) {
          return naturalDim.width / naturalDim.height;
        }
        return 1;
    }
  }, [preset, naturalDim]);

  // Compute Crop Box Dimensions within maximum preview area (460x360)
  const maxStageW = 460;
  const maxStageH = 340;
  const ratio = getAspectRatioNumeric();

  let boxW = 320;
  let boxH = 320;
  if (ratio >= 1) {
    boxW = Math.min(maxStageW, 440);
    boxH = boxW / ratio;
    if (boxH > maxStageH) {
      boxH = maxStageH;
      boxW = boxH * ratio;
    }
  } else {
    boxH = Math.min(maxStageH, 340);
    boxW = boxH * ratio;
  }

  // Account for 90 or 270 deg rotation swapping effective dimensions
  const isRotated90 = rotation % 180 !== 0;
  const effW = isRotated90 ? naturalDim.height : naturalDim.width;
  const effH = isRotated90 ? naturalDim.width : naturalDim.height;

  // Base scale so that image always fills the crop box at zoom = 1
  const baseScale = effW > 0 && effH > 0 ? Math.max(boxW / effW, boxH / effH) : 1;

  // Max pan bounds so image can never leave a blank hole in the crop box
  const renderedW = effW * baseScale * zoom;
  const renderedH = effH * baseScale * zoom;
  const maxPanX = Math.max(0, (renderedW - boxW) / 2);
  const maxPanY = Math.max(0, (renderedH - boxH) / 2);

  const clampPan = (x: number, y: number) => ({
    x: Math.min(maxPanX, Math.max(-maxPanX, x)),
    y: Math.min(maxPanY, Math.max(-maxPanY, y)),
  });

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPan(clampPan(newX, newY));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag handlers (for Mobile & Tablets)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    setPan(clampPan(newX, newY));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => {
      const next = Math.min(3, Math.max(1, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  // Reset transforms
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setPan({ x: 0, y: 0 });
  };

  // Generate cropped image on HTML5 Canvas and emit File
  const handleApplyCrop = async () => {
    if (!imageRef.current || naturalDim.width === 0) return;
    setIsProcessing(true);

    try {
      // Determine output canvas size with high fidelity (up to 1400px)
      const targetMaxDim = 1200;
      let outW = Math.round(boxW);
      let outH = Math.round(boxH);

      if (boxW >= boxH) {
        outW = Math.min(targetMaxDim, Math.max(boxW * 2, naturalDim.width));
        outH = Math.round(outW / ratio);
      } else {
        outH = Math.min(targetMaxDim, Math.max(boxH * 2, naturalDim.height));
        outW = Math.round(outH * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context tidak tersedia');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Move canvas center to origin
      ctx.save();
      ctx.translate(outW / 2, outH / 2);

      // 2. Scale ratio between screen crop box and high-res canvas
      const scaleToCanvas = outW / boxW;

      // 3. Pan
      ctx.translate(pan.x * scaleToCanvas, pan.y * scaleToCanvas);

      // 4. Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // 5. Flip horizontal
      ctx.scale(flipH ? -1 : 1, 1);

      // 6. Draw original un-rotated natural image centered
      const drawW = naturalDim.width * baseScale * zoom * scaleToCanvas;
      const drawH = naturalDim.height * baseScale * zoom * scaleToCanvas;

      ctx.drawImage(imageRef.current, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Export as high quality JPEG blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }
          const cleanName = (fileName || 'gambar.jpg').replace(/\.[^/.]+$/, '') + '.jpg';
          const croppedFile = new File([blob], cleanName, { type: 'image/jpeg' });
          onCropComplete(croppedFile);
          setIsProcessing(false);
          onClose();
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Gagal melakukan crop gambar:', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-h-[92vh]">
        
        {/* ========================================================
            MODAL HEADER
        ======================================================== */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <CropIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Sesuaikan Komposisi & Crop Gambar</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  <Sparkles className="w-3 h-3" />
                  Optimal Layout
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Geser, perbesar, dan sesuaikan fokus gambar agar pas dengan tata letak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================
            ASPECT RATIO SELECTOR TABS
        ======================================================== */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sliders className="w-3 h-3" />
            Rasio Layout:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { key: '1:1', label: '1:1 Persegi', desc: 'Guru, WKS, Prestasi, Logo' },
              { key: '4:5', label: '4:5 Potret', desc: 'Pas Foto Resmi Kepsek' },
              { key: '16:9', label: '16:9 Wide', desc: 'Berita & Agenda' },
              { key: '21:9', label: '21:9 Banner', desc: 'Hero Slider Banner' },
              { key: 'auto', label: 'Asli', desc: 'Proporsi Asli File' },
            ].map((tab) => {
              const active = preset === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setPreset(tab.key as AspectPreset);
                    setPan({ x: 0, y: 0 });
                  }}
                  title={tab.desc}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-xs flex items-center gap-1 cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            INTERACTIVE CROP STAGE (DARK MATTE & VIEWFINDER)
        ======================================================== */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className={`relative w-full h-[360px] sm:h-[400px] bg-slate-950 flex items-center justify-center overflow-hidden select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Subtle Grid Background Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Active Image Element */}
          {imageSrc && (
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop Target"
              crossOrigin="anonymous"
              draggable={false}
              style={{
                width: `${naturalDim.width * baseScale * zoom}px`,
                height: `${naturalDim.height * baseScale * zoom}px`,
                transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                transformOrigin: 'center center',
              }}
              className="pointer-events-none select-none max-w-none transition-transform duration-75"
            />
          )}

          {/* CROP BOX VIEWFINDER & RULE-OF-THIRDS GRID */}
          <div
            style={{ width: `${boxW}px`, height: `${boxH}px` }}
            className="absolute pointer-events-none rounded-sm border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.78)] z-10 flex flex-col justify-between"
          >
            {/* Rule of Thirds - Horizontal Lines */}
            <div className="absolute inset-0 flex flex-col justify-evenly pointer-events-none">
              <div className="w-full border-b border-white/25 border-dashed" />
              <div className="w-full border-b border-white/25 border-dashed" />
            </div>

            {/* Rule of Thirds - Vertical Lines */}
            <div className="absolute inset-0 flex justify-evenly pointer-events-none">
              <div className="h-full border-r border-white/25 border-dashed" />
              <div className="h-full border-r border-white/25 border-dashed" />
            </div>

            {/* 4 Corner L-Brackets for Professional Camera Framing Aesthetic */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-emerald-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-emerald-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-emerald-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-emerald-400" />

            {/* Center crosshair dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
            </div>
          </div>

          {/* Quick Helper Floating Badge */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none bg-slate-900/80 backdrop-blur-xs text-white/90 text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/10 shadow-xs flex items-center gap-1.5">
            <Maximize2 className="w-3 h-3 text-emerald-400" />
            <span>Klik & geser gambar • Scroll untuk zoom</span>
          </div>
        </div>

        {/* ========================================================
            TOOLBAR CONTROLS (ZOOM, ROTATION, FLIP, RESET)
        ======================================================== */}
        <div className="px-5 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          
          {/* Zoom Slider Control */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(1, Number((prev - 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Perkecil Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Perbesar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-500 w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Transformation Buttons: Rotate, Flip, Reset */}
          <div className="flex items-center gap-1.5 shrink-0 border-l border-slate-200 dark:border-slate-800 pl-3">
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition cursor-pointer"
              title="Putar 90° ke Kiri"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition cursor-pointer"
              title="Putar 90° ke Kanan"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setFlipH((prev) => !prev)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                flipH
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600'
              }`}
              title="Cermin / Balik Horizontal"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="Reset Posisi & Zoom"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================
            MODAL FOOTER (ACTIONS)
        ======================================================== */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            {onSkipCrop && (
              <button
                type="button"
                onClick={() => {
                  onSkipCrop();
                  onClose();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer underline underline-offset-2"
              >
                Gunakan File Asli (Tanpa Crop)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleApplyCrop}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses Crop...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Terapkan & Simpan Gambar</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
