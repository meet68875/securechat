/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // 👈 ADD THIS LINE
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
