import { defineStore } from 'pinia'
import { get,set,del } from 'idb-keyval'
import { newProject } from '../defaults'
import type { CardProject,Face,CanvasSnapshot } from '../types'
import { getTemplate } from '../templates'
import { supabase } from '../lib/supabase'
import { effectiveCardDestination } from '../card-utils'

const LEGACY_KEY='card-studio:current:v1',COLLECTION_KEY='linkcard:cards:v1'
function migrate(saved:Partial<CardProject>):CardProject{const d=newProject();return {...d,...saved,version:3,fields:{...d.fields,...saved.fields},design:{...d.design,...saved.design},assets:{...d.assets,...saved.assets},qr:{...d.qr,...saved.qr},destinationMode:saved.destinationMode||'profile',nfcDestination:saved.nfcDestination||saved.qr?.destination||''}}

export const useProjectStore=defineStore('project',{state:()=>({project:newProject(),cards:[] as CardProject[],ready:false,saveState:'Saved' as 'Saved'|'Saving…'|'Save failed'}),actions:{
  async restore(id?:string){try{let cards=(await get<CardProject[]>(COLLECTION_KEY))?.map(migrate)||[];if(!cards.length){const legacy=await get<CardProject>(LEGACY_KEY);if(legacy){cards=[migrate(legacy)];await set(COLLECTION_KEY,cards)}}if(supabase){const {data:{user}}=await supabase.auth.getUser();if(user){const {data}=await supabase.from('cards').select('data').eq('owner_id',user.id).order('updated_at',{ascending:false});if(data?.length)cards=data.map(r=>migrate(r.data as CardProject))}}this.cards=cards;const found=id?cards.find(c=>c.id===id):cards[0];this.project=found||newProject()}finally{this.ready=true}},
  async listCards(){await this.restore();return this.cards},
  async create(){const card=newProject();this.cards.unshift(card);this.project=card;await this.persistCollection();return card},
  async duplicate(id:string){const source=this.cards.find(c=>c.id===id);if(!source)return;const copy=migrate(JSON.parse(JSON.stringify(source)));copy.id=crypto.randomUUID();copy.name=`${source.name} copy`;copy.updatedAt=new Date().toISOString();this.cards.unshift(copy);await this.persistCollection();return copy},
  async remove(id:string){this.cards=this.cards.filter(c=>c.id!==id);await this.persistCollection();if(supabase)await supabase.from('cards').delete().eq('id',id)},
  async save(){this.saveState='Saving…';this.project.updatedAt=new Date().toISOString();const i=this.cards.findIndex(c=>c.id===this.project.id);if(i>=0)this.cards[i]=this.project;else this.cards.unshift(this.project);try{await this.persistCollection();if(supabase){const {data:{user}}=await supabase.auth.getUser();if(user){this.project.ownerId=user.id;const {error}=await supabase.from('cards').upsert({id:this.project.id,owner_id:user.id,name:this.project.name,profile_id:this.project.profileId||null,data:JSON.parse(JSON.stringify(this.project)),updated_at:this.project.updatedAt});if(error)throw error}}this.saveState='Saved'}catch(e){console.error(e);this.saveState='Save failed'}},
  async persistCollection(){await set(COLLECTION_KEY,JSON.parse(JSON.stringify(this.cards)))},
  updateFace(face:Face,snapshot:CanvasSnapshot){this.project.canvases[face]=snapshot;void this.save()},
  async selectTemplate(id:string){const template=getTemplate(id),palette=template.palettes[0]!;this.project.templateId=id;this.project.paletteIndex=0;this.project.design.frontBackground=palette.front;this.project.design.backBackground=palette.back;this.project.fields.accent=palette.accent;this.project.canvases={};await this.save()},
  async attachProfile(profile:{id:string;slug:string;published:boolean}){this.project.profileId=profile.id;this.project.profileSlug=profile.slug;this.project.profilePublished=profile.published;this.project.destinationMode='profile';this.syncDestination();await this.save()},
  async detachProfile(){this.project.profileId=undefined;this.project.profileSlug=undefined;this.project.profilePublished=false;this.syncDestination();await this.save()},
  syncDestination(){const url=effectiveCardDestination(this.project,location.origin);this.project.nfcDestination=url;this.project.qr.destination=url},
  async uploadAsset(file:File){if(!supabase)return await fileToDataUrl(file);const {data:{user}}=await supabase.auth.getUser();if(!user)return await fileToDataUrl(file);const safe=file.name.replace(/[^a-z0-9._-]/gi,'-');const path=`${user.id}/${this.project.id}/${Date.now()}-${safe}`;const {error}=await supabase.storage.from('card-assets').upload(path,file,{contentType:file.type});if(error)throw error;const {data}=await supabase.storage.from('card-assets').createSignedUrl(path,60*60*24*365);return data?.signedUrl||''},
  async reset(){const fresh=newProject();fresh.id=this.project.id;this.project=fresh;await this.save()},
  async clearAll(){await del(COLLECTION_KEY);await del(LEGACY_KEY);this.cards=[];this.project=newProject()},
}})
function fileToDataUrl(file:File){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file)})}
