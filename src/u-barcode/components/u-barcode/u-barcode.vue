<template xlang="wxml" minapp="mpvue">
  <view class="u-barcode">
    <!-- #ifndef MP-ALIPAY -->
    <canvas
      v-show="isShow"
      :class="[
        'u-barcode-canvas',
        {
          hide: !show,
        },
      ]"
      :canvas-id="cid"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    />
    <!-- #endif -->
    <!-- #ifdef MP-ALIPAY -->
    <canvas
      v-show="isShow"
      :id="cid"
      :width="canvasWidth"
      :height="canvasHeight"
      :class="[
        'u-barcode-canvas',
        {
          hide: !show,
        },
      ]"
    />
    <!-- #endif -->
  </view>
</template>

<script lang="ts">
import UniBarCode from "./u-barcode.ts";
import type { UBarcodeOptions }  from 'jsbarcode/src/barcodes'

let barcodeInstance: UniBarCode | null = null;

export default {
  name: "UBarcode",
  props: {
    show: {
      type: Boolean,
      default: true,
    },
    cid: {
      type: String,
      default: "u-barcode-canvas",
    },
    unit: {
      type: String,
      default: "px",
    },
    val: {
      type: String,
      required: true,
    },
    // 生成图片
    outputImage: {
      type: Boolean,
      default: true,
    },
    format: {
      type: String,
      default: "CODE128",
    },
    width: {
      type: Number,
      default: 2,
    },
    height: {
      type: Number,
      default: 100,
    },
    options: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {
      result: "",
      canvasWidth: 500,
      canvasHeight: 300,
      // 内部是否显示
      isShow: true,
    };
  },
  mounted() {
    this.makeCode(this.val, this.options);
  },
  methods: {
    async makeCode(val: string, otherOptions: UBarcodeOptions) {
      await this.$nextTick();
      let options: UBarcodeOptions = {},
        newOptions: UBarcodeOptions = this.options;
      // 合并参数
      if (otherOptions) {
        newOptions = otherOptions;
      }
      const outputImage = newOptions.outputImage || this.outputImage;
      options = Object.assign(newOptions, {
        text: val || this.val,
        format: newOptions.format || this.format,
        getImgPathCb: this._result,
        outputImage: outputImage,
        width: newOptions.width || this.width,
        height: newOptions.height || this.height,
        drawSuccessCb: () => {
          if(!outputImage) {
            this.isShow = this.show
          }
        },
      });
      if (this.unit == "rpx") {
        if (options.width) {
          // eslint-disable-next-line no-undef
          options.width = uni.rpx2px(options.width);
        }
        if (options.height) {
          // eslint-disable-next-line no-undef
          options.height = uni.rpx2px(options.height);
        }
        if (options.fontSize) {
          // eslint-disable-next-line no-undef
          options.fontSize = uni.rpx2px(options.fontSize);
        }
      }
      barcodeInstance = new UniBarCode(this, this.cid, options);
      const data = barcodeInstance.getCanvasWidthAndHeight();
      if(data) {
        this.canvasWidth = data.width;
        this.canvasHeight = data.height;
      }
    },
    clearCode() {
      this._result("");
      if(barcodeInstance) {
        barcodeInstance.clear();
        barcodeInstance = null;
      }
    },
    saveCode(params?: { fileName?: string }) {
      if (this.result != "") {
        // #ifndef H5
        // eslint-disable-next-line no-undef
        uni.saveImageToPhotosAlbum({
          filePath: this.result,
          success: function () {
            // eslint-disable-next-line no-undef
            uni.showToast({
              title: "条形码保存成功",
              icon: "success",
              duration: 2000,
            });
          },
        });
        // #endif
        // #ifdef H5
        const fileName = params && params.fileName;
        const a = document.createElement("a");
        a.href = this.result;
        a.download = fileName || `barcode_${new Date().getTime()}.png`;
        a.click();
        // #endif
      }
    },
    _result(res: string) {
      this.isShow = this.show;
      this.result = res;
      this.$emit("result", res);
    },
  },
};
</script>
<style scoped>
.u-barcode {
  position: relative;
}

.u-barcode-canvas.hide {
  position: fixed;
  top: -99999rpx;
  left: -99999rpx;
  z-index: -99999;
}
</style>
