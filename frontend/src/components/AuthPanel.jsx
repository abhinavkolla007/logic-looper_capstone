import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { signInWithTruecaller, signInAsGuest } from "../utils/auth";

export default function AuthPanel({ user, onChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [truecallerForm, setTruecallerForm] = useState({ phone: "", otp: "", otpSent: false });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const formattedUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Google User",
        email: firebaseUser.email,
        photo: firebaseUser.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
        provider: "google",
      };

      localStorage.setItem("logicUser", JSON.stringify(formattedUser));
      onChange(formattedUser);
      setShowAuthOptions(false);
    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTruecallerOTP = async () => {
    if (!truecallerForm.phone) {
      setError("Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // Simulate OTP send - in production, this would call backend
      setTruecallerForm(prev => ({ ...prev, otpSent: true }));
    } catch (err) {
      setError("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTruecallerVerify = async () => {
    if (!truecallerForm.otp) {
      setError("Please enter the OTP");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // For development: accept any 4-digit OTP
      if (!/^\d{4}$/.test(truecallerForm.otp)) {
        setError("OTP must be 4 digits");
        setIsLoading(false);
        return;
      }

      const formattedUser = {
        uid: `truecaller-${truecallerForm.phone}`,
        name: `Truecaller User`,
        email: null,
        phone: truecallerForm.phone,
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${truecallerForm.phone}`,
        provider: "truecaller",
      };

      localStorage.setItem("logicUser", JSON.stringify(formattedUser));
      onChange(formattedUser);
      setShowAuthOptions(false);
      setTruecallerForm({ phone: "", otp: "", otpSent: false });
    } catch (err) {
      setError("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      uid: `guest-${Date.now()}`,
      name: "Guest Player",
      email: null,
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
      provider: "guest",
    };
    localStorage.setItem("logicUser", JSON.stringify(guestUser));
    onChange(guestUser);
    setShowAuthOptions(false);
  };

  const handleLogout = async () => {
    try {
      if (user?.provider === "google") {
        await signOut(auth);
      }
      localStorage.removeItem("logicUser");
      onChange(null);
      setError("");
    } catch (err) {
      setError("Logout failed");
    }
  };

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-900/10 p-4 backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <img src={user.photo} alt="avatar" className="h-10 w-10 rounded-full border border-emerald-400/30" />
          <div>
            <p className="font-semibold text-emerald-100">{user.name}</p>
            <p className="text-xs text-emerald-300/70">
              {user.email || user.phone || "Guest Player"}
            </p>
          </div>
          <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
            {user.provider}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="rounded-lg bg-red-500/80 px-3 py-1 text-sm font-medium transition hover:bg-red-600"
        >
          Logout
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-3 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-200"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {showAuthOptions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-3 space-y-2 rounded-xl border border-slate-700 bg-slate-900 p-4"
          >
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Login with Google"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">or</span>
              </div>
            </div>

            {!truecallerForm.otpSent ? (
              <div className="space-y-2">
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={truecallerForm.phone}
                  onChange={(e) => setTruecallerForm({ ...truecallerForm, phone: e.target.value })}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring-1"
                />
                <button
                  onClick={handleTruecallerOTP}
                  disabled={isLoading || !truecallerForm.phone}
                  className="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Login with Truecaller"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Enter the 4-digit code sent to {truecallerForm.phone}</p>
                <input
                  type="text"
                  placeholder="0000"
                  maxLength="4"
                  value={truecallerForm.otp}
                  onChange={(e) => setTruecallerForm({ ...truecallerForm, otp: e.target.value })}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring-1"
                />
                <button
                  onClick={handleTruecallerVerify}
                  disabled={isLoading || !truecallerForm.otp}
                  className="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  onClick={() => setTruecallerForm({ phone: "", otp: "", otpSent: false })}
                  className="w-full rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
                >
                  Back
                </button>
              </div>
            )}

            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">or</span>
              </div>
            </div>

            <button
              onClick={handleGuestLogin}
              className="w-full rounded-lg border border-slate-600 px-4 py-2 font-medium transition hover:bg-slate-800"
            >
              Continue as Guest
            </button>

            <button
              onClick={() => setShowAuthOptions(false)}
              className="w-full rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!showAuthOptions && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAuthOptions(true)}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 font-medium text-white transition hover:from-blue-700 hover:to-purple-700"
        >
          Login to Play
        </motion.button>
      )}
    </div>
  );
}