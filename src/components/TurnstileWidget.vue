<script setup lang="ts">
import { onMounted,ref } from 'vue'
const emit=defineEmits<{token:[value:string]}>();const mount=ref<HTMLElement>();const siteKey=import.meta.env.VITE_TURNSTILE_SITE_KEY as string|undefined
declare global{interface Window{turnstile?:{render:(el:HTMLElement,options:Record<string,unknown>)=>string}}}
onMounted(()=>{if(!siteKey){emit('token','demo');return}const render=()=>window.turnstile?.render(mount.value!,{sitekey:siteKey,theme:'auto',callback:(value:string)=>emit('token',value),'expired-callback':()=>emit('token','')});if(window.turnstile){render();return}const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=render;document.head.appendChild(script)})
</script>
<template><div v-if="siteKey" ref="mount" class="turnstile"></div></template>
