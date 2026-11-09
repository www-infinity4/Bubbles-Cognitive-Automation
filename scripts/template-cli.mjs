#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const catalog=read('templates/index.json');
const inventory=read(catalog.inventory.path);
const entries=catalog.templates;
const records=new Map(inventory.items.map(item=>[item.id,item]));
const normalize=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const safeTemplatePath=p=>{
 if(typeof p!=='string'||!/^templates\/[a-z0-9][a-z0-9-]*\.json$/.test(p))return false;
 const base=resolve(root,'templates')+sep;
 return resolve(root,p).startsWith(base);
};
const resultFor=record=>{
 const entry=entries.find(item=>item.id===record.id);
 const template=entry?readTemplate(entry):null;
 return {
  id:record.id,
  title:record.title,
  category:record.category,
  status:record.status,
  instantiable:record.instantiable,
  readiness:entry?.readiness||record.status,
  path:record.templatePath||entry?.path||null,
  sources:record.sources,
  requiredSources:record.sources,
  ...(record.adapterContract?{adapterContract:record.adapterContract}:{}),
  ...(template?.artwork?{artwork:template.artwork.url}:{})
 };
};
function readTemplate(entry){
 if(!safeTemplatePath(entry.path))throw Error('Invalid template path in catalog: '+entry.id);
 const template=read(entry.path);
 if(template.id!==entry.id)throw Error('Template ID does not match catalog: '+entry.id);
 return template;
}
function usage(){
 console.error('Usage: node scripts/template-cli.mjs list | search <terms> [--category <name>] | category <name> | inspect <id> | manifest <id>');
 process.exitCode=2;
}
const [action,...args]=process.argv.slice(2);
if(action==='list'){
 process.stdout.write(JSON.stringify(entries.map(entry=>{
  const record=records.get(entry.id);
  if(!record)throw Error('Missing source inventory record: '+entry.id);
  return resultFor(record);
 }),null,2)+'\n');
}else if(action==='search'||action==='category'){
 let category='';
 const query=[];
 for(let i=0;i<args.length;i++){
  if(args[i]==='--category'){
   if(!args[i+1]){usage();break;}
   category=args[++i];
  }else query.push(args[i]);
 }
 if(process.exitCode!==2){
  if(action==='category'&&!category){category=query.join(' ');query.length=0;}
  const terms=normalize(query.join(' '));
  const selected=inventory.items.filter(record=>{
   if(category&&normalize(record.category)!==normalize(category))return false;
   if(!terms)return true;
   const haystack=normalize([record.id,record.title,record.category,...record.terms].join(' '));
   return terms.split(' ').every(term=>haystack.split(' ').includes(term));
  });
  process.stdout.write(JSON.stringify(selected.map(resultFor),null,2)+'\n');
 }
}else if(action==='manifest'||action==='inspect'){
 const id=args[0];
 const entry=entries.find(item=>item.id===id);
 const record=records.get(id);
 if(action==='manifest'){
  if(!entry){console.error(record?'Template requires an adapter and cannot be instantiated.':'Unknown template ID.');process.exitCode=record?3:2;}
  else process.stdout.write(JSON.stringify(readTemplate(entry).widgetphi,null,2)+'\n');
 }else if(entry)process.stdout.write(JSON.stringify(readTemplate(entry),null,2)+'\n');
 else if(record)process.stdout.write(JSON.stringify(record,null,2)+'\n');
 else{console.error('Unknown template ID.');process.exitCode=2;}
}else usage();
