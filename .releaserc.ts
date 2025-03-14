export default {
 branches: ['master'], // 指定在哪个分支下要执行发布操作
 plugins: [
   '@semantic-release/commit-analyzer', // 解析 commit 信息，默认就是 Angular 规范
   '@semantic-release/release-notes-generator',
   [
     '@semantic-release/changelog',
     {
       changelogFile: 'changelog.md' // 把发布日志写入该文件
     }
   ],
   [
     '@semantic-release/npm',
     {
       npmPublish: false // 默认是 true，设置为 false 不会发布到 NPM
     }
   ],  // 发布到NPM
   [
    '@semantic-release/exec',
    {
      prepareCmd: 'pnpm run build', // 发布前执行的命令
    }
   ],
   [
    '@semantic-release/github',
    {
      assets: 'dist-zip' // 发布到 GitHub，发布的文件
    }
   ],
   [
     '@semantic-release/git',
     {
       assets: ['changelog.md', 'package.json'], // 前面说到日志记录和版本好是新增修改的，需要 push 回 Git 
       message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}' // 发布时的 commit 信息
     }
   ]
 ]
}
