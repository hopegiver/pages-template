import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const projectName = packageJson.name;

const isWatch = process.argv.includes('--watch');

// ESM build configuration
const esmConfig = {
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'esm',
  outfile: `dist/${projectName}.esm.js`,
  minify: true,
  sourcemap: true,
  target: ['es2020'],
};

// Minified build configuration (traditional JavaScript loading)
const minConfig = {
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'iife',
  outfile: `dist/${projectName}.min.js`,
  minify: true,
  sourcemap: true,
  target: ['es2015'], // ES5+ for better compatibility
  globalName: projectName.replace(/-/g, '_'),
};

async function build() {
  try {
    console.log('Building ESM version...');
    await esbuild.build(esmConfig);
    console.log('✓ ESM build complete');

    console.log('Building minified version...');
    await esbuild.build(minConfig);
    console.log('✓ Minified build complete');

    console.log(`\nOutput files:`);
    console.log(`  - dist/${projectName}.esm.js`);
    console.log(`  - dist/${projectName}.esm.js.map`);
    console.log(`  - dist/${projectName}.min.js`);
    console.log(`  - dist/${projectName}.min.js.map`);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

async function watch() {
  console.log('Watching for changes...\n');

  const esmContext = await esbuild.context(esmConfig);
  const minContext = await esbuild.context(minConfig);

  await esmContext.watch();
  await minContext.watch();

  console.log('Watch mode active. Press Ctrl+C to stop.');
}

if (isWatch) {
  watch();
} else {
  build();
}
