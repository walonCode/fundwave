import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayoutWrapper from "../components/ClientLayoutWrapper"
import { AuthProvider } from "../context/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FundWaveSL - Crowdfunding for Sierra Leone",
  description: "Empowering Sierra Leoneans to fund their dreams and support their communities",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
