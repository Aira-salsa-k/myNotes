import React, { useState } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { Target, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

export const AuthFeature = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const { login, register, resetPassword, error, isLoading, clearError } =
    useAuthStore();

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
      // Error handled by store
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
                {error}
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
                <Loader2 size={20} className="animate-spin" />
              ) : isForgotPass ? (
                "Kirim Link Reset"
              ) : isLogin ? (
                "Masuk"
              ) : (
                "Daftar"
              )}
            </button>
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
