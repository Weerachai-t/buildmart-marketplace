import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"BuildMart Thailand — ตลาดวัสดุก่อสร้าง",description:"Marketplace วัสดุก่อสร้างจากซัพพลายเออร์ทั่วไทย"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body>{children}</body></html>}
