"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../../../store/hooks";
import { loginSuccess } from "../../../../store/slices/authSlice";
import { apiClient } from "../../../../lib/apiClient";
import { encryptPrivateKey, generateKeyPair } from "../../../../lib/crypto";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Generate Raw Keys (for local use)
      const keys = generateKeyPair();
      
      // 2. Encrypt Private Key (for server backup)
      // This uses the user's password to lock the private key
      const encryptedData = await encryptPrivateKey(keys.secretKey, password);

      // 3. Store RAW keys in LocalStorage (so they can chat immediately)
      localStorage.setItem("chat_keys", JSON.stringify(keys));

      // 4. Send Registration Request with BACKUP (Encrypted) keys
      const res = await apiClient("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ 
            email, 
            password, 
            publicKey: keys.publicKey,
            // Send the encrypted blob
            encryptedPrivateKey: encryptedData.encryptedPrivateKey,
            keySalt: encryptedData.keySalt,
            keyIv: encryptedData.keyIv
        }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(loginSuccess({ user: data.user, token: data.token }));
        router.push("/chat");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-cente px-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-indigo-100 rounded-full">
            <i className="pi pi-user-plus text-2xl text-indigo-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            Create Account
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Join the secure encrypted chat
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg 
                         shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
            />
          </div>

          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg shadow-sm
                 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i
                className={`pi ${showPassword ? "pi-eye" : "pi-eye-slash"}`}
              ></i>
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg 
                       font-semibold hover:bg-indigo-700 transition duration-200 
                       disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-indigo-600 font-medium hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
