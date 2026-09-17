import { getDatabase } from '@netlify/database';
const json=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(body)});
const num=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;

export async function findAnalogues(db,{symbol,score,momentum5,momentum20,relativeStrength,realizedVolatility,limit=8}){
 const {rows}=await db.pool.query(`
 select id,symbol,provider_time,ingested_at,evidence_score,action,regime,features,
   (abs(coalesce(evidence_score,50)-$2)/20.0
    + abs(coalesce((features->>'momentum5')::numeric,0)-$3)/0.01
    + abs(coalesce((features->>'momentum20')::numeric,0)-$4)/0.02
    + abs(coalesce((features->>'relativeStrength')::numeric,0)-$5)/0.02
    + abs(coalesce((features->>'realizedVolatility')::numeric,0)-$6)/0.02) as distance
 from trading_lab.market_observations
 where symbol=$1 and provider_time < now() - interval '1 minute'
 order by distance asc, provider_time desc limit $7`,[symbol,num(score,50),num(momentum5),num(momentum20),num(relativeStrength),num(realizedVolatility),Math.min(20,Math.max(1,num(limit,8)))]);
 return rows;
}

export async function handler(event){if(event.httpMethod&&event.httpMethod!=='GET')return json(405,{ok:false,message:'GET required.'});const q=event.queryStringParameters||{};if(!q.symbol)return json(400,{ok:false,message:'symbol required.'});try{const db=getDatabase(),matches=await findAnalogues(db,{symbol:String(q.symbol).toUpperCase(),score:q.score,momentum5:q.momentum5,momentum20:q.momentum20,relativeStrength:q.relativeStrength,realizedVolatility:q.realizedVolatility,limit:q.limit});return json(200,{ok:true,target:'netlify-database',ordersEnabled:false,symbol:String(q.symbol).toUpperCase(),matches,checkedAt:new Date().toISOString()})}catch(error){console.error('Analogue query failed:',error?.message||error);return json(500,{ok:false,ordersEnabled:false,message:'Historical analogue query failed.'})}}
