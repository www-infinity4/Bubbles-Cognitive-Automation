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
  assert.match(t.source.commit,/^[a-f0-9]{40}$/);assert.match(t.source.repo,/^www-infinity4\/[A-Za-z0-9-]+$/);
  assert.match(t.artwork.url,/^https:\/\/raw\.githubusercontent\.com\/www-infinity4\/QuantaPhi\/[a-f0-9]{40}\//);
  assert.equal(t.style.system,'Oracle Octaves');assert.ok(t.acceptance.length>=3);
  assert.equal(t.integration.productionVerified,false);
  assert.equal(t.integration.paymentEnabled,false);assert.equal(t.integration.requiresReview,true);
 }
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
test('static gallery has accessible tap targets and data-only text rendering',()=>{
 const css=readFileSync(resolve(root,'site/oracle.css'),'utf8');
 assert.match(css,/#f7f4f0/);assert.match(css,/#b83b32/);assert.match(css,/min-height:44px/);assert.match(css,/@media\(max-width:400px\)/);
 const script=readFileSync(resolve(root,'site/app.mjs'),'utf8');
 assert.match(script,/textContent/);assert.doesNotMatch(script,/innerHTML\s*=/);
});
