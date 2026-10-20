/** @type {import('next').NextConfig} */
const githubPages = process.env.GITHUB_PAGES === "1";

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: githubPages ? "export" : undefined,
  basePath: githubPages ? "/terragrid-atlas" : undefined,
  trailingSlash: githubPages,
  images: {
    unoptimized: githubPages,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com"
      }
    ]
  }
};

export default nextConfig;
