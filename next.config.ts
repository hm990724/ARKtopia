import type { NextConfig } from 'next';
// Keep verification builds separate from an already running local game.
const nextConfig: NextConfig = {distDir:process.env.ARK_BUILD_QA==='1'?'.next-qa':'.next'};
export default nextConfig;
