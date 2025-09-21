import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notifyError } from "@/lib/notification";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, token, loading, error, roleDetermining } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 opacity-30 rounded-full blur-2xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 opacity-20 rounded-full blur-3xl -z-10" />
        <div className="bg-white/90 w-full max-w-md rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-gray-100 backdrop-blur-md">
          {/* Logo/Icon */}
          {/* <div className="mb-4">
            <img src="/vite.svg" alt="ISOCOM Logo" className="h-12 w-12 mx-auto" />
          </div> */}
          <h1 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight mb-2">
            ISOCOM tizimiga kirish
          </h1>
          <p className="text-center text-gray-500 mb-8 text-base">
            Login va parolingizni kiriting
          </p>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-sm text-gray-700 font-medium">
                Login
              </label>
              <input
                type="text"
                id="username"
                className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-primary transition shadow-sm bg-gray-50"
                placeholder="Ishchi login..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm text-gray-700 font-medium">
                Parol
              </label>
              <input
                type="password"
                id="password"
                className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-primary transition shadow-sm bg-gray-50"
                placeholder="Parolingiz..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || roleDetermining}
              className="w-full bg-gradient-to-r from-primary/80 to-primary cursor-pointer text-white py-3 rounded-xl font-bold text-lg shadow-md transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Kirish..." : roleDetermining ? "Rol aniqlanmoqda..." : "Kirish"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
