import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";

export const metadata = {
    title: "Special For You ",
    description: "A special gift for you",
    icons: {
        icon: "/images/love profile.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id">
            <body>
                <MusicPlayer />
                {children}
            </body>
        </html>
    );
}