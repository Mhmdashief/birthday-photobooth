import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-pink-200 text-center px-6 py-12">
      <div className="mb-8 animate-bounce transition-all duration-500">
        <Image
          src="/images/love.png"
          alt="Love icon"
          width={150}
          height={150}
          className="w-32 h-32 md:w-[150px] md:h-[150px] drop-shadow-2xl"
        />
      </div>

      <h1 className="text-3xl md:text-5xl font-bold mb-8 text-pink-600 tracking-tight max-w-sm md:max-w-2xl">
        I have Something for you...
      </h1>

      <Link href="/letter">
        <button className="group relative px-10 py-4 bg-pink-500 text-white rounded-full font-bold text-lg shadow-lg hover:bg-pink-600 hover:scale-105 transition-all duration-300">
          <span className="relative z-10 flex items-center gap-2">
            Open Now
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </button>
      </Link>
    </main>
  );
}