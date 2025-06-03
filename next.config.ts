
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'unibeth.edu.bo',
        port: '',
        pathname: '/documentos/**',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fvvi1-1.fna.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.baratz.es',
        port: '',
        pathname: '/wp-content/**',
      },
    ],
  },
};

export default nextConfig;
