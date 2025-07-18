import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {SWRProvider} from "@/components/providers/SWRProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "E-commerce Discor",
    description: "Sistema E-commerce exclusivo clientes",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <SWRProvider>
            {children}
        </SWRProvider>

        </body>
        </html>
    );
}
