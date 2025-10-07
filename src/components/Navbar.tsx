"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/AuthStore";
import { useRouter } from "next/navigation";
import { request } from "@/utils/requestHandler";
import { useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await request("/auth/logout", {}, "POST", true);
      const body = await res.json();

      if (body.success) {
        logout();
        router.push("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/pass");
    }
    else{
      router.push("/");
    }
  }, [user, router]);

  return (
    <nav className="bg-black border-b border-gray-800 text-white">
      <div className="mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand */}
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-bold tracking-tight"
        >
          PassVault
        </button>

        {/* Links */}
        <div className="flex gap-6">
          {!user ? (
            <>
              <Link href="/auth/sign_in" className="hover:text-gray-400">
                Sign In
              </Link>
              <Link href="/auth/sign_up" className="hover:text-gray-400">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={handleLogout}
                className="hover:text-gray-400 self-center hover:cursor-pointer"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
