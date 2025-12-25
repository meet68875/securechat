"use client";

export default function UserItem({ data, onClick, isActive }) {
  const user = data.user;
  const displayName = user.username || user.userusername || "Unknown User";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-4 transition-all duration-200 text-left outline-none ${
        isActive 
          ? "bg-indigo-50 border-r-4 border-r-indigo-600" 
          : "hover:bg-gray-50 active:bg-gray-100"
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-semibold shadow-sm ${
          isActive ? "bg-indigo-200 text-indigo-700" : "bg-gray-100 text-gray-600"
        }`}>
          {displayName[0].toUpperCase()}
        </div>
        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></div>
      </div>

      <div className="ml-4 flex-1 overflow-hidden">
        <div className="flex justify-between items-baseline">
          <p className={`font-semibold truncate ${isActive ? "text-indigo-900" : "text-gray-900"}`}>
            {displayName}
          </p>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {user.email}
        </p>
      </div>
    </button>
  );
}