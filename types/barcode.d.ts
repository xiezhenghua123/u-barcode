declare module 'jsbarcode/src/barcodes' {
  import { Options } from 'jsbarcode/jsbarcode'

  export type UBarcodeOptions = JsBarcode.Options & {
    format?: BarcodeFormat
    fontColor?: string
    // 是否生成图片文件
    outputImage?: boolean
    getImgPathCb?: (path: string) => void
    // draw完成回调
    drawSuccessCb?: () => void
  }
  export type Encoding = {
    data?: string
    text?: string
    barcodePadding?: number
    options?: Options
    width?: number
    height?: number
  }

  export type BarcodeData = {
    encodings: Encoding[]
    width: number
    height: number
  }

  class Barcode {
    constructor(data: string, options: Options)
    encode?(): BarcodeData
    valid?(): boolean
  }
  const barcodes = {
    CODE39: Barcode,
    CODE128: Barcode,
    CODE128A: Barcode,
    CODE128B: Barcode,
    CODE128C: Barcode,
    EAN13: Barcode,
    EAN8: Barcode,
    EAN5: Barcode,
    EAN2: Barcode,
    UPC: Barcode,
    UPCE: Barcode,
    ITF14: Barcode,
    ITF: Barcode,
    MSI: Barcode,
    MSI10: Barcode,
    MSI11: Barcode,
    MSI1010: Barcode,
    MSI1110: Barcode,
    pharmacode: Barcode,
    codabar: Barcode,
    GenericBarcode: Barcode
  }
  export type BarcodeFormat = keyof typeof barcodes
  export default barcodes
}
