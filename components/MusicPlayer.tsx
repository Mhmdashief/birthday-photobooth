"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="fixed top-6 right-6 z-[100]">
            <button
                onClick={toggleMusic}
                className="bg-white/30 backdrop-blur-md border border-white/50 p-3 rounded-full shadow-lg hover:bg-white/50 transition-all duration-300 group"
                title={isPlaying ? "Matikan Musik" : "Putar Musik"}
            >
                {isPlaying ? (
                    <Volume2 className="w-6 h-6 text-rose-600 animate-pulse" />
                ) : (
                    <VolumeX className="w-6 h-6 text-rose-400" />
                )}
                
                {/* Tooltip kecil */}
                <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-black/70 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {isPlaying ? "Pause Music" : "Play Music"}
                </span>
            </button>

            <audio ref={audioRef} loop>
                <source src="/music/Shape Of My Heart.mp3" type="audio/mpeg" />
            </audio>
        </div>
    );
}
