"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { getClient, saveSession } from "@/lib/telegram";

export default function LoginPage() {
  const router = useRouter();
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const passwordResolveRef = useRef<((pass: string) => void) | null>(null);

  useEffect(() => {
    let abortController = new AbortController();

    const startLogin = async () => {
      try {
        setLoading(true);
        const client = await getClient();
        
        const apiId = parseInt(process.env.NEXT_PUBLIC_TELEGRAM_API_ID || "0", 10);
        const apiHash = process.env.NEXT_PUBLIC_TELEGRAM_API_HASH || "";

        await client.signInUserWithQrCode(
          { apiId, apiHash },
          {
            qrCode: async (qr) => {
              const tokenBuffer = qr.token;
              // Base64url encode the token
              const base64Token = Buffer.from(tokenBuffer).toString('base64url');
              const tgUrl = `tg://login?token=${base64Token}`;
              const dataUrl = await QRCode.toDataURL(tgUrl, {
                width: 300,
                margin: 2,
                color: {
                  dark: '#000000',
                  light: '#ffffff',
                }
              });
              setQrImageUrl(dataUrl);
              setLoading(false);
            },
            password: async (hint?: string) => {
              setPasswordRequired(true);
              return new Promise<string>((resolve) => {
                passwordResolveRef.current = resolve;
              });
            },
            onError: async (err) => {
              setError(err.message);
              setLoading(false);
              return true;
            },
            abortSignal: abortController.signal
          }
        );

        // Login successful
        saveSession(client);
        router.push("/dashboard");

      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || "An error occurred during login");
        }
      } finally {
        setLoading(false);
      }
    };

    startLogin();

    return () => {
      abortController.abort();
    };
  }, [router]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordResolveRef.current) {
      passwordResolveRef.current(password);
      setPasswordRequired(false);
      setLoading(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[rgba(212,212,212,0.06)] backdrop-blur-md rounded-[24px] border border-[#e5e5e5]/10 p-8">
        <div className="mb-6">
          <Link href="/" className="text-[#686868] hover:text-[#ededed] text-sm flex items-center gap-2 transition-colors">
            &larr; Back
          </Link>
        </div>
        
        <h1 className="text-2xl font-geist text-[#ededed] font-medium mb-2 text-center">Login to YourDrive</h1>
        <p className="text-[#c2c2c2] text-center mb-8 text-sm">Scan the QR code with your Telegram app</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[300px]">
          {loading && !qrImageUrl && !passwordRequired ? (
            <div className="text-[#c2c2c2] text-sm animate-pulse">Connecting to Telegram...</div>
          ) : passwordRequired ? (
            <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-4">
              <div>
                <label className="block text-[#c2c2c2] text-sm mb-2">Two-Step Verification Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#161616] border border-[#e5e5e5]/10 rounded-xl px-4 py-3 text-[#ededed] focus:outline-none focus:border-[#6b62f2]/50 transition-colors"
                  placeholder="Enter your password"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black rounded-full px-6 py-3 font-medium hover:bg-white/90 transition-colors mt-2"
              >
                Submit Password
              </button>
            </form>
          ) : qrImageUrl ? (
            <div className="bg-white p-2 rounded-2xl">
              <img src={qrImageUrl} alt="Telegram Login QR Code" className="w-[280px] h-[280px]" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
