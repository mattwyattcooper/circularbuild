import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const supabaseDomain = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const remotePatterns: RemotePattern[] = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
];

if (supabaseDomain) {
  remotePatterns.push({
    protocol: "https",
    hostname: supabaseDomain,
    pathname: "/storage/v1/object/public/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
