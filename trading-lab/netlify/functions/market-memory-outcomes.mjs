import { getDatabase } from '@netlify/database';
const json=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(body)});
export async function readOutcomes(db,{symbol,limit=250}){const {rows}=await db.pool.query(`
 select o.id,o.symbol,o.provider_time,o.price,o.evidence_score,o.action,o.regime,o.features,
  f5.provider_time as t5,f5.price as p5,
  f15.provider_time as t15,f15.price as p15,
  f30.provider_time as t30,f30.price as p30,
  f60.provider_time as t60,f60.price as p60
 from trading_lab.market_observations o
 left join lateral (select provider_time,price from trading_lab.market_observations x where x.symbol=o.symbol and x.provider_time>=o.provider_time+interval '5 minutes' order by x.provider_time limit 1) f5 on true
 left join lateral (select provider_time,price from trading_lab.market_observations x where x.symbol=o.symbol and x.provider_time>=o.provider_time+interval '15 minutes' order by x.provider_time limit 1) f15 on true
 left join lateral (select provider_time,price from trading_lab.market_observations x where x.symbol=o.symbol and x.provider_time>=o.provider_time+interval '30 minutes' order by x.provider_time limit 1) f30 on true
 left join lateral (select provider_time,price from trading_lab.market_observations x where x.symbol=o.symbol and x.provider_time>=o.provider_time+interval '60 minutes' order by x.provider_time limit 1) f60 on true
 where o.symbol=$1 order by o.provider_time desc limit $2`,[symbol,Math.min(1000,Math.max(1,Number(limit)||250))]);return rows.map(r=>({...r,outcomes:{'5m':r.p5?{providerTime:r.t5,price:Number(r.p5),returnPct:(Number(r.p5)-Number(r.price))/Number(r.price)}:null,'15m':r.p15?{providerTime:r.t15,price:Number(r.p15),returnPct:(Number(r.p15)-Number(r.price))/Number(r.price)}:null,'30m':r.p30?{providerTime:r.t30,price:Number(r.p30),returnPct:(Number(r.p30)-Number(r.price))/Number(r.price)}:null,'60m':r.p60?{providerTime:r.t60,price:Number(r.p60),returnPct:(Number(r.p60)-Number(r.price))/Number(r.price)}:null}}))}
export async function handler(event){if(event.httpMethod&&event.httpMethod!=='GET')return json(405,{ok:false,message:'GET required.'});const q=event.queryStringParameters||{},symbol=String(q.symbol||'').toUpperCase();if(!symbol)return json(400,{ok:false,message:'symbol required.'});try{const rows=await readOutcomes(getDatabase(),{symbol,limit:q.limit});return json(200,{ok:true,symbol,rows,ordersEnabled:false,method:'forward timestamp joins; no future fields used in source observation',checkedAt:new Date().toISOString()})}catch(error){console.error('Outcome query failed:',error?.message||error);return json(500,{ok:false,ordersEnabled:false,message:'Forward outcome query failed.'})}}
