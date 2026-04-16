/** @type {import('next').NextConfig} */
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'

const deployEnv = process.env.DEPLOY_ENV ?? 'production'
const basePaths = {
  production: '/AiQan',
  staging: '/AiQan/staging',
  canary: '/AiQan/canary',
}

const nextConfig = {
  output: 'export',
  basePath: isGitHubActions ? (basePaths[deployEnv] ?? '/AiQan') : '',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
