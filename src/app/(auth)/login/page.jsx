"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../../../store/hooks";
import { loginSuccess } from "../../../../store/slices/authSlice";
import { apiClient } from "../../../../lib/apiClient";
import { decryptPrivateKey, encryptPrivateKey, generateKeyPair } from "../../../../lib/crypto";
// 👇 Import the key generator

export default function LoginPage() {
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
      // ---------------------------------------------------------
      // STEP 1: LOGIN (Don't generate keys yet!)
      // ---------------------------------------------------------
      // We send JUST email/password first. We don't know if we need new keys yet.
      const res = await apiClient("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // ---------------------------------------------------------
      // STEP 2: HANDLE KEYS (Restore or Generate)
      // ---------------------------------------------------------
      let finalKeys = null;

      // CASE A: Server sent us a backup key (This fixes the Incognito issue!)
      if (data.user.encryptedPrivateKey && data.user.keySalt && data.user.keyIv) {
          console.log("🔐 Found backup on server. Restoring...");
          
          try {
              const secretKey = await decryptPrivateKey(
                  data.user.encryptedPrivateKey,
                  password, // Use the password user just typed
                  data.user.keySalt,
                  data.user.keyIv
              );
              
              if (!secretKey) throw new Error("Decryption returned null");

              finalKeys = {
                  publicKey: data.user.identityPublicKey,
                  secretKey: secretKey
              };
          } catch (decryptionErr) {
              console.error("Decryption failed:", decryptionErr);
              // Fallback: If password changed or data corrupted, we might HAVE to reset.
              // For now, let's just alert.
              setError("Could not restore encryption keys. Wrong password?");
              setLoading(false);
              return;
          }
      } 
      
      // CASE B: No backup on server (First time user or legacy user)
      else {
          console.log("🆕 No backup found. Generating NEW keys...");
          finalKeys = generateKeyPair();

          // We must upload this new key immediately so it doesn't happen again
          const encryptedData = await encryptPrivateKey(finalKeys.secretKey, password);
          
          // Background upload (don't await strictly if you want speed, but safer to await)
          await apiClient("/api/keys/upload", {
              method: "POST",
              body: JSON.stringify({
                  publicKey: finalKeys.publicKey,
                  encryptedPrivateKey: encryptedData.encryptedPrivateKey,
                  keySalt: encryptedData.keySalt,
                  keyIv: encryptedData.keyIv
              })
          });
      }

      // ---------------------------------------------------------
      // STEP 3: SAVE TO BROWSER & REDIRECT
      // ---------------------------------------------------------
      localStorage.setItem("chat_keys", JSON.stringify(finalKeys));

      dispatch(loginSuccess({ user: data.user, token: data.token }));
      router.push("/chat");

    } catch (err) {
      console.error(err);
      setError("Login error");
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-indigo-100 rounded-full">
            <i className="pi pi-lock text-2xl text-indigo-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>

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

              {/* Eye Toggle */}
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-indigo-600 font-medium hover:underline"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
