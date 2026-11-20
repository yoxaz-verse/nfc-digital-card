import { defineStore } from 'pinia'
import { supabase, backendEnabled } from '../lib/supabase'
import type { Profile, ProfileLink, PlatformType } from '../types'

const KEY='linkcard:profile:v1'
const defaultProfile=():Profile=>({id:crypto.randomUUID(),slug:'my-profile',goal:'creator',displayName:'Your name',title:'Creator & storyteller',bio:'A short introduction that tells people what you make and why it matters.',imageAlt:'Profile portrait',links:[],theme:{headerLayout:'classic',wallpaperType:'gradient',background:'#18152b',backgroundEnd:'#7137ff',textColor:'#ffffff',accent:'#caff39',font:'DM Sans',buttonColor:'#ffffff',buttonTextColor:'#171717',buttonStyle:'filled',buttonShape:'pill',buttonShadow:true},published:false,updatedAt:new Date().toISOString(),previousSlugs:[]})
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null') as Profile|null}catch{return null}}

export const useProfileStore=defineStore('profile',{state:()=>({profile:defaultProfile(),ready:false,saveState:'Saved' as 'Saved'|'Saving…'|'Save failed',userEmail:'',backendEnabled}),actions:{
  async restore(){this.profile={...defaultProfile(),...(read()||{})};this.ready=true;if(supabase){const {data:{session}}=await supabase.auth.getSession();this.userEmail=session?.user.email||'';if(session){const {data}=await supabase.from('profiles').select('*').eq('owner_id',session.user.id).maybeSingle();if(data)this.profile=fromRow(data)}}},
  async save(){this.saveState='Saving…';this.profile.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(this.profile));try{if(supabase){const {data:{user}}=await supabase.auth.getUser();if(user){this.profile.ownerId=user.id;const {error}=await supabase.from('profiles').upsert(toRow(this.profile));if(error)throw error;await supabase.from('profile_links').delete().eq('profile_id',this.profile.id);if(this.profile.links.length){const {error}=await supabase.from('profile_links').insert(this.profile.links.map(l=>({...l,profile_id:this.profile.id})));if(error)throw error}}}this.saveState='Saved'}catch(e){console.error(e);this.saveState='Save failed'}},
  addLink(platform:PlatformType,label:string,url=''){this.profile.links.push({id:crypto.randomUUID(),platform,label,url,enabled:true,order:this.profile.links.length});void this.save()},
  removeLink(id:string){this.profile.links=this.profile.links.filter(l=>l.id!==id).map((l,i)=>({...l,order:i}));void this.save()},
  moveLink(index:number,delta:number){const to=index+delta;if(to<0||to>=this.profile.links.length)return;const a=this.profile.links;[a[index],a[to]]=[a[to]!,a[index]!];a.forEach((l,i)=>l.order=i);void this.save()},
  async requestMagicLink(email:string){if(!supabase){this.userEmail=email;return {demo:true}}const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:`${location.origin}/auth/callback`}});if(error)throw error;return {demo:false}},
  async publish(){this.profile.published=true;this.profile.publishedAt=new Date().toISOString();await this.save()},
  async loadPublic(slug:string){if(supabase){const {data}=await supabase.from('profiles').select('*,profile_links(*)').eq('slug',slug).eq('published',true).maybeSingle();if(data)return fromRow({...data,links:data.profile_links})}const local=read();return local?.published&&(local.slug===slug||local.previousSlugs?.includes(slug))?local:null},
}})
function toRow(p:Profile){return {id:p.id,owner_id:p.ownerId,slug:p.slug,goal:p.goal,display_name:p.displayName,title:p.title,bio:p.bio,image_alt:p.imageAlt,image_url:p.imageUrl,theme:p.theme,published:p.published,updated_at:p.updatedAt,published_at:p.publishedAt,previous_slugs:p.previousSlugs}}
function fromRow(r:any):Profile{return {id:r.id,ownerId:r.owner_id,slug:r.slug,goal:r.goal,displayName:r.display_name,title:r.title||'',bio:r.bio||'',imageAlt:r.image_alt||'',imageUrl:r.image_url,theme:r.theme,links:(r.links||[]).sort((a:ProfileLink,b:ProfileLink)=>a.order-b.order),published:r.published,updatedAt:r.updated_at,publishedAt:r.published_at,previousSlugs:r.previous_slugs||[]}}

