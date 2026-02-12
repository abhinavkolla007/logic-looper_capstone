import { useState } from "react";
import { logOut, signInAsGuest, signInWithGoogle, signInWithTruecaller } from "../utils/auth";
import { saveStoredUser } from "../utils/session";

export default function AuthPanel({ user, onChange }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (runner) => {
    setLoading(true);
    setError("");
    try {
      const nextUser = await runner();
      saveStoredUser(nextUser);
      onChange(nextUser);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    saveStoredUser(null);
    onChange(null);
  };

  if (user) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-600/10 p-4 text-sm">
        <p className="font-medium text-emerald-200">Signed in as {user.displayName}</p>
        <p className="text-emerald-100/80">Provider: {user.provider}</p>
        <button type="button" onClick={handleLogout} className="mt-2 rounded-md border border-emerald-300/50 px-3 py-1 text-xs">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
      <p className="text-sm font-semibold">Authentication</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleAuth(() => Promise.resolve(signInAsGuest()))}
          disabled={loading}
          className="rounded-md border border-slate-500 px-3 py-1 text-xs"
        >
          Continue as Guest
        </button>
        <button
          type="button"
          onClick={() => handleAuth(signInWithGoogle)}
          disabled={loading}
          className="rounded-md bg-cyan-500 px-3 py-1 text-xs font-medium text-slate-900"
        >
          Sign in with Google
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Truecaller phone"
          className="rounded-md border border-slate-600 bg-slate-950 px-3 py-1 text-xs"
        />
        <input
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          placeholder="Dev OTP"
          className="rounded-md border border-slate-600 bg-slate-950 px-3 py-1 text-xs"
        />
        <button
          type="button"
          disabled={loading || !phone || !otp}
          onClick={() => handleAuth(() => signInWithTruecaller(phone, otp))}
          className="rounded-md border border-violet-400/40 px-3 py-1 text-xs"
        >
          Verify Truecaller (Dev)
        </button>
      </div>
      <p className="text-[11px] text-slate-400">Use OTP 123456 in local/dev. Replace with official Truecaller Verification SDK in production.</p>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
