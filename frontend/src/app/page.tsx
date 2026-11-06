"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const savedSession = localStorage.getItem("user_session");
    if (savedSession) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
      <p>Memuat aplikasi...</p>
    </div>
  );
}