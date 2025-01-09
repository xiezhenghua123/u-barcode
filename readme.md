# u-barcode

uniapp条形码组件，利用jsbarcode改造

```powershell
pnpm run build
```

### API

**属性：**

| 属性        | 说明                          | 类型    | 默认值              |
| ----------- | ----------------------------- | ------- | ------------------- |
| show        | 是否展示输出                  | boolean | true                |
| cid         | 组件canvasId                  | string  | 'u-barcode-canvas'  |
| width       | 条形码宽度，同jsbarcode       | number  | 2                   |
| height      | 条形码高度，同jsbarcode       | number  | 100                 |
| unit        | 宽高单位                      | string  | 'px'（目前支持rpx） |
| val         | 条形码内容，同jsbarcode的text | string  | ''                  |
| outputImage | 是否生成base64图片            | boolean | false               |
| format      | 条形码格式，同jsbarcode       | string  | 'CODE128'           |
| options     | 其他参数，参照jsbarcode       | object  | {}                  |

**事件：**

| 事件名称 | 说明               | 回调参数         |
| -------- | ------------------ | ---------------- |
| result   | 获取base64图片数据 | (base64) => void |

**方法：**

| 方法名称                                    | 描述                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------- |
| makeCode(val: string, otherOptions: object) | 生成条形码（这里会覆盖props的里面的参数）                            |
| clearCode()                                 | 清空条形码                                                           |
| saveCode({fileName: string})                | 非H5端将条形码图片保存到系统相册，H5端下载图片（fileName适用于H5端） |

### 调试

```powershell
cd ./example
pnpm i
pnpm run dev:h5
```

### 构建

```
pnpm i
pnpm run build
```
