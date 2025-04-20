// build.js
import shell from 'shelljs';
import path from 'path';
import fs from 'fs';

// Create dist directory if it doesn't exist
shell.mkdir('-p', 'dist');
shell.mkdir('-p', 'dist/client');

// Run the normal build process
console.log('Building client and server...');
const viteResult = shell.exec('vite build');
if (viteResult.code !== 0) {
  console.error('Error building client with Vite');
  process.exit(1);
}

const esbuildResult = shell.exec('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
if (esbuildResult.code !== 0) {
  console.error('Error building server with esbuild');
  process.exit(1);
}

// Copy static directory if it exists
const staticDir = path.join(process.cwd(), 'static');
if (fs.existsSync(staticDir)) {
  console.log('Copying static files to dist/static...');
  shell.mkdir('-p', 'dist/static');
  shell.cp('-R', 'static/*', 'dist/static/');
}

console.log('Build completed successfully!');