import dotenv from "dotenv";
import fs from "fs";
import { execSync } from "child_process";
import { NextConfig } from "next";

// Function to detect the current Git branch
const getGitBranch = (): string => {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    console.log(`✅ CURRENT BRANCH: ${branch}`);
    return branch;
  } catch (error) {
    console.warn("⚠️ Could not determine Git branch, defaulting to 'dev'");
    return "dev"; // Default to development if branch detection fails
  }
};

// Map Git branches to environment files
const branch = getGitBranch();
const envMap: Record<string, string> = {
  main: ".env.prod",
  dev: ".env.dev",
  staging: ".env.staging",
  uat: ".env.uat",
};

// Determine the correct `.env` file based on the branch
const envFile = envMap[branch] || ".env.dev"; // Defaults to `.env.dev`

console.log(`🔍 Using environment file: ${envFile}`);

// Load the selected environment file
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`✅ Loaded environment variables from ${envFile}`);
} else {
  console.warn(`⚠️ Environment file ${envFile} not found! Using defaults.`);
}

// Log all environment variables (SANITIZED)
console.log("🔹 Loaded Environment Variables:");
console.log({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

// Next.js Configuration
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  reactStrictMode: true,
  async headers() {
    console.log("✅ Setting CORS Headers...");

    return [
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Allow all origins (change in production)
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

console.log("✅ Next.js configuration loaded successfully!");

export default nextConfig;