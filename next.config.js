/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Next.js 14 lint runner is incompatible with ESLint 9 (uses removed options).
    // Run `npx eslint .` separately instead.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
