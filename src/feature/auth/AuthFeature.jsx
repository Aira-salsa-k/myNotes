import React, { useState } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { Target, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { LoadingState } from "../bookshelf/components/LoadingState";

export const AuthFeature = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const { login, register, resetPassword, error, isLoading, clearError } =
    useAuthStore();

  const getFriendlyErrorMessage = (err) => {
    if (!err) return "";
    if (err.includes("auth/invalid-credential") || err.includes("auth/wrong-password") || err.includes("auth/user-not-found")) {
      return "Email atau password yang Anda masukkan salah. Silakan coba lagi.";
    }
    if (err.includes("auth/invalid-email")) {
      return "Format email tidak valid. Pastikan penulisan email benar.";
    }
    if (err.includes("auth/email-already-in-use")) {
      return "Email ini sudah terdaftar. Silakan gunakan email lain atau login.";
    }
    if (err.includes("auth/weak-password")) {
      return "Password terlalu pendek. Gunakan minimal 6 karakter.";
    }
    if (err.includes("auth/too-many-requests")) {
      return "Terlalu banyak percobaan gagal. Akun diblokir sementara, silakan coba lagi nanti.";
    }
    return "Terjadi kesalahan. Silakan periksa koneksi internet Anda atau coba lagi.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setMessage("");

    try {
      if (isForgotPass) {
        await resetPassword(email);
        setMessage("Link reset password telah dikirim ke email Anda.");
      } else if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      // Error is caught by store, form state (email/password) stays as is
    }
  };

  const toggleMode = (mode) => {
    clearError();
    setMessage("");
    if (mode === "forgot") {
      setIsForgotPass(true);
    } else {
      setIsForgotPass(false);
      setIsLogin(mode === "login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {isLoading && <LoadingState fullScreen message="Memproses Autentikasi" />}
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-lime-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-lime-300/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Target
            className="mx-auto text-lime-300 mb-4 animate-pulse"
            size={48}
          />
          <h1 className="text-3xl font-black text-white">Goal Planner</h1>
          <p className="text-gray-400 text-sm mt-2">
            {isForgotPass
              ? "Reset Password"
              : isLogin
                ? "Welcome back! Login to continue."
                : "Create an account to start planning."}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error / Success Messages */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {getFriendlyErrorMessage(error)}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-300 text-sm">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all font-sans"
                  placeholder="anda@email.com"
                />
              </div>
            </div>

            {!isForgotPass && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-white/5 rounded-xl pl-11 pr-12 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all font-sans"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-lime-300 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-lime-200 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                "Memproses..."
              ) : isForgotPass ? (
                "Kirim Link Reset"
              ) : isLogin ? (
                "Masuk"
              ) : (
                "Daftar"
              )}
            </button>

            {!isForgotPass && (
              <>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">Atau</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    clearError();
                    setMessage("");
                    try {
                      await useAuthStore.getState().loginWithGoogle();
                    } catch (err) {
                      // Error handled by store
                    }
                  }}
                  disabled={isLoading}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Lanjutkan dengan Google
                </button>
              </>
            )}
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 flex flex-col gap-2">
            {isForgotPass ? (
              <button
                onClick={() => toggleMode("login")}
                className="hover:text-lime-300 transition-colors"
              >
                Kembali ke Login
              </button>
            ) : (
              <>
                <button
                  onClick={() => toggleMode("forgot")}
                  className="hover:text-lime-300 transition-colors"
                >
                  Lupa Password?
                </button>
                <div>
                  {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
                  <button
                    onClick={() => toggleMode(isLogin ? "register" : "login")}
                    className="text-lime-300 font-bold hover:underline"
                  >
                    {isLogin ? "Daftar" : "Masuk"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
