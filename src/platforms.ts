import type { PlatformType, ProfileGoal } from './types'
export interface Platform { id:PlatformType; name:string; color:string; placeholder:string; goals:ProfileGoal[] }
export const platforms:Platform[] = [
  ['instagram','Instagram','◎','#e1306c','https://instagram.com/you',['creator','business','personal']], ['whatsapp','WhatsApp','◉','#25d366','https://wa.me/919000000000',['business','personal']],
  ['tiktok','TikTok','♪','#111','https://tiktok.com/@you',['creator','personal']], ['youtube','YouTube','▶','#ff0033','https://youtube.com/@you',['creator','business']],
  ['website','Website','⌁','#151515','https://your-site.com',['creator','business','personal']], ['spotify','Spotify','≋','#1ed760','https://open.spotify.com/...',['creator']],
  ['threads','Threads','@','#111','https://threads.net/@you',['creator','personal']], ['facebook','Facebook','f','#1877f2','https://facebook.com/you',['business','personal']],
  ['x','X','𝕏','#111','https://x.com/you',['creator','business','personal']], ['soundcloud','SoundCloud','▰','#ff5500','https://soundcloud.com/you',['creator']],
  ['snapchat','Snapchat','♙','#fffc00','https://snapchat.com/add/you',['creator','personal']], ['pinterest','Pinterest','P','#e60023','https://pinterest.com/you',['creator','business']],
  ['patreon','Patreon','p','#ff424d','https://patreon.com/you',['creator']], ['twitch','Twitch','▣','#9146ff','https://twitch.tv/you',['creator']], ['applemusic','Apple Music','♫','#fa4564','https://music.apple.com/...',['creator']],
].map(([id,name,_icon,color,placeholder,goals])=>({id,name,color,placeholder,goals} as Platform))
export const platformById=(id:PlatformType)=>platforms.find(p=>p.id===id) ?? {id:'custom' as const,name:'Link',color:'#171717',placeholder:'https://',goals:['creator','business','personal'] as ProfileGoal[]}
export function normalizeUrl(value:string){const raw=value.trim();if(!raw)return '';try{return new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`).toString()}catch{return ''}}
