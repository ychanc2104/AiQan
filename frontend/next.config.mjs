/** @type {import('next').NextConfig} */
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'

const nextConfig = {
  output: 'export',
  basePath: isGitHubActions ? '/subspark' : '',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
