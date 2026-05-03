"use client";
import { useState } from "react";

export default function Envelope({ onOpen }: { onOpen: () => void }) {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        if (open) return;
        setOpen(true);
        setTimeout(() => {
            onOpen();
        }, 1200); 
    };

    return (
        <div className="relative group perspective-1000 flex items-center justify-center h-64">
            <div
                onClick={handleOpen}
                className={`relative w-72 h-48 bg-rose-400 rounded-b-lg shadow-[0_20px_50px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-1000 preserve-3d ${
                    open ? "scale-110 -translate-y-10" : "hover:scale-105"
                }`}
            >
                {/* Back part of envelope */}
                <div className="absolute inset-0 bg-rose-400 rounded-lg"></div>

                {/* Flap */}
                <div 
                    className={`absolute top-0 left-0 w-full h-full bg-rose-300 rounded-t-lg transition-all duration-700 origin-top preserve-3d ${
                        open ? "rotate-x-180 z-0" : "z-30"
                    }`}
                    style={{ clipPath: "polygon(0 0, 50% 60%, 100% 0)" }}
                >
                    <div className="absolute inset-0 bg-rose-300 shadow-inner"></div>
                </div>
                
                {/* Flap Shadow/Inside */}
                <div 
                    className={`absolute top-0 left-0 w-full h-full bg-rose-200 rounded-t-lg transition-all duration-700 origin-top ${
                        open ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                    style={{ clipPath: "polygon(0 0, 50% 60%, 100% 0)", transform: "rotateX(180deg)" }}
                ></div>

                {/* Front Left Triangle */}
                <div className="absolute inset-0 bg-rose-400 rounded-lg z-20"
                     style={{ clipPath: "polygon(0 0, 0 100%, 50% 50%)" }}>
                </div>

                {/* Front Right Triangle */}
                <div className="absolute inset-0 bg-rose-400 rounded-lg z-20"
                     style={{ clipPath: "polygon(100% 0, 100% 100%, 50% 50%)" }}>
                </div>

                {/* Front Bottom Triangle */}
                <div className="absolute inset-0 bg-rose-500/10 rounded-lg z-20"
                     style={{ clipPath: "polygon(0 100%, 100% 100%, 50% 50%)" }}>
                    <div className="absolute inset-0 bg-rose-400 border-b border-rose-500/20 rounded-b-lg"></div>
                </div>

                {/* Heart Seal */}
                {!open && (
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 transition-all duration-500 group-hover:scale-125">
                        <div className="text-4xl filter drop-shadow-md">❤️</div>
                    </div>
                )}

                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 font-medium tracking-widest text-[10px] uppercase z-20 transition-opacity duration-300 ${open ? "opacity-0" : "opacity-100 animate-pulse"}`}>
                    Klik Untuk Membuka
                </div>
            </div>
        </div>
    );
}