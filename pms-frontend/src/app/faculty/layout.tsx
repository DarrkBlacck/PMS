import type { Metadata } from "next";
import "app/globals.css";
import NavBar from "../components/nav/NavBar";
import FacultySidebar from "../components/side/FacultySideBar";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "PMS",
  description: "Placement Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        {/* Navigation Bar */}
        <NavBar />

        <main className="flex min-h-screen "> {/* pt-16 to avoid overlap with NavBar */}
          {/* Sidebar (Fixed Width & Non-Overlapping) */}
          <FacultySidebar />
          {/* Main Content (Margin to Avoid Overlap) */}
          <div className="flex-1 ml-48 z-20 mt-20">
            {children}
            <ToastContainer/>
          </div>
        </main>
      </body>
    </html>
  );
}

