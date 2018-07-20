import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';


export default {
  input: './src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'Authenticatornator',
  },
  plugins: [
    resolve({
      main: false,
    }),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          module: 'ES2015',
          outDir: './dist',
        },
      },
    }),
    uglify(),
  ]
}
