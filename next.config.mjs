/** @type {import('next').NextConfig} */
const fastifyUrl =
  process.env.FASTIFY_INTERNAL_URL ||
  process.env.FASTIFY_URL ||
  "http://127.0.0.1:4000";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${fastifyUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
