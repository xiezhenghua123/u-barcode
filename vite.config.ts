import { defineConfig } from 'vite'
import commonJs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import dts from 'vite-plugin-dts'
import zipPack from 'vite-plugin-zip-pack'

// 从package.json中读取libName
import packageJson from './package.json'
import fs from 'fs'
import path from 'path'
import ts from 'typescript'
const libName = packageJson.name

// 修改src\u-barcode\package.json中的version、name、repository、author、license、keywords、description
const changePackage = () => {
  return {
    name: 'change-package',
    writeBundle() {
      const version = packageJson.version
      const repository = packageJson.repository
      const auth = packageJson.auth
      const license = packageJson.license
      const keywords = packageJson.keywords
      const description = packageJson.description
      const pathStr = path.resolve(__dirname, `src/${libName}/package.json`)
      let data: string
      try {
        data = fs.readFileSync(pathStr, 'utf-8')
        const json = JSON.parse(data)
        json.version = version
        json.name = libName
        json.id = libName
        json.displayName = libName
        json.repository = repository.url.replace('git+', '')
        json.auth = auth
        json.license = license
        json.keywords = keywords
        json.description = description
        fs.writeFileSync(pathStr, JSON.stringify(json, null, 2))
      } catch (e) {
        console.log(e)
      }
    }
  }
}

// 编译vue文件中的ts代码
const vueTsCompiler = (content: Buffer<ArrayBufferLike>) => {
  const code = content.toString()
  const scriptMatch = code.match(
    /<script lang=["']ts["'].*?>([\s\S]*?)<\/script>/
  )
  if (scriptMatch) {
    const tsCode = scriptMatch[1]

    // 使用 TypeScript 编译
    const result = ts.transpileModule(tsCode, {
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext
      }
    })

    const jsCode = result.outputText
    // 替换 Vue 文件中的 <script lang="ts"> 代码
    const newCode = code.replace(
      scriptMatch[0],
      `<script>\n${jsCode}\n</script>`
    ).replace(/\.ts/g, '.es.js')
    return newCode
  }
}

export default defineConfig({
  plugins: [
    commonJs(),
    copy({
      targets: [
        {
          src: `src/${libName}/components/${libName}/${libName}.vue`,
          dest: `dist/${libName}/components/${libName}`,
          transform: vueTsCompiler
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
    changePackage(),
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
