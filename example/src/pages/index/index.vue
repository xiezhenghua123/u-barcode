<template>
 <view class="content">
  <u-barcode ref="BarcodeRef" :cid="barcodeId" @result="getImgSrc" :val="barcodeValue"></u-barcode>
  <image :src="barcodeSrc"  mode="aspectFit"></image>
  <button @click="changeBarCode">切换条形码</button>
  <button @click="clearBarCode">删除条形码</button>
  <button @click="saveCode">保存条形码</button>
 </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import uBarcode from "../../../../src/u-barcode/components/u-barcode/u-barcode.vue";

const barcodeId = ref("barcode");
const barcodeValue = ref("");
const BarcodeRef = ref<typeof uBarcode | null>(null);
const barcodeSrc = ref("");
const getImgSrc = (src: string) => {
 barcodeSrc.value = src;
};
const generateRandomBarcodeValue = (length: number) => {
 const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
 let result = "";
 for (let i = 0; i < length; i++) {
  result += characters.charAt(Math.floor(Math.random() * characters.length));
 }
 return result;
};
const changeBarCode = () => {
 barcodeValue.value = generateRandomBarcodeValue(8);
 BarcodeRef?.value?.makeCode();
};
const clearBarCode = () => {
 BarcodeRef?.value?.clearCode();
};
const saveCode = () => {
 BarcodeRef?.value?.saveCode();
};
onMounted(() => {
 changeBarCode();
});
</script>

<style scoped>
.content {
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
}
</style>