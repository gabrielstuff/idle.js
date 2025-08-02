import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  outDir: 'dist',
  format: ['esm', 'cjs', 'umd'],
  globalName: 'idleJs',
  dts: true,
  minify: false,
  outExtension({ format }) {
    if (format === 'esm') {
      return { js: '.mjs' }
    }
    return { js: '.js' }
  },
  esbuild: {
    target: 'es2018'
  }
})
