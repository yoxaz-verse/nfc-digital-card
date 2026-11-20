<script setup lang="ts">
import { computed } from 'vue'; import type { Profile } from '../types'; import { platformById } from '../platforms'
const props=defineProps<{profile:Profile; interactive?:boolean}>()
const bg=computed(()=>{const t=props.profile.theme;if(t.wallpaperType==='image'&&t.wallpaperImage)return `url(${t.wallpaperImage}) center/cover`;if(t.wallpaperType==='gradient')return `linear-gradient(145deg,${t.background},${t.backgroundEnd})`;return t.background})
</script>
<template><div class="profile-page" :style="{background:bg,color:profile.theme.textColor,fontFamily:profile.theme.font}">
  <div class="profile-head" :class="`head-${profile.theme.headerLayout}`">
    <div v-if="profile.imageUrl" class="avatar"><img :src="profile.imageUrl" :alt="profile.imageAlt"></div><div v-else class="avatar avatar-empty">{{profile.displayName.slice(0,1)}}</div>
    <h1>{{profile.displayName}}</h1><h2>{{profile.title}}</h2><p>{{profile.bio}}</p>
  </div>
  <div class="profile-links"><a v-for="link in profile.links.filter(l=>l.enabled&&l.url)" :key="link.id" :href="interactive?link.url:undefined" :target="interactive?'_blank':undefined" rel="noopener" :class="[`btn-${profile.theme.buttonShape}`,`style-${profile.theme.buttonStyle}`,{shadow:profile.theme.buttonShadow}]" :style="{'--button':profile.theme.buttonColor,'--buttonText':profile.theme.buttonTextColor}"><i :style="{background:platformById(link.platform).color}">{{platformById(link.platform).icon}}</i><span>{{link.label}}</span><b>↗</b></a></div>
  <footer>Made with <strong>LinkCard</strong></footer>
</div></template>
