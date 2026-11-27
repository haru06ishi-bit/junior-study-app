// Pages Functions（_middleware.js・api/explain.js）と _routes.json の単体テスト。実際の Workers AI は呼ばない（モック）。
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mw=await import(pathToFileURL(path.join(root,'functions/_middleware.js')).href);
const ex=await import(pathToFileURL(path.join(root,'functions/api/explain.js')).href);
let n=0;const t=async(name,fn)=>{try{await fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
// ---- middleware ----
for(const p of['/README.md','/CLAUDE.md','/docs/HANDOVER_CODEX.md','/scripts/validate_questions.py','/scripts/english_explanations_v0474_keys.json','/wrangler.toml','/functions/api/explain.js','/candidates.json','/.gitignore','/.github/workflows/question-quality.yml','/_routes.json','/_headers','/README.MD','/docs%2FX.md','/%2e%2e/README.md','//scripts//x.py','/x/.env','/bad%E0%A4%A','/transfer/0001.patch'])
  await t('blocked '+p,()=>assert.equal(mw.isBlockedPath(p),true,p));
for(const p of['/','/index.html','/app.js','/data/questions.json','/data/curriculum.json','/icons/icon-192.png','/manifest.webmanifest','/some/spa/path','/api/explain'])
  await t('allowed '+p,()=>assert.equal(mw.isBlockedPath(p),false,p));
await t('middleware returns 404 without calling next',async()=>{let called=false;const r=await mw.onRequest({request:new Request('https://s.example/README.md'),next:()=>{called=true;return new Response('x')}});assert.equal(r.status,404);assert.equal(called,false);const ok=await mw.onRequest({request:new Request('https://s.example/app.js'),next:()=>new Response('ok')});assert.equal(await ok.text(),'ok');});
// ---- _routes.json ----
await t('_routes.json excludes only existing public files and every script in index.html',()=>{const r=JSON.parse(fs.readFileSync(path.join(root,'_routes.json'),'utf8'));assert.equal(r.version,1);assert.deepEqual(r.include,['/*']);assert(r.include.length+r.exclude.length<=100);
  for(const e of r.exclude){if(e==='/'||e.endsWith('/*'))continue;assert(fs.existsSync(path.join(root,e)),'missing '+e);assert.equal(mw.isBlockedPath(e),false);}
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script src="([^"?]+)/g)){const p='/'+m[1];assert(r.exclude.includes(p)||r.exclude.some(e=>e.endsWith('/*')&&p.startsWith(e.slice(0,-1))),'script not excluded (would cost a function call): '+p);}});
// ---- explain ----
const ORIGIN='https://study.example';
const req=(body,{origin=ORIGIN,type='application/json',ip='1.1.1.1',secFetch=null,raw=null}={})=>{const h={'content-type':type,'CF-Connecting-IP':ip};if(origin)h.Origin=origin;if(secFetch)h['Sec-Fetch-Site']=secFetch;return new Request(ORIGIN+'/api/explain',{method:'POST',headers:h,body:raw??JSON.stringify(body)});};
const okBody={question:'鎌倉幕府を開いた人物は？',answer:'源頼朝',subject:'社会',grade:2,choices:['源頼朝','足利尊氏']};
const ai=(impl)=>({run:async(model,input)=>impl(model,input)});
const logs=[];const origLog=console.log;console.log=(...a)=>{logs.push(a.join(' '));};
try{
await t('success path calls AI with system prompt and returns explanation',async()=>{ex.__resetRateLimitsForTest();let seen;const r=await ex.onRequestPost({request:req(okBody),env:{AI:ai((m,i)=>{seen=i;return{response:'【要点】\nテスト'}})}});assert.equal(r.status,200);assert.match((await r.json()).explanation,/要点/);assert.equal(seen.messages[0].role,'system');assert(seen.messages[1].content.includes('源頼朝'));});
await t('missing Origin rejected unless same-origin fetch metadata',async()=>{ex.__resetRateLimitsForTest();assert.equal((await ex.onRequestPost({request:req(okBody,{origin:null}),env:{AI:ai(()=>({response:'x'}))}})).status,403);assert.equal((await ex.onRequestPost({request:req(okBody,{origin:null,secFetch:'same-origin'}),env:{AI:ai(()=>({response:'x'}))}})).status,200);assert.equal((await ex.onRequestPost({request:req(okBody,{origin:null,secFetch:'cross-site'}),env:{AI:ai(()=>({response:'x'}))}})).status,403);});
await t('cross-origin rejected',async()=>assert.equal((await ex.onRequestPost({request:req(okBody,{origin:'https://evil.example'}),env:{}})).status,403));
await t('size limit',async()=>assert.equal((await ex.onRequestPost({request:req(null,{raw:JSON.stringify({question:'a'.repeat(9000),answer:'b'})}),env:{}})).status,413));
await t('content type and json',async()=>{assert.equal((await ex.onRequestPost({request:req(null,{type:'text/plain',raw:'x'}),env:{}})).status,415);assert.equal((await ex.onRequestPost({request:req(null,{raw:'{oops'}),env:{}})).status,400);assert.equal((await ex.onRequestPost({request:req(null,{raw:'[1]'}),env:{}})).status,400);assert.equal((await ex.onRequestPost({request:req({question:''}),env:{}})).status,400);});
await t('per-client rate limit returns 429 with retry-after, other clients unaffected',async()=>{ex.__resetRateLimitsForTest();const env={AI:ai(()=>({response:'x'}))};let last;for(let i=0;i<7;i++)last=await ex.onRequestPost({request:req(okBody,{ip:'9.9.9.9'}),env});assert.equal(last.status,429);assert.equal(last.headers.get('retry-after'),'60');assert.equal((await ex.onRequestPost({request:req(okBody,{ip:'8.8.8.8'}),env})).status,200);});
await t('rate limit checked before AI is called',async()=>{ex.__resetRateLimitsForTest();let calls=0;const env={AI:ai(()=>{calls++;return{response:'x'}})};for(let i=0;i<10;i++)await ex.onRequestPost({request:req(okBody,{ip:'7.7.7.7'}),env});assert.equal(calls,6);});
await t('local limiter windows',()=>{ex.__resetRateLimitsForTest();const now=Date.UTC(2026,0,1);for(let i=0;i<6;i++)assert.equal(ex.checkLocalRateLimit('k',now+i).limited,null);assert.equal(ex.checkLocalRateLimit('k',now+10).limited,'client-minute');assert.equal(ex.checkLocalRateLimit('k',now+61_000).limited,null);});
await t('optional KV daily caps',async()=>{ex.__resetRateLimitsForTest();const store=new Map();const kv={get:async k=>store.get(k)??null,put:async(k,v)=>{store.set(k,v)}};const env={AI:ai(()=>({response:'x'})),EXPLAIN_LIMITS:kv,EXPLAIN_DAILY_LIMIT:'3'};const codes=[];for(let i=0;i<4;i++){codes.push((await ex.onRequestPost({request:req(okBody,{ip:'10.0.0.'+i}),env})).status);}assert.deepEqual(codes,[200,200,200,429]);assert(![...store.keys()].some(k=>k.includes('10.0.0')),'raw IP must not be stored');});
await t('no AI binding -> 503, AI failure -> 500 generic, empty -> 502',async()=>{ex.__resetRateLimitsForTest();assert.equal((await ex.onRequestPost({request:req(okBody,{ip:'2.2.2.1'}),env:{}})).status,503);const r=await ex.onRequestPost({request:req(okBody,{ip:'2.2.2.2'}),env:{AI:ai(()=>{throw new Error('secret internal detail')})}});assert.equal(r.status,500);assert(!(await r.text()).includes('secret'));assert.equal((await ex.onRequestPost({request:req(okBody,{ip:'2.2.2.3'}),env:{AI:ai(()=>({}))}})).status,502);});
await t('GET and others are 405',async()=>assert.equal(ex.onRequest().status,405));
await t('usage logs contain no IP or question text',()=>{const all=logs.join('\n');assert(all.includes('"evt":"explain"'));assert(!/1\.1\.1\.1|9\.9\.9\.9|源頼朝|鎌倉/.test(all));});
}finally{console.log=origLog;}
console.log(`functions tests: ${n}/${n} PASS`);
