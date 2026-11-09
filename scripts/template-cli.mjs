#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const entries=read('templates/index.json').templates;
const [action,id]=process.argv.slice(2);
if(action==='list')process.stdout.write(JSON.stringify(entries,null,2)+'\n');
else if(action==='manifest'||action==='inspect'){
 const item=entries.find(x=>x.id===id);
 if(!item){console.error('Unknown template. Run: node scripts/template-cli.mjs list');process.exitCode=2;}
 else {const t=read(item.path);process.stdout.write(JSON.stringify(action==='manifest'?t.widgetphi:t,null,2)+'\n');}
}else{console.error('Usage: node scripts/template-cli.mjs list | inspect <id> | manifest <id>');process.exitCode=2;}
