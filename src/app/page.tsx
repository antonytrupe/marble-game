import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });

const AppWithoutSSR = dynamic(() => import("@/client/App"), { ssr: false });

export const metadata: Metadata = {
    title: 'Marble Game',
    description: 'roll around',
    icons: { icon: "/favicon.png" }
}

export const viewport: Viewport = {
    themeColor: 'black',
    width: 'device-width',
    initialScale: 1
}

export default function Home() {
    return (
        <AppWithoutSSR />
    )
}
