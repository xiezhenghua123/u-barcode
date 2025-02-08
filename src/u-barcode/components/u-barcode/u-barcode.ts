import Barcode from 'jsbarcode/src/barcodes'
import type {
  UBarcodeOptions,
  Encoding,
  BarcodeData
} from 'jsbarcode/src/barcodes'
import type { ComponentPublicInstance } from 'vue'

const defaultOptions: UBarcodeOptions = {
  format: 'CODE128',
  width: 2,
  height: 100,
  displayValue: true,
  font: 'monospace',
  textAlign: 'center',
  textPosition: 'bottom',
  textMargin: 2,
  fontSize: 20,
  background: '#ffffff',
  lineColor: '#000000',
  fontColor: '#000000',
  margin: 10,
  marginTop: undefined,
  marginBottom: undefined,
  marginLeft: undefined,
  marginRight: undefined,
  valid: () => {},
  outputImage: true
}

class UniBarcode {
  private componentContext: ComponentPublicInstance // 组件上下文
  private ctx: UniApp.CanvasContext // canvas上下文
  private ctxId: string // canvas id
  private options: UBarcodeOptions // 条形码配置
  private encodeData: BarcodeData | null // 条形码二进制数据
  public canvasImg?: string // canvas转图片后的路径
  constructor(
    componentContext: ComponentPublicInstance,
    ctxId: string,
    options: UBarcodeOptions
  ) {
    if (!componentContext) {
      throw new Error('ctx is required')
    }
    if (!ctxId) {
      throw new Error('ctxId is required')
    }
    if (!options.text) {
      throw new Error('options.text is required')
    }
    this.componentContext = componentContext
    this.ctxId = ctxId
    // 合并初始值
    this.options = { ...defaultOptions, ...options }
    // 修正边距
    this.fixMargin()
    this.ctx = uni.createCanvasContext(ctxId, componentContext)
    // 获取编码数据
    const barcode = new Barcode[this.options.format!](
      options.text,
      this.options
    )
    // 类型不支持
    if (!barcode.encode) throw new Error('current format is not supported')
    const codeData = barcode.encode()
    this.encodeData = this.fixEncodings(
      codeData,
      this.options as Required<UBarcodeOptions>
    )
    // 准备绘制
    this.render(this.options as Required<UBarcodeOptions>, this.encodeData)
  }
  getCanvasWidthAndHeight() {
    if (this.encodeData) {
      return {
        width: this.encodeData.width,
        height: this.encodeData.height
      }
    } else {
      return null
    }
  }
  getImgPath() {
    return this.canvasImg
  }
  clear() {
    if (this.ctx && this.encodeData) {
      this.ctx.clearRect(0, 0, this.encodeData.width, this.encodeData.height)
      this.ctx.draw(false)
      this.encodeData = null
      this.canvasImg = ''
    }
  }
  private async render(
    options: Required<UBarcodeOptions>,
    encodeData: BarcodeData
  ) {
    try {
      this.prepare(options, encodeData)
      encodeData.encodings.forEach(encoding => {
        this.barcode(options, encoding)
        this.text(options, encoding)
        this.move(encoding)
      })
      await this.draw()
    } catch (e) {
      console.error(e)
    }
  }
  private prepare(options: Required<UBarcodeOptions>, encoding: BarcodeData) {
    if (options.background) {
      this.ctx.setFillStyle(options.background)
      this.ctx.fillRect(0, 0, encoding.width, encoding.height)
    }
    this.ctx.translate(options.marginLeft, 0)
  }
  private barcode(options: Required<UBarcodeOptions>, encoding: Encoding) {
    const binary = encoding.data || ''
    let yFrom = 0
    if (options.textPosition == 'top') {
      yFrom += options.marginTop ?? 0
      yFrom += options.fontSize ?? 0
      yFrom += options.textMargin ?? 0
    } else {
      yFrom = options.marginTop ?? 0
    }
    // 绘制条码
    this.ctx.fillStyle = options.lineColor
    for (let b = 0; b < binary.length; b++) {
      const x = b * (options.width ?? 0) + (encoding.barcodePadding ?? 0)
      const height =
        (encoding.options && (encoding.options.height ?? false)) ||
        options.height
      if (binary[b] === '1') {
        this.ctx.fillRect(x, yFrom, options.width, height)
      } else if (binary[b]) {
        this.ctx.fillRect(x, yFrom, options.width, height * (binary[b] as unknown as number))
      }
    }
  }
  private text(options: Required<UBarcodeOptions>, encoding: Encoding) {
    if (options.displayValue) {
      let x = 0,
        y,
        align,
        size = options.fontSize
      if (options.textPosition == 'top') {
        y = options.marginTop + options.fontSize
      } else {
        y =
          options.height +
          options.textMargin +
          options.marginTop +
          options.fontSize
      }
      if (encoding.options) {
        if (encoding.options.textAlign != undefined) {
          align = encoding.options.textAlign
        }
        if (encoding.options.fontSize != undefined) {
          size = encoding.options.fontSize
        }
      } else {
        align = options.textAlign
        size = options.fontSize
      }
      this.ctx.setFontSize(size)
      if (align == 'left' || +(encoding.barcodePadding ?? false) > 0) {
        x = 0
        this.ctx.setTextAlign('left')
      } else if (align == 'right') {
        if (encoding.width) {
          x = encoding.width - 1
        }
        this.ctx.setTextAlign('right')
      } else {
        if (encoding.width) {
          x = encoding.width / 2
        }
        this.ctx.setTextAlign('center')
      }
      this.ctx.fillStyle = options.fontColor
      if (encoding.text) {
        this.ctx.fillText(encoding.text, x, y)
      }
    }
  }
  private move(encoding: Encoding) {
    if (encoding.width) {
      this.ctx.translate(encoding.width, 0)
    }
  }
  draw() {
    return new Promise<void>(resolve => {
      this.ctx.draw(false, async () => {
        if (
          this.options.drawSuccessCb &&
          typeof this.options.drawSuccessCb === 'function'
        ) {
          this.options.drawSuccessCb()
        }
        if (this.options.outputImage) {
          this.canvasImg = await this.toImgs()
          if (
            this.options.getImgPathCb &&
            typeof this.options.getImgPathCb === 'function'
          ) {
            this.options.getImgPathCb(this.canvasImg)
          }
        }
        resolve()
      })
    })
  }
  toImgs() {
    return new Promise<string>((resolve, reject) => {
      uni.canvasToTempFilePath(
        {
          width: this.encodeData?.width,
          height: this.encodeData?.height,
          destWidth: this.encodeData?.width,
          destHeight: this.encodeData?.height,
          canvasId: this.ctxId,
          fileType: 'png',
          success: function (res) {
            resolve(res.tempFilePath)
          },
          fail: function (res) {
            reject(res)
          }
        },
        this.componentContext
      )
    })
  }
  private calculateHeight(
    baseHeight: number,
    options: Required<UBarcodeOptions>,
    text: string
  ) {
    return (
      baseHeight +
      (options.displayValue && text.length > 0
        ? options.fontSize + options.textMargin
        : 0) +
      options.marginTop +
      options.marginBottom
    )
  }
  private fixEncodings(
    encoding: Encoding | Encoding[],
    options: Required<UBarcodeOptions>
  ) {
    let encodingArr = [],
      width = options.marginLeft + options.marginRight,
      height: number = 0

    if (!Array.isArray(encoding)) {
      encodingArr[0] = JSON.parse(JSON.stringify(encoding))
    } else {
      encodingArr = [...encoding]
    }

    encodingArr.forEach((_v, i) => {
      // 获取文本宽度
      const textWidth = this.ctx.measureText(encodingArr[i].text || '').width
      // 获取条形码宽度
      const barcodeWidth = encodingArr[i].data.length * options.width
      // 获取内边距
      let barcodePadding = 0

      if (options.displayValue && barcodeWidth < textWidth) {
        if (options.textAlign === 'center') {
          barcodePadding = Math.floor((textWidth - barcodeWidth) / 2)
        } else if (options.textAlign === 'left') {
          barcodePadding = 0
        } else if (options.textAlign === 'right') {
          barcodePadding = Math.floor(textWidth - barcodeWidth)
        }
      }

      // 混入encodingArr[i]
      encodingArr[i].barcodePadding = barcodePadding
      encodingArr[i].width = Math.ceil(Math.max(textWidth, barcodeWidth))
      width += encodingArr[i].width

      const text = encodingArr[i].text || ''
      if (encodingArr[i].options && (encodingArr[i].options.height ?? false)) {
        encodingArr[i].height = this.calculateHeight(
          encodingArr[i].options.height,
          options,
          text
        )
      } else {
        encodingArr[i].height = this.calculateHeight(
          options.height,
          options,
          text
        )
      }
      height = Math.max(height, encodingArr[i].height)
    })

    return { encodings: encodingArr, width, height }
  }
  private fixMargin() {
    this.options.marginTop =
      this.options.marginTop ??
      this.options.marginTop ??
      this.options.margin ??
      0
    this.options.marginBottom =
      this.options.marginBottom ??
      this.options.marginBottom ??
      this.options.margin ??
      0
    this.options.marginLeft =
      this.options.marginLeft ??
      this.options.marginLeft ??
      this.options.margin ??
      0
    this.options.marginRight =
      this.options.marginRight ??
      this.options.marginRight ??
      this.options.margin ??
      0
  }
}

export default UniBarcode
