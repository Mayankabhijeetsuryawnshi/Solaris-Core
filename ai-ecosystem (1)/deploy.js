import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get target project name from arguments, env, wrangler.toml, or package.json
const args = process.argv.slice(2);
// Filter out standard flags to find the raw name or look for a specific name flag
let projectName = args.find(arg => !arg.startsWith('-'));

if (!projectName) {
  const envName = process.env.CLOUDFLARE_PROJECT_NAME;
  if (envName) {
    projectName = envName;
  } else {
    // Read from wrangler.toml or package.json
    try {
      const wranglerContent = fs.readFileSync(path.join(process.cwd(), 'wrangler.toml'), 'utf8');
      const nameMatch = wranglerContent.match(/name\s*=\s*"([^"]+)"/);
      if (nameMatch) {
        projectName = nameMatch[1];
      }
    } catch (e) {
      // ignore
    }
  }
}

if (!projectName) {
  try {
    const pkgContent = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    projectName = pkgContent.name;
  } catch (e) {
    projectName = "solaris-ai-ecosystem";
  }
}

// Clean project name to be a valid Cloudflare Pages subdomain name (lowercase, alphanumeric, dashes)
projectName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

console.log(`🚀 Preparing build and deployment to Cloudflare Pages...`);
console.log(`🔗 Target URL Preview: https://${projectName}.pages.dev`);

try {
  console.log(`\n[1/2] Compiling TypeScript & Vite Application...`);
  execSync('npm run build', { stdio: 'inherit' });

  console.log(`\n[2/2] Deploying static asset bundle to Cloudflare Pages...`);
  // Run wrangler pages deploy
  const deployCmd = `npx wrangler pages deploy dist --project-name=${projectName}`;
  console.log(`Executing: ${deployCmd}`);
  execSync(deployCmd, { stdio: 'inherit' });

  console.log(`\n✨ Deployment completed successfully!`);
} catch (error) {
  console.error(`\n❌ Deployment failed:`, error.message || error);
  process.exit(1);
}
