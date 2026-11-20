<script setup lang="ts">
import { onMounted, ref } from 'vue'
const props=defineProps<{src:string}>(); const emit=defineEmits<{done:[value:string];cancel:[]}>(); const canvas=ref<HTMLCanvasElement>(); const zoom=ref(1); const x=ref(50); const y=ref(50); let img=new Image()
onMounted(()=>{img.onload=draw;img.src=props.src}); function draw(){const c=canvas.value;if(!c||!img.width)return;const ctx=c.getContext('2d')!;ctx.clearRect(0,0,500,500);const base=Math.max(500/img.width,500/img.height)*zoom.value,w=img.width*base,h=img.height*base,left=(500-w)*(x.value/100),top=(500-h)*(y.value/100);ctx.drawImage(img,left,top,w,h)}
function finish(){emit('done',canvas.value!.toDataURL('image/jpeg',.9))}
</script>
<template><div class="modal-backdrop"><div class="crop-modal"><div class="modal-title"><div><span>Profile image</span><h2>Crop your photo</h2></div><button @click="emit('cancel')">×</button></div><canvas ref="canvas" width="500" height="500"></canvas><label>Zoom<input v-model.number="zoom" type="range" min="1" max="3" step=".02" @input="draw"></label><div class="crop-position"><label>Horizontal<input v-model.number="x" type="range" min="0" max="100" @input="draw"></label><label>Vertical<input v-model.number="y" type="range" min="0" max="100" @input="draw"></label></div><button class="primary-action" @click="finish">Use this crop</button></div></div></template>

