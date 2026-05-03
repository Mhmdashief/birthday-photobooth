"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Download, RefreshCw, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Photobooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stripCanvasRef = useRef<HTMLCanvasElement>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // 🎥 Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    startCamera();
  }, []);

  // 📸 Take single photo
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    // Gunakan resolusi asli video agar tidak terpotong
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (ctx) {
      // Mirroring
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const dataUrl = canvas.toDataURL("image/png");
    setPhotos((prev) => [...prev, dataUrl]);

    // Flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);
  };

  // ⏱️ Start capture sequence
  const startCapture = async () => {
    setPhotos([]);
    setIsCapturing(true);

    for (let i = 0; i < 3; i++) { // 3 foto untuk IG Story
      for (let j = 3; j > 0; j--) {
        setCountdown(j);
        await new Promise((r) => setTimeout(r, 1000));
      }
      setCountdown(null);
      takePhoto();
      await new Promise((r) => setTimeout(r, 800));
    }
    setIsCapturing(false);
  };

  // 💾 Download Photo Strip
  const downloadStrip = async () => {
    const canvas = stripCanvasRef.current;
    if (!canvas || photos.length < 3) return;

    // Tunggu font siap agar teks tidak berantakan
    await document.fonts.ready;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ukuran Standar IG Story (1080 x 1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // Design Tokens
    const bgColor = "#fff1f2"; // rose-50
    const borderColor = "#fecdd3"; // rose-200
    const textColor = "#e11d48"; // rose-600
    const padding = 80; // Reduced padding to make photos wider
    const gap = 30; // Reduced gap to make room for taller photos
    const borderRadius = 40;
    const photoWidth = canvas.width - (padding * 2.5);
    const photoHeight = 500; // Increased height (from 460) to make it less "narrow"

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border Luar (Aesthetic frame)
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 20;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    const drawPhoto = (url: string, index: number) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const y = 200 + (index * (photoHeight + gap)); // Started slightly higher (from 220)

          ctx.save();

          // Clip for Rounded Corners
          ctx.beginPath();
          ctx.moveTo(padding * 1.25 + borderRadius, y);
          ctx.lineTo(padding * 1.25 + photoWidth - borderRadius, y);
          ctx.quadraticCurveTo(padding * 1.25 + photoWidth, y, padding * 1.25 + photoWidth, y + borderRadius);
          ctx.lineTo(padding * 1.25 + photoWidth, y + photoHeight - borderRadius);
          ctx.quadraticCurveTo(padding * 1.25 + photoWidth, y + photoHeight, padding * 1.25 + photoWidth - borderRadius, y + photoHeight);
          ctx.lineTo(padding * 1.25 + borderRadius, y + photoHeight);
          ctx.quadraticCurveTo(padding * 1.25, y + photoHeight, padding * 1.25, y + photoHeight - borderRadius);
          ctx.lineTo(padding * 1.25, y + borderRadius);
          ctx.quadraticCurveTo(padding * 1.25, y, padding * 1.25 + borderRadius, y);
          ctx.closePath();
          ctx.clip();

          // Center Crop Logic (Object-fit: cover equivalent)
          const imgRatio = img.width / img.height;
          const targetRatio = photoWidth / photoHeight;
          let sx, sy, sWidth, sHeight;

          if (imgRatio > targetRatio) {
            sHeight = img.height;
            sWidth = img.height * targetRatio;
            sx = (img.width - sWidth) / 2;
            sy = 0;
          } else {
            sWidth = img.width;
            sHeight = img.width / targetRatio;
            sx = 0;
            sy = (img.height - sHeight) / 2;
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, padding * 1.25, y, photoWidth, photoHeight);
          ctx.restore();

          // White Border for Photo
          ctx.strokeStyle = "white";
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(padding * 1.25 + borderRadius, y);
          ctx.lineTo(padding * 1.25 + photoWidth - borderRadius, y);
          ctx.quadraticCurveTo(padding * 1.25 + photoWidth, y, padding * 1.25 + photoWidth, y + borderRadius);
          ctx.lineTo(padding * 1.25 + photoWidth, y + photoHeight - borderRadius);
          ctx.quadraticCurveTo(padding * 1.25 + photoWidth, y + photoHeight, padding * 1.25 + photoWidth - borderRadius, y + photoHeight);
          ctx.lineTo(padding * 1.25 + borderRadius, y + photoHeight);
          ctx.quadraticCurveTo(padding * 1.25, y + photoHeight, padding * 1.25, y + photoHeight - borderRadius);
          ctx.lineTo(padding * 1.25, y + borderRadius);
          ctx.quadraticCurveTo(padding * 1.25, y, padding * 1.25 + borderRadius, y);
          ctx.closePath();
          ctx.stroke();

          // Ornamen Hati
          ctx.font = "40px serif";
          ctx.fillStyle = "#e11d48";
          ctx.fillText("❤️", padding * 1.25 - 45, y + 40);
          ctx.fillText("❤️", padding * 1.25 + photoWidth + 5, y + photoHeight - 5);

          resolve();
        };
      });
    }

    // Render semua foto secara berurutan
    await Promise.all(photos.map((url, i) => drawPhoto(url, i)));

    // Header Text
    ctx.fillStyle = textColor;
    ctx.font = "italic bold 40px serif";
    ctx.textAlign = "center";
    ctx.fillText("Our Beautiful Moments", canvas.width / 2, 130);

    // Footer
    const footerY = canvas.height - 110;
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#fb7185";
    ctx.fillText("5 Mei 2026", canvas.width / 2, footerY - 40);

    ctx.font = "italic 30px serif";
    ctx.fillStyle = textColor;
    ctx.fillText("Made with love for you", canvas.width / 2, footerY);

    // Generate Image
    const dataUrl = canvas.toDataURL("image/png", 1.0);

    // 1. Mobile Friendly (iPhone/Safari)
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Desktop/Android: Auto-download
      const link = document.createElement("a");
      link.download = `aymar-photostrip-${Date.now()}.png`;
      link.href = url;
      link.click();

      // Mobile Safari: Open in new tab as fallback
      if (/Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)) {
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error("Download error:", e);
      // Fallback
      const link = document.createElement("a");
      link.download = `aymar-photostrip.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200 p-4 md:p-8 font-sans">

      {/* BACK BUTTON */}
      <Link href="/letter" className="fixed top-6 left-6 z-[100]">
        <button className="bg-white/30 backdrop-blur-md border border-white/50 p-3 rounded-full shadow-lg hover:bg-white/50 transition-all duration-300 group flex items-center gap-2 pr-5">
          <ArrowLeft className="w-6 h-6 text-rose-600" />
          <span className="text-rose-600 font-bold text-sm hidden md:block">Kembali</span>
        </button>
      </Link>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center py-10">

        {/* Kiri: Kamera */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group w-full max-w-[320px] md:max-w-[400px]">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white p-2 md:p-3 rounded-2xl shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-xl w-full aspect-[3/4] object-cover scale-x-[-1]"
              />

              {/* Flash Overlay */}
              {showFlash && <div className="absolute inset-0 bg-white animate-pulse z-50 rounded-xl"></div>}

              {/* Countdown Overlay */}
              {countdown && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-6xl md:text-8xl font-black drop-shadow-2xl animate-ping">
                    {countdown}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={startCapture}
            disabled={isCapturing}
            className={`flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg shadow-xl transition-all duration-300 ${isCapturing
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 active:scale-95"
              }`}
          >
            {isCapturing ? <RefreshCw className="animate-spin" /> : <Camera />}
            {isCapturing ? "Senyum! 📸" : "Mulai Sesi Foto"}
          </button>
        </div>

        {/* Kanan: Hasil & Preview */}
        <div className="flex flex-col items-center w-full">
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-xl w-full min-h-[400px] md:min-h-[500px] flex flex-col items-center">
            <h2 className="text-rose-600 font-serif italic text-xl md:text-2xl mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Memories for Aymar
            </h2>

            {photos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-rose-300 italic text-center p-4 md:p-8">
                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-dashed border-rose-200 rounded-full flex items-center justify-center mb-4">
                  📸
                </div>
                Belum ada foto. <br /> Yuk mulai ambil kenanganmu!
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {photos.map((p, i) => (
                    <div key={i} className="relative group">
                      <img src={p} className="w-full rounded-lg shadow-md border-2 border-white" alt={`Captured ${i}`} />
                      <div className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {photos.length >= 3 && (
                  <button
                    onClick={downloadStrip}
                    className="w-full flex items-center justify-center gap-2 bg-white text-rose-500 border-2 border-rose-500 px-4 md:px-6 py-3 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-md text-sm md:text-base"
                  >
                    <Download className="w-5 h-5" /> Download Photo Strip
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Hidden Elements */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={stripCanvasRef} className="hidden" />
    </main>
  );
}
