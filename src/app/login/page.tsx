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
              const base64Token = Buffer.from(tokenBuffer)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
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
    <div className="min-h-screen bg-warm-canvas flex flex-col items-center justify-center p-6 font-inter">
      <div className="w-full max-w-[440px] bg-pure-paper rounded-md border border-hairline p-8 flex flex-col items-center">
        <div className="w-full mb-8">
          <Link href="/" className="text-charcoal font-bold text-[14px] flex items-center gap-2 hover:opacity-70 transition-opacity">
            &larr; Back
          </Link>
        </div>
        
        <h1 className="text-[30px] font-bold text-charcoal mb-2 text-center">Log in</h1>
        <p className="text-[16px] text-ash text-center mb-8 font-normal">Scan the QR code with your Telegram app</p>

        {error && (
          <div className="w-full bg-charcoal text-pure-paper p-4 rounded-md mb-6 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[300px] w-full">
          {loading && !qrImageUrl && !passwordRequired ? (
            <div className="text-ash font-bold animate-pulse">Connecting...</div>
          ) : passwordRequired ? (
            <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-charcoal font-bold text-[14px]">Two-Step Verification Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-pure-paper border border-hairline rounded-md px-4 py-3 text-charcoal focus:outline-none focus:border-charcoal transition-colors font-normal"
                  placeholder="Enter your password"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-pulse text-charcoal rounded-full px-6 py-3 font-bold text-[16px] hover:opacity-90 transition-opacity"
              >
                Submit Password
              </button>
            </form>
          ) : qrImageUrl ? (
            <div className="border border-hairline rounded-md overflow-hidden bg-white p-2">
              <img src={qrImageUrl} alt="Telegram Login QR Code" className="w-[280px] h-[280px]" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
