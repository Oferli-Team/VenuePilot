"use client";

import { useEffect, useState } from "react";
import Footer from "../Footer";
import Header from "./header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    if (window.location.hostname.includes("sandbox")) {
      setIsSandbox(true);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      {isSandbox && (
        <div className="fixed left-0 right-0 top-0 z-[1000] h-2 bg-yellow-600"></div>
      )}
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
  );
}
