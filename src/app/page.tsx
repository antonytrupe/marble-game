import dynamic from "next/dynamic";
import { Metadata, Viewport } from "next";

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

export default () => {
    console.log('page.tsx')
    return (
        <AppWithoutSSR />
    )
}
