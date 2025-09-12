import { useAuthStore } from "@/store/auth.store";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";

export default function Header() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-between px-8 rounded-xl border border-gray-200 mt-2 mx-2">
      <h1 className="text-2xl font-bold text-primary tracking-wide drop-shadow-sm">
        ISOCOM{" "}
        <span className="text-base font-normal text-gray-500 ml-2">
          Ishlab chiqarish tizimi
        </span>
      </h1>
      <div className="flex items-center gap-4">
        {/* <span className="text-gray-700 font-medium">Foydalanuvchi</span> */}
        <Button onClick={handleLogout} variant="outline">
          Chiqish <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
