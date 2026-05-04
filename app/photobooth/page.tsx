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

  const isMobile =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            facingMode: "user",
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    setPhotos((prev) => [...prev, dataUrl]);

    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 180);
  };

  const startCapture = async () => {
    setPhotos([]);
    setIsCapturing(true);

    const totalShots = isMobile ? 1 : 3;

    for (let i = 0; i < totalShots; i++) {
      for (let j = 3; j > 0; j--) {
        setCountdown(j);
        await wait(1000);
      }

      setCountdown(null);
      takePhoto();

      // cinematic pause
      await wait(900);
    }

    setIsCapturing(false);
  };

  const roundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawFitImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    boxWidth: number,
    boxHeight: number,
    mobileMode = false
  ) => {
    const imgRatio = img.width / img.height;
    const boxRatio = boxWidth / boxHeight;

    let drawWidth;
    let drawHeight;
    let drawX;
    let drawY;

    if (mobileMode) {
      // portrait card → smart fit
      if (imgRatio > boxRatio) {
        drawWidth = boxWidth;
        drawHeight = boxWidth / imgRatio;
        drawX = x;
        drawY = y + (boxHeight - drawHeight) / 2;
      } else {
        drawHeight = boxHeight;
        drawWidth = boxHeight * imgRatio;
        drawX = x + (boxWidth - drawWidth) / 2;
        drawY = y;
      }
    } else {
      // desktop → cover ringan
      let sx, sy, sWidth, sHeight;

      if (imgRatio > boxRatio) {
        sHeight = img.height;
        sWidth = img.height * boxRatio;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = img.width;
        sHeight = img.width / boxRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
      }

      ctx.drawImage(
        img,
        sx,
        sy,
        sWidth,
        sHeight,
        x,
        y,
        boxWidth,
        boxHeight
      );
      return;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, boxWidth, boxHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  const downloadStrip = async () => {
    const canvas = stripCanvasRef.current;
    if (!canvas || photos.length === 0) return;

    await document.fonts.ready;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;

    const bgColor = "#fff1f2";
    const borderColor = "#fecdd3";
    const textColor = "#e11d48";

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 20;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // header
    ctx.fillStyle = textColor;
    ctx.font = "italic bold 45px serif";
    ctx.textAlign = "center";
    ctx.fillText("Your Beautiful Moments", canvas.width / 2, 105);

    const drawPhoto = (
      url: string,
      x: number,
      y: number,
      w: number,
      h: number,
      mobileMode = false
    ) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          ctx.save();

          roundedRect(ctx, x, y, w, h, 40);
          ctx.clip();

          drawFitImage(ctx, img, x, y, w, h, mobileMode);

          ctx.restore();

          roundedRect(ctx, x, y, w, h, 40);
          ctx.strokeStyle = "white";
          ctx.lineWidth = 12;
          ctx.stroke();

          ctx.font = mobileMode ? "60px serif" : "40px serif";
          ctx.fillStyle = textColor;
          ctx.fillText("❤️", x - 42, y + 38);
          ctx.fillText("❤️", x + w + 12, y + h - 6);

          resolve();
        };
      });

    if (isMobile) {
      // ===== MOBILE : ROMANTIC DESIGNED POLAROID =====
      const cardW = 900;
      const cardX = (canvas.width - cardW) / 2;
      const cardY = 220;
      const cardH = 1350;

      // Draw Polaroid Card with Pattern
      ctx.save();
      // Card Shadow
      ctx.shadowColor = "rgba(0,0,0,0.1)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = "#ffffff";
      roundedRect(ctx, cardX, cardY, cardW, cardH, 20);
      ctx.fill();
      ctx.restore();

      // Simple Floral Pattern on Card Corners
      const drawFlower = (fx: number, fy: number) => {
        ctx.fillStyle = "#fecdd3"; // rose-200
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(fx + Math.cos(i * 1.2) * 15, fy + Math.sin(i * 1.2) * 15, 12, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#fb7185"; // rose-400
        ctx.beginPath();
        ctx.arc(fx, fy, 8, 0, Math.PI * 2);
        ctx.fill();
      };
      drawFlower(cardX + 60, cardY + 60);
      drawFlower(cardX + cardW - 60, cardY + 60);
      drawFlower(cardX + 60, cardY + cardH - 240);
      drawFlower(cardX + cardW - 60, cardY + cardH - 240);

      // Photo inside Polaroid
      const pPadding = 70;
      const pW = cardW - pPadding * 2;
      const pH = 900;
      const pX = cardX + pPadding;
      const pY = cardY + pPadding + 40;

      await drawPhoto(photos[0], pX, pY, pW, pH, true);

      // Washi Tape Effect
      ctx.save();
      ctx.fillStyle = "rgba(251, 113, 133, 0.4)"; // rose-400 translucent
      ctx.rotate(-0.05);
      ctx.fillRect(cardX + 40, cardY + 10, 180, 50);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(251, 113, 133, 0.4)";
      ctx.translate(cardX + cardW - 40, cardY + 10);
      ctx.rotate(0.05);
      ctx.fillRect(-180, 0, 180, 50);
      ctx.restore();

      // Note
      ctx.fillStyle = "#e11d48";
      ctx.font = "italic bold 42px serif";
      ctx.textAlign = "center";
      ctx.fillText("Special Moments", canvas.width / 2, cardY + pH + 200);

      // Hearts on Card
      ctx.font = "50px serif";
      ctx.fillText("❤️", cardX + 80, cardY + cardH - 100);
      ctx.fillText("❤️", cardX + cardW - 80, cardY + cardH - 100);
      ctx.fillText("✨", cardX + cardW / 2, cardY + cardH - 60);
    } else {
      // ===== DESKTOP : 3 STRIP =====
      const photoWidth = 840;
      const photoHeight = 480;
      const gap = 60;
      const startY = 180;
      const x = (canvas.width - photoWidth) / 2;

      await Promise.all(
        photos.slice(0, 3).map((url, i) =>
          drawPhoto(
            url,
            x,
            startY + i * (photoHeight + gap),
            photoWidth,
            photoHeight
          )
        )
      );
    }

    // footer
    const dateY = 1780;
    const captionY = 1835;

    ctx.font = "bold 34px sans-serif";
    ctx.fillStyle = "#fb7185";
    ctx.fillText("5 Mei 2026", canvas.width / 2, dateY);

    ctx.font = "italic 32px serif";
    ctx.fillStyle = textColor;
    ctx.fillText("Made with love for you", canvas.width / 2, captionY);


    const dataUrl = canvas.toDataURL("image/png", 1);

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.download = `aymar-photostrip-${Date.now()}.png`;
      link.href = url;
      link.click();

      if (/Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)) {
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200 p-4 md:p-8 font-sans">
      <Link href="/letter" className="fixed top-6 left-6 z-[100]">
        <button className="bg-white/30 backdrop-blur-md border border-white/50 p-3 rounded-full shadow-lg hover:bg-white/50 transition-all duration-300 group flex items-center gap-2 pr-5">
          <ArrowLeft className="w-6 h-6 text-rose-600" />
          <span className="text-rose-600 font-bold text-sm hidden md:block">
            Kembali
          </span>
        </button>
      </Link>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center py-10">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group w-full max-w-[320px] md:max-w-[400px]">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

            <div className="relative bg-white p-2 md:p-3 rounded-2xl shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-xl w-full aspect-[3/2] object-cover scale-x-[-1]"
              />

              {showFlash && (
                <div className="absolute inset-0 bg-white animate-pulse z-50 rounded-xl" />
              )}

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
                {isMobile ? (
                  <div className="w-full mb-6">
                    <img
                      src={photos[0]}
                      alt="Captured"
                      className="w-full max-h-[520px] object-cover rounded-2xl shadow-xl border-4 border-white"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-6 w-full">
                    {photos.map((p, i) => (
                      <div key={i} className="relative">
                        <img
                          src={p}
                          alt={`Captured ${i}`}
                          className="w-full rounded-lg shadow-md border-2 border-white"
                        />
                        <div className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                          {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={downloadStrip}
                  className="w-full flex items-center justify-center gap-2 bg-white text-rose-500 border-2 border-rose-500 px-4 md:px-6 py-3 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-md text-sm md:text-base"
                >
                  <Download className="w-5 h-5" />
                  Download Photo Strip
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={stripCanvasRef} className="hidden" />
    </main>
  );
}