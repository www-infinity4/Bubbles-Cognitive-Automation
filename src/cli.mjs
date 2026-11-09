#!/usr/bin/env node
import fs from 'node:fs/promises';
import {diagnoseUi,makeRepairPacket} from './diagnose.mjs';
const file=process.argv[2];
if(!file){console.error('Usage: node src/cli.mjs evidence.json');process.exitCode=2;}
else try{
 const stat=await fs.stat(file);
 if(stat.size>2*1024*1024)throw Error('Evidence file too large');
 const data=JSON.parse(await fs.readFile(file,'utf8'));
 const report=diagnoseUi(data);
 console.log(JSON.stringify({report,repairPacket:makeRepairPacket(report)},null,2));
}catch(e){console.error('Cannot triage evidence: '+e.message);process.exitCode=1;}
