interface RoleLoadingScreenProps {
  message?: string;
}

export default function RoleLoadingScreen({
  message = "Foydalanuvchi roli aniqlanmoqda...",
}: RoleLoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-6">
        {/* Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-primary"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-primary/30"></div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">{message}</h3>
          <p className="text-gray-500 text-sm">Iltimos, kuting...</p>
        </div>

        {/* Progress dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
