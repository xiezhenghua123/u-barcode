import { defineConfig } from 'vite'
import commonJs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import dts from 'vite-plugin-dts'
import zipPack from "vite-plugin-zip-pack";

// 从package.json中读取libName
import packageJson from './package.json'
const libName = packageJson.name

export default defineConfig({
  plugins: [
    commonJs(),
    copy({
      targets: [
        {
          src: `src/${libName}/components/${libName}/${libName}.vue`,
          dest: `dist/${libName}/components/${libName}`,
          transform: (contents) => contents.toString().replace(/\.ts/g, '.es.js')
        },
        { src: 'changelog.md', dest: `dist/${libName}` },
        { src: 'LICENSE', dest: `dist/${libName}` },
        { src: `src/${libName}/package.json`, dest: `dist/${libName}` },
        { src: 'README.md', dest: `dist/${libName}` }
      ],
      hook: 'writeBundle'
    }),
    dts({
      insertTypesEntry: true,
      outDir: './types',
      include: [`src/${libName}/components/${libName}/**/*.ts`, 'types/*.d.ts']
    }),
    zipPack()
  ],
  build: {
    lib: {
      entry: [`src/${libName}/components/${libName}/${libName}.ts`],
      name: libName,
      fileName: (format, entryName) => `${entryName}.${format}.js`
    },
    emptyOutDir: true,
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          dir: `dist/${libName}/components/${libName}`,
          format: 'es'
        },
        {
          dir: `dist/${libName}`,
          format: 'cjs'
        }
      ]
    }
  }
})
