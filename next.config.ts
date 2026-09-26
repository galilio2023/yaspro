import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@react-three/drei",
      "framer-motion",
      "three",
      "gsap",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "yasproductions.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
      { protocol: "https", hostname: "f.vimeocdn.com" },
    ],
  },
};

export default nextConfig;
