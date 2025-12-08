// src/app/(auth)/layout.js
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}