import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnoseUi,makeRepairPacket} from '../src/diagnose.mjs';
const source={repository:'www-infinity4/QuantaPhi',commitSha:'a'.repeat(40),pageUrl:'https://quantaphi.org/'};
const base=()=>({schemaVersion:1,source:{...source},capture:{id:'demo-capture',at:'2026-11-08T00:00:00Z',viewport:{width:360,height:720},nodes:[],consoleErrors:[],networkFailures:[],visionFindings:[]}});
test('a broken image yields evidence and a proposal-only packet',()=>{
 const x=base();x.capture.nodes.push({tag:'img',selector:'.broken',complete:true,naturalWidth:0});
 const report=diagnoseUi(x);assert.equal(report.findings[0].code,'IMAGE_FAILED');
 assert.equal(report.execution.performed,false);
 const packet=makeRepairPacket(report);assert.equal(packet.mode,'propose_only');
 assert.equal(packet.authorization.writes,false);
 assert.match(packet.jobs[0].acceptance[0],/same pinned/i);
});
test('undersized and clipped Android buttons produce two objective warnings',()=>{
 const x=base();x.capture.nodes.push({tag:'button',selector:'#next',rect:{x:335,y:200,width:28,height:20},visible:true});
 assert.deepEqual(diagnoseUi(x).findings.map(f=>f.code),['TARGET_TOO_SMALL','HORIZONTAL_OVERFLOW']);
});
test('hidden controls and successful HTTP responses do not make false warnings',()=>{
 const x=base();x.capture.nodes.push({tag:'button',visible:false,rect:{x:0,y:0,width:10,height:10}});
 x.capture.networkFailures.push({url:'https://example.org/ok',status:200});
 assert.deepEqual(diagnoseUi(x).findings,[]);
});
test('network and console findings distinguish symptoms from causes',()=>{
 const x=base();x.capture.consoleErrors.push({message:'TypeError',source:'https://quantaphi.org/app.js?token=redacted'});
 x.capture.networkFailures.push({url:'https://quantaphi.org/media.png?session=redacted',status:404,resourceType:'image'});
 const findings=diagnoseUi(x).findings;
 assert.deepEqual(findings.map(f=>f.code),['CONSOLE_ERROR','HTTP_FAILURE']);
 assert.ok(findings.every(f=>f.causeConfirmed===false));
 assert.equal(findings[0].target,'https://quantaphi.org/app.js');
});
test('vision guesses are ignored without real analysis receipts',()=>{
 const x=base();x.capture.visionFindings.push({target:'#card',description:'overlap',confidence:.9});
 assert.equal(diagnoseUi(x).findings.length,0);
 x.capture.visionFindings[0].receiptId='vision-1';x.capture.visionFindings[0].evidenceRef='sha256:abc';
 assert.equal(diagnoseUi(x).findings[0].code,'VISION_OBSERVATION');
});
test('findings deduplicate and yield deterministic ticket IDs',()=>{
 const x=base();x.capture.nodes=[{tag:'img',selector:'#p',naturalWidth:0},{tag:'img',selector:'#p',naturalWidth:0}];
 const a=diagnoseUi(x);assert.equal(a.findings.length,1);
 assert.equal(makeRepairPacket(a).ticketKey,makeRepairPacket(diagnoseUi(x)).ticketKey);
});
test('mutable source revisions and unsafe URL protocols are rejected',()=>{
 const x=base();x.source.commitSha='main';assert.throws(()=>diagnoseUi(x),/40-char/i);
 x.source.commitSha='a'.repeat(40);x.source.pageUrl='javascript:alert(1)';
 assert.throws(()=>diagnoseUi(x),/https/i);
});
