import dotenv from "dotenv";
import fs from "fs";
import { execSync } from "child_process";
import { NextConfig } from "next";

// Function to detect the current Git branch
const getGitBranch = (): string => {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  } catch (error) {
    console.warn("⚠️ Could not determine Git branch, defaulting to 'dev'");
    return "dev"; // Default to development if branch detection fails
  }
};

// Map Git branches to environment files
const branch = getGitBranch();
console.log("CURRENT BRANCH", branch)
const envMap: Record<string, string> = {
  main: ".env.prod",
  dev: ".env.dev",
  staging: ".env.staging",
  uat: ".env.uat",
};

// Determine the correct `.env` file based on the branch
const envFile = envMap[branch] || ".env.dev"; // Defaults to `.env.dev`

// Load the selected environment file
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`✅ Loaded environment variables from ${envFile}`);
} else {
  console.warn(`⚠️ Environment file ${envFile} not found! Using defaults.`);
}

// Next.js Configuration
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  reactStrictMode: true,
};

export default nextConfig;