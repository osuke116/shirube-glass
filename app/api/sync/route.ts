import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {normalizeNote} from '../../../lib/model';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(){const u=await getChatGPTUser();if(!u)return Response.json({error:'ログインしてください。'},{status:401,headers});if(!env.DB)return Response.json({error:'保存先の準備中です。記録は端末に残っています。'},{status:503,headers});const result=await env.DB.prepare('SELECT payload,version FROM shirube_notes WHERE user_id = ?').bind(u.userId).all<{payload:string;version:number}>();return Response.json({records:result.results.map(r=>({...JSON.parse(r.payload),version:r.version,dirty:false}))},{headers})}
export async function POST(request:Request){
 const u=await getChatGPTUser();if(!u)return Response.json({error:'ログインしてください。'},{status:401,headers});const origin=request.headers.get('Origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'このアプリから保存してください。'},{status:403,headers});if(!env.DB)return Response.json({error:'クラウド保存の準備中です。端末の記録は保持しています。'},{status:503,headers});
 try{const raw=await request.text();if(raw.length>1000000)return Response.json({error:'一度に送る記録が大きすぎます。'},{status:413,headers});const body=JSON.parse(raw);if(!Array.isArray(body.records)||body.records.length>30)throw Error('一度に同期できる記録は30件までです。');const records=body.records.map(normalizeNote);const saved=[];const conflicts=[];
 for(const record of records){const payload=JSON.stringify({...record,dirty:false,version:record.version+1});let changes=0;
 if(record.version===0){const result=await env.DB.prepare('INSERT OR IGNORE INTO shirube_notes (user_id,id,payload,version,updated_at) VALUES (?,?,?,1,?)').bind(u.userId,record.id,payload,record.updatedAt).run();changes=result.meta.changes}
 else{const result=await env.DB.prepare('UPDATE shirube_notes SET payload = ?, version = version + 1, updated_at = ? WHERE user_id = ? AND id = ? AND version = ?').bind(payload,record.updatedAt,u.userId,record.id,record.version).run();changes=result.meta.changes}
 if(changes)saved.push({...record,version:record.version+1,dirty:false});else{const remote=await env.DB.prepare('SELECT payload,version FROM shirube_notes WHERE user_id = ? AND id = ?').bind(u.userId,record.id).first<{payload:string;version:number}>();conflicts.push({id:record.id,remote:remote?{...JSON.parse(remote.payload),version:remote.version,dirty:false}:null})}}
 return Response.json({saved,conflicts},{headers})}catch(e){return Response.json({error:e instanceof Error?e.message:'記録を確認してください。'},{status:400,headers})}
}
