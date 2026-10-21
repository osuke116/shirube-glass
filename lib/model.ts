export const KINDS=['メモ','気づき','制作物','資料'] as const;
export type Kind=typeof KINDS[number];
export type Note={id:string;title:string;body:string;kind:Kind;tags:string[];date:string;createdAt:string;updatedAt:string;starred:boolean;deleted:boolean;version:number;dirty:boolean;device:string};
export type Archive={id:string;title:string;body:string;date:string;format:string;category:string;path:string;url:string;basis:string;collection:string;starred:boolean;createdAt:string};
export function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date())}
export function norm(s:unknown){return String(s??'').normalize('NFKC').toLowerCase()}
export function validDate(s:unknown):s is string{return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s}
export function safeUrl(s:unknown){try{const u=new URL(String(s));return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
export function titleOf(body:string){return body.split('\n').find(s=>s.trim())?.replace(/^#+\s*/,'').trim().slice(0,90)||'無題の記録'}
export function parseTags(value:string){return [...new Set(value.split(/[\s,、#]+/).map(x=>x.trim()).filter(Boolean))].slice(0,12).map(x=>x.slice(0,40))}
export function normalizeNote(value:unknown):Note{
  if(!value||typeof value!=='object')throw Error('記録の形式を確認してください。');const r=value as Record<string,unknown>;
  if(typeof r.id!=='string'||!r.id||r.id.length>150||typeof r.body!=='string'||r.body.length>200000||!validDate(r.date))throw Error('記録のID・本文・日付を確認してください。');
  const createdAt=typeof r.createdAt==='string'&&!isNaN(Date.parse(r.createdAt))?r.createdAt:new Date().toISOString();
  return {id:r.id,title:String(r.title||titleOf(r.body)).slice(0,300),body:r.body,kind:KINDS.includes(r.kind as Kind)?r.kind as Kind:'メモ',tags:Array.isArray(r.tags)?r.tags.filter(x=>typeof x==='string').map(x=>x.slice(0,40)).slice(0,12):[],date:r.date,createdAt,updatedAt:typeof r.updatedAt==='string'&&!isNaN(Date.parse(r.updatedAt))?r.updatedAt:createdAt,starred:r.starred===true,deleted:r.deleted===true,version:Number.isInteger(r.version)&&Number(r.version)>=0?Number(r.version):0,dirty:r.dirty===true,device:typeof r.device==='string'?r.device.slice(0,100):'import'}
}
export function newNote(body:string,kind:Kind='メモ',date=today(),tags:string[]=[],device='browser'):Note{const t=new Date().toISOString();return normalizeNote({id:crypto.randomUUID(),title:titleOf(body),body,kind,date,tags,createdAt:t,updatedAt:t,starred:false,deleted:false,version:0,dirty:true,device})}
export function mergeRemote(local:Note[],remote:Note[]){const result=new Map(local.map(r=>[r.id,r]));for(const r of remote){const l=result.get(r.id);if(!l||!l.dirty)result.set(r.id,{...r,dirty:false})}return [...result.values()]}
export function conflictCopy(local:Note):Note{return {...local,id:crypto.randomUUID(),title:local.title+'（別の編集）',version:0,dirty:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),tags:[...new Set([...local.tags,'同期時の別案'])].slice(0,12)}}
export function importArchive(value:unknown):Archive{if(!value||typeof value!=='object')throw Error('資料の形式を確認してください。');const r=value as Record<string,unknown>;return {id:String(r.id||crypto.randomUUID()).slice(0,180),title:String(r.title||r.name||'資料').slice(0,300),body:String(r.text??r.body??'').slice(0,240000),date:validDate(r.date)?r.date:today(),format:String(r.ext||r.format||'MD').slice(0,20),category:String(r.category||'資料').slice(0,100),path:String(r.path||'').slice(0,4000),url:safeUrl(r.url),basis:[r.dateBasis||r.basis||'取り込み時の日付',r.dateNote,r.versionNote].filter(Boolean).join(' / ').slice(0,1000),collection:String(r.collection||'取り込んだ資料').slice(0,100),starred:r.starred===true,createdAt:String(r.created||r.createdAt||new Date().toISOString())}}
export function formatDate(date:string){return date.replaceAll('-','.')}
