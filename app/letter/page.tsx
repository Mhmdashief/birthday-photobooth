"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Envelope from "@/components/Envelope";
import TypingText from "@/components/TypingText";

export default function LetterPage() {
    const [opened, setOpened] = useState(false);
    const router = useRouter();

    const handleOpen = () => {
        setOpened(true);
    };

    return (
        <main className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 px-4 text-center">

            {/* BACK BUTTON */}
            <Link href="/" className="fixed top-6 left-6 z-[100]">
                <button className="bg-white/30 backdrop-blur-md border border-white/50 p-3 rounded-full shadow-lg hover:bg-white/50 transition-all duration-300 group flex items-center gap-2 pr-5">
                    <ArrowLeft className="w-6 h-6 text-rose-600" />
                    <span className="text-rose-600 font-bold text-sm hidden md:block">Kembali</span>
                </button>
            </Link>

            {/* Floating Hearts Background */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float text-pink-400/40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `100%`,
                            fontSize: `${Math.random() * 20 + 20}px`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${Math.random() * 3 + 4}s`,
                        }}
                    >
                        ❤️
                    </div>
                ))}
            </div>

            {!opened ? (
                <div className="animate-fadeIn transition-all duration-1000 scale-75 md:scale-100">
                    <Envelope onOpen={handleOpen} />
                </div>
            ) : (
                <div className="animate-fadeIn backdrop-blur-xl bg-white/30 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-w-sm md:max-w-md w-full border border-white/50 relative overflow-hidden mx-4">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-rose-400"></div>

                    <div className="text-rose-700 font-serif italic text-lg md:text-xl mb-4">For my one and only...</div>

                    <div className="text-zinc-800 font-medium tracking-wide text-sm md:text-base leading-relaxed text-left md:text-center">
                        <TypingText
                            text={`Hai Manusia tercantik dan terlucu yang ada di universe ini...
    
Honeslty, I'm very happy because you have already trusted me and love me back 🤍

Maybe I'm not perfect and still learning to be better for you... 
but I promise I will try my best for you and risk it all for you.

I hope you're always happy and healthy, 
and always smiling like this forever 🤍 
and I want to make you the happiest person on earth.

Don't forget we still have a lot of plans to do and a lot of memories to make... 
let's go around the world together 🤍

Happy Birthday, Aymar 🎂`}
                        />
                    </div>

                    {/* Signature Layout */}
                    <div className="mt-10 flex flex-col items-end animate-fadeIn delay-1000">
                        <div className="h-[1px] w-24 bg-rose-200 mb-2"></div>
                        <div className="text-rose-500 font-serif italic text-base md:text-lg">
                            From your 911 person ❤️
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/photobooth")}
                        className="mt-6 md:mt-8 px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-lg transition-all duration-500 hover:scale-105 active:scale-95 font-bold tracking-wider text-sm md:text-base"
                    >
                        lets make a memories 📸
                    </button>

                    <div className="mt-4 text-rose-500/60 text-[10px] md:text-xs italic">With love, ❤️</div>
                </div>
            )}
        </main>
    );
}
