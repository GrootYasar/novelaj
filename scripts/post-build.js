// post-build.js - Run this after the normal build to prepare for Vercel deployment
import shell from 'shelljs';
import path from 'path';
import fs from 'fs';

console.log('Running post-build script for Vercel deployment...');

// Copy static directory if it exists
const staticDir = path.join(__dirname, '..', '..', 'static');
if (fs.existsSync(staticDir)) {
  console.log('Copying static files to dist/static...');
  shell.mkdir('-p', 'dist/static');
  shell.cp('-R', 'static/*', 'dist/static/');
}

console.log('Post-build completed successfully!');
