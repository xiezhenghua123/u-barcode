import * as chokidar from 'chokidar';
import type { EventName } from 'chokidar/handler';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * 组件热重载管理器
 */
class ComponentHotReloader {
  // 源组件路径
  private srcDir: string;
  // 目标路径
  private destDir: string;

  /**
   * 构造函数
   */
  constructor() {
    this.srcDir = path.resolve(__dirname, '../../src/u-barcode/components/u-barcode');
    this.destDir = path.resolve(__dirname, '../src/components/u-barcode');
    this.init();
  }

  /**
   * 初始化
   */
  private init(): void {
    console.log('开始监听组件变化:', this.srcDir);
    console.log('目标目录:', this.destDir);

    // 初始同步文件
    this.initialSync();
    
    // 设置监听
    this.setupWatcher();
  }

  /**
   * 初始文件同步
   */
  private initialSync(): void {
    console.log('执行初始同步...');
    try {
      fs.copySync(this.srcDir, this.destDir, { overwrite: true });
      console.log('初始同步完成');
    } catch (error) {
      console.error('初始同步失败:', error);
    }
  }

  /**
   * 复制单个文件
   * @param srcFile 源文件路径
   * @param srcBase 源基础路径
   * @param destBase 目标基础路径
   */
  private copyFile(srcFile: string, srcBase: string, destBase: string): void {
    const relativePath = path.relative(srcBase, srcFile);
    const destFile = path.join(destBase, relativePath);
    
    try {
      // 确保目标目录存在
      fs.ensureDirSync(path.dirname(destFile));
      // 复制文件
      fs.copySync(srcFile, destFile, { overwrite: true });
      console.log(`文件已同步: ${relativePath}`);
    } catch (error) {
      console.error(`复制文件失败 ${srcFile} -> ${destFile}:`, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 设置文件监听器
   */
  private setupWatcher(): void {
    chokidar.watch(this.srcDir, {
      persistent: true,
      ignoreInitial: true,
    }).on('all', (event: EventName, filepath: string) => {
      console.log(`组件文件变化: ${event} ${filepath}`);
      
      // 处理文件变化
      if (event === 'add' || event === 'change') {
        this.copyFile(filepath, this.srcDir, this.destDir);
      } else if (event === 'unlink') {
        // 处理文件删除
        const relativePath = path.relative(this.srcDir, filepath);
        const destFile = path.join(this.destDir, relativePath);
        if (fs.existsSync(destFile)) {
          fs.removeSync(destFile);
          console.log(`文件已删除: ${relativePath}`);
        }
      }
    });

    console.log('热更新监听已启动，按 Ctrl+C 停止');
  }
}

// 实例化并启动热重载监听
new ComponentHotReloader(); 