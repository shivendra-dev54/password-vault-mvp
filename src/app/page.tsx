"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/AuthStore";

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();

  const checkUserStatus = useCallback(() => {
    if (user) {
      router.push("/pass");
    }
  }, [router, user]);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  return (
    <div className="flex flex-col items-center justify-center overflow-x-hidden bg-black text-white px-6">
      {/* Hero Section */}
      <div className="mt-32 text-center max-w-3xl">
        <h1 className="text-6xl font-extrabold mb-6">
          Secure Your Passwords. Simplify Your Life.
        </h1>
        <p className="text-lg text-gray-400 mb-10">
          Generate strong passwords and store them safely in your encrypted vault.
          Privacy-first. Fast. Effortless.
        </p>

        <div className="flex gap-6 justify-center">
          <Link
            href="/auth/sign_up"
            className="px-6 py-3 bg-indigo-600 border border-indigo-700 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth/sign_in"
            className="px-6 py-3 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl text-center">
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-3">Strong Generator</h2>
          <p className="text-gray-400">
            Create unique, uncrackable passwords in a single click — with full
            control over symbols, numbers, and exclusions.
          </p>
        </div>

        <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-3">Encrypted Vault</h2>
          <p className="text-gray-400">
            Every password is encrypted on the backend using modern AES-GCM before
            saving — your secrets stay yours.
          </p>
        </div>

        <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-3">Privacy-First</h2>
          <p className="text-gray-400">
            No trackers, no data sharing. You control what`s saved and what`s
            deleted — permanently.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 text-gray-600 text-sm">
        © {new Date().getFullYear()} PassVault · Built with care by developers for developers.
      </footer>
    </div>
  );
}
