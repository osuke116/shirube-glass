import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from '../../chatgpt-auth';
export const dynamic='force-dynamic';
export async function GET(){const u=await getChatGPTUser();return Response.json({user:u?{id:u.userId,name:u.fullName||'あなた'}:null,signIn:chatGPTSignInPath('/?welcome=1'),signOut:chatGPTSignOutPath('/')},{headers:{'Cache-Control':'no-store'}})}
