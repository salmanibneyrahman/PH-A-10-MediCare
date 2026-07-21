import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: {
        default: "MediCare Connect – Healthcare Management System",
        template: "%s | MediCare Connect",
    },
    description:
        "Connect with top doctors, book appointments, and manage your healthcare journey with MediCare Connect.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0f1e] text-slate-200`}
            >
                <AuthProvider>
                    <Navbar />
                    <main className="min-h-screen">{children}</main>
                    <Footer />
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="dark"
                        toastStyle={{
                            background: "rgba(15, 23, 42, 0.95)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(6, 182, 212, 0.2)",
                            color: "#e2e8f0",
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}