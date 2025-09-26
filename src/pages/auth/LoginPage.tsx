import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notifyError } from "@/lib/notification";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/ui/language-switcher";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, token, loading, error, roleDetermining } = useAuthStore();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Agar token mavjud bo'lsa, dashboardga yo'naltiramiz
  useEffect(() => {
    if (token && !roleDetermining) {
      navigate("/");
    }
  }, [token, roleDetermining, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
    if (error) {
      notifyError(error);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 relative overflow-hidden px-4 sm:px-6 lg:px-8 min-h-screen">
        {/* Language Switcher */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
          <LanguageSwitcher />
        </div>

        {/* Decorative shapes - hidden on mobile for better performance */}
        <div className="hidden sm:block absolute top-0 left-0 w-72 h-72 bg-purple-300 opacity-30 rounded-full blur-2xl -z-10" />
        <div className="hidden sm:block absolute bottom-0 right-0 w-96 h-96 bg-pink-300 opacity-20 rounded-full blur-3xl -z-10" />
        <div className="bg-white/90 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 flex flex-col items-center border border-gray-100 backdrop-blur-md mx-auto">
          {/* Logo/Icon */}
          {/* <div className="mb-4">
            <img src="/vite.svg" alt="ISOCOM Logo" className="h-12 w-12 mx-auto" />
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 tracking-tight mb-2">
            {t('common.appName')} {t('auth.login')}
          </h1>
          <p className="text-center text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base px-2">
            {t('auth.username')} va {t('auth.password')}ni kiriting
          </p>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 sm:gap-6">
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-sm text-gray-700 font-medium">
                {t('auth.username')}
              </label>
              <input
                type="text"
                id="username"
                className="w-full mt-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-primary transition shadow-sm bg-gray-50 text-base"
                placeholder={t('auth.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm text-gray-700 font-medium">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full mt-1 px-3 sm:px-4 py-2 pr-10 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-primary transition shadow-sm bg-gray-50 text-base"
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-6 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || roleDetermining}
              className="w-full bg-gradient-to-r from-primary/80 to-primary cursor-pointer text-white py-2 sm:py-3 rounded-xl font-bold text-base sm:text-lg shadow-md transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed touch-manipulation"
            >
              {loading ? t('common.loading') : roleDetermining ? "Rol aniqlanmoqda..." : t('auth.loginButton')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
