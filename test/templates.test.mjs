import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const ids=["oracle-quick-card","media-star","infinity-radio","story-writer","physics-experiment","shop-phi","search-research"];
const cat=read('templates/index.json'),upstream=read('contracts/widgetphi-fields.json');
test('seven canonical templates are discoverable and unique',()=>{
 assert.equal(cat.schema,'bubbles.template.catalog');assert.equal(cat.version,1);
 assert.deepEqual(cat.templates.map(x=>x.id),ids);assert.equal(new Set(ids).size,7);
});
test('templates map to genuine pinned sources and Oracle artworks',()=>{
 for(const info of cat.templates){
  const t=read(info.path);
  assert.equal(t.schema,'bubbles.card-template');assert.equal(t.id,info.id);
  assert.equal(info.path,`templates/${info.id}.json`);assert.ok(!info.path.includes('..')&&!info.path.includes('//'));
  assert.match(t.source.commit,/^[a-f0-9]{40}$/);assert.match(t.source.repo,/^www-infinity4\/[A-Za-z0-9-]+$/);
  assert.match(t.artwork.url,/^https:\/\/raw\.githubusercontent\.com\/www-infinity4\/QuantaPhi\/[a-f0-9]{40}\//);
  assert.equal(t.style.system,'Oracle Octaves');assert.ok(t.acceptance.length>=3);
  assert.equal(t.integration.productionVerified,false);
  assert.equal(t.integration.paymentEnabled,false);assert.equal(t.integration.requiresReview,true);
 }
});
test('pinned source inventory records evidence and honest readiness for every candidate',()=>{
 assert.equal(cat.inventory.path,'templates/source-inventory.json');
 const inventory=read(cat.inventory.path);
 assert.equal(inventory.schema,'bubbles.template.inventory');assert.equal(inventory.version,1);
 assert.equal(inventory.sourceCensus.commit,'0d2e887949d32a6817b42d071f6bfb8ce741ec42');
 assert.equal(inventory.sourceCensus.rootEntries,inventory.sourceCensus.rootFiles+inventory.sourceCensus.rootDirectories);
 assert.match(inventory.sourceCensus.recursiveTreeStatus,/HTTP 403/);
 const items=inventory.items,byId=new Map(items.map(item=>[item.id,item]));
 assert.equal(byId.size,items.length);
 const counts=Object.fromEntries(Object.entries(inventory.classificationCounts).sort());
 const actual=Object.fromEntries([...new Set(items.map(item=>item.status))].sort().map(status=>[status,items.filter(item=>item.status===status).length]));
 assert.deepEqual(actual,counts);
 for(const item of items){
  assert.match(item.id,/^[a-z0-9][a-z0-9-]*$/);
  assert.ok(item.title&&item.category&&item.terms.length);
  assert.ok(Array.isArray(item.dependencies)&&item.sources.length>0);
  assert.ok(item.operatingMode&&item.functionalEvidence&&item.rights);
  assert.ok(item.accessibility.status&&item.accessibility.evidence);
  assert.ok(item.artwork.status);
  for(const source of item.sources){
   assert.match(source.repo,/^www-infinity4\/[A-Za-z0-9-]+$/);
   assert.match(source.commit,/^[a-f0-9]{40}$/);
   assert.ok(source.path&&!source.path.startsWith('/')&&!source.path.split('/').includes('..'));
   if(source.repo==='www-infinity4/QuantaPhi')assert.equal(source.commit,inventory.sourceCensus.commit);
   if(source.repo==='www-infinity4/WidgetPhi')assert.equal(source.commit,cat.upstream.commit);
  }
  if(item.status==='usable-now'){
   assert.equal(item.instantiable,true);
   assert.equal(item.templatePath,`templates/${item.id}.json`);
   assert.ok(item.widgetphiCardIds.length);
   assert.ok(cat.templates.some(entry=>entry.id===item.id));
   for(const id of item.widgetphiCardIds)assert.ok(upstream.cards.some(card=>card.id===id),id);
  }else{
   assert.equal(item.instantiable,false);
   assert.equal(item.templatePath,undefined);
   assert.deepEqual(item.widgetphiCardIds,[]);
  }
  if(item.status==='adapter-needed'){
   assert.equal(item.adapterContract.widgetphiCardId,null);
   assert.ok(item.adapterContract.required.length&&item.adapterContract.acceptance.length&&item.adapterContract.forbidden.length);
  }
  if(item.status==='blocked')assert.ok(item.permissionBoundary);
 }
 const carousel=byId.get('developer-carousel');
 assert.ok(carousel.sources.some(source=>source.path==='tests/developer-carousel.test.mjs'));
 assert.ok(carousel.sources.some(source=>source.path==='developer-carousel.css'));
 assert.match(carousel.accessibility.evidence,/44px/);
 assert.match(carousel.artwork.status,/multiple-original-images/);
 assert.match(byId.get('infinity-radio').functionalEvidence,/play\/pause, next, volume/);
 assert.match(byId.get('wallet-settlement').permissionBoundary,/No mint, spend, purchase/);
 assert.match(byId.get('private-profile').permissionBoundary,/cannot read or write profile data/);
 assert.ok(byId.get('developer-carousel').adapterContract.forbidden.some(text=>/auto-submit/i.test(text)));
 assert.match(byId.get('duplicate-responsive-stylesheet').functionalEvidence,/1fa32dccd19ae7ea10ae8b8f75d1e741b9a50093/);
});
test('each WidgetPhi configuration uses only the pinned allowed fields and values',()=>{
 for(const info of cat.templates){
  const site=read(info.path).widgetphi;
  assert.equal(site.schema,'widgetphi.site');assert.equal(site.version,1);
  assert.ok(site.cards.length>=1);assert.equal(new Set(site.cards.map(c=>c.instanceId)).size,site.cards.length);
  for(const card of site.cards){
   const def=upstream.cards.find(c=>c.id===card.cardId);assert.ok(def,card.cardId);
   const fields=new Map(def.settings.map(f=>[f.key,f]));
   assert.deepEqual(Object.keys(card.settings).sort(),[...fields.keys()].sort());
   for(const [key,v] of Object.entries(card.settings)){
    const f=fields.get(key);
    if(f.type==='boolean')assert.equal(typeof v,'boolean');
    else if(f.type==='number')assert.ok(Number.isInteger(v)&&v>=(f.min??0)&&v<=(f.max??10000));
    else {assert.equal(typeof v,'string');assert.ok(v.length<=(f.type==='textarea'?4000:500));}
    if(f.type==='select')assert.ok(f.options.includes(v));
   }
  }
 }
});
test('seven GitHub issue forms require specific implementation requests',()=>{
 const forms=readdirSync(resolve(root,'.github/ISSUE_TEMPLATE')).filter(f=>f.endsWith('.yml')).sort();
 assert.deepEqual(forms,ids.map(x=>x+'.yml').sort());
 for(const id of ids){const f=readFileSync(resolve(root,'.github/ISSUE_TEMPLATE',id+'.yml'),'utf8');
  assert.match(f,/^name: /m);assert.match(f,/  - type: textarea/);assert.match(f,/required: true/);}
});
test('CLI exports actual portable WidgetPhi manifests and rejects unknown IDs',()=>{
 const call=(...args)=>execFileSync(process.execPath,[resolve(root,'scripts/template-cli.mjs'),...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
 assert.deepEqual(JSON.parse(call('list')).map(x=>x.id),ids);
 assert.equal(JSON.parse(call('manifest','search-research')).cards.length,2);
 assert.throws(()=>call('manifest','missing'));
});
test('CLI searches source-backed candidates and distinguishes adapter, reference, and blocked states',()=>{
 const call=(...args)=>execFileSync(process.execPath,[resolve(root,'scripts/template-cli.mjs'),...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
 const searches=['quick card','carousel','Oracle','developer','radio','media','image','video','physics','shopping','directory','news','profile','buttons','search','Cloudflare','PWA'];
 for(const query of searches)assert.ok(JSON.parse(call('search',query)).length,query);
 const carousel=JSON.parse(call('search','carousel')).find(x=>x.id==='developer-carousel');
 assert.equal(carousel.status,'adapter-needed');
 assert.equal(carousel.instantiable,false);
 assert.ok(carousel.sources.some(x=>x.commit==='0d2e887949d32a6817b42d071f6bfb8ce741ec42'));
 const blocked=JSON.parse(call('search','profile')).find(x=>x.status==='blocked');
 assert.equal(blocked.instantiable,false);
 assert.ok(JSON.parse(call('category','Shopping')).some(x=>x.id==='shop-phi'));
 assert.deepEqual(JSON.parse(call('search','carousel','--category','Media')),[]);
 assert.throws(()=>call('manifest','developer-carousel'));
 assert.throws(()=>call('manifest','private-profile'),error=>error.status===3&&String(error.stderr).includes('blocked'));
});
test('static gallery has accessible tap targets and data-only text rendering',()=>{
 const css=readFileSync(resolve(root,'site/oracle.css'),'utf8');
 assert.match(css,/#f7f4f0/);assert.match(css,/#b83b32/);assert.match(css,/min-height:44px/);assert.match(css,/@media\(max-width:400px\)/);
 const script=readFileSync(resolve(root,'site/app.mjs'),'utf8');
 assert.match(script,/textContent/);assert.doesNotMatch(script,/innerHTML\s*=/);
});
