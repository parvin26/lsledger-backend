/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  async redirects() {
    return [
      { source: '/verify/:public_id', destination: '/record/:public_id', permanent: true },
    ]
  },
}

module.exports = nextConfig
