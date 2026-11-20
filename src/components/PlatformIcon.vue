<script setup lang="ts">
import { computed } from 'vue'
import { siApplemusic,siFacebook,siInstagram,siPatreon,siPinterest,siSnapchat,siSoundcloud,siSpotify,siThreads,siTiktok,siTwitch,siWhatsapp,siX,siYoutube } from 'simple-icons'
import type { SimpleIcon } from 'simple-icons'
import type { PlatformType } from '../types'

const props=withDefaults(defineProps<{platform:PlatformType;label?:string;decorative?:boolean}>(),{decorative:true})
const brandIcons:Partial<Record<PlatformType,SimpleIcon>>={instagram:siInstagram,whatsapp:siWhatsapp,tiktok:siTiktok,youtube:siYoutube,spotify:siSpotify,threads:siThreads,facebook:siFacebook,x:siX,soundcloud:siSoundcloud,snapchat:siSnapchat,pinterest:siPinterest,patreon:siPatreon,twitch:siTwitch,applemusic:siApplemusic}
const icon=computed(()=>brandIcons[props.platform])
const accessibleLabel=computed(()=>props.label||icon.value?.title||'Link')
</script>
<template><svg viewBox="0 0 24 24" fill="currentColor" focusable="false" :aria-hidden="decorative?'true':undefined" :aria-label="decorative?undefined:accessibleLabel" :role="decorative?undefined:'img'"><path v-if="icon" :d="icon.path"/><path v-else d="M10.59 13.41a2 2 0 0 0 2.82 0L17 9.82A2 2 0 0 0 14.18 7l-1.12 1.12-1.41-1.42 1.12-1.11a4 4 0 1 1 5.66 5.66l-3.59 3.58a4 4 0 0 1-5.66 0l-.59-.58L10 12.83l.59.58Zm2.82-2.82-.59-.58a4 4 0 0 0-5.66 0l-3.59 3.58a4 4 0 1 0 5.66 5.66l1.12-1.11-1.41-1.42-1.12 1.12A2 2 0 0 1 5 15l3.59-3.59a2 2 0 0 1 2.82 0l.59.58 1.41-1.4Z"/></svg></template>
