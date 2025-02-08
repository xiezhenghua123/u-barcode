import { UBarcodeOptions } from 'jsbarcode/src/barcodes';
import { ComponentPublicInstance } from 'vue';
declare class UniBarcode {
    private componentContext;
    private ctx;
    private ctxId;
    private options;
    private encodeData;
    canvasImg?: string;
    constructor(componentContext: ComponentPublicInstance, ctxId: string, options: UBarcodeOptions);
    getCanvasWidthAndHeight(): {
        width: number;
        height: number;
    } | null;
    getImgPath(): string | undefined;
    clear(): void;
    private render;
    private prepare;
    private barcode;
    private text;
    private move;
    draw(): Promise<void>;
    toImgs(): Promise<string>;
    private calculateHeight;
    private fixEncodings;
    private fixMargin;
}
export default UniBarcode;
