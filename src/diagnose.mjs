/**
 * Evidence-only UI triage for the existing Moltnook repository engine.
 * No source writes, network requests, model calls, wallet changes or deployment.
 */
import {createHash} from 'node:crypto';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const bound=(value,max=240)=>String(value??'').slice(0,max);
const rectValid=r=>r&&[r.x,r.y,r.width,r.height].every(Number.isFinite)&&r.width>=0&&r.height>=0;
const isHttp=value=>{try{return ['https:','http:'].includes(new URL(value).protocol)}catch{return false}};
function publicUrl(value){
 if(!isHttp(value))return null;
 const u=new URL(value);
 u.username='';u.password='';u.search='';u.hash='';
 return u.toString();
}
function validate(input){
 if(input?.schemaVersion!==1||!input.source||!input.capture)throw Error('Expected schemaVersion 1, source and capture');
 const {source,capture}=input;
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(source.repository||''))throw Error('Repository must be owner/name');
 if(!/^[a-f0-9]{40}$/i.test(source.commitSha||''))throw Error('Pinned source requires a 40-char commit SHA');
 if(!isHttp(source.pageUrl)||new URL(source.pageUrl).protocol!=='https:')throw Error('Page URL must use https');
 if(!bound(capture.id,120)||!Number.isFinite(Date.parse(capture.at||'')))throw Error('Capture requires id and timestamp');
 if(!Number.isFinite(capture.viewport?.width)||capture.viewport.width<240||capture.viewport.width>8000||
    !Number.isFinite(capture.viewport?.height)||capture.viewport.height<240||capture.viewport.height>8000)
  throw Error('Capture requires reasonable viewport');
 for(const key of ['nodes','consoleErrors','networkFailures','visionFindings']){
  if(capture[key]!=null&&(!Array.isArray(capture[key])||capture[key].length>5000))throw Error(key+' must be a bounded list');
 }
}
export function diagnoseUi(input){
 validate(input);
 const {source,capture:c}=input,findings=[],seen=new Set();
 function add(code,target,detail,evidence){
  const key=JSON.stringify([code,target,detail]);if(seen.has(key))return;seen.add(key);
  findings.push({id:digest([source.repository,source.commitSha,code,target,detail]).slice(0,16),code,
   target:bound(target),detail:bound(detail,400),evidence,causeConfirmed:false,repairStatus:'requires_source_review'});
 }
 for(const node of c.nodes||[]){
  if(node?.visible===false)continue;
  const tag=bound(node.tag,16).toLowerCase(),target=bound(node.selector||node.testId||tag);
  if(tag==='img'&&(node.complete===false||node.naturalWidth===0))
   add('IMAGE_FAILED',target,'Image failed to load or decode',{captureId:c.id,dom:true});
  const interactive=['button','input','select','textarea','a'].includes(tag)||node.role==='button'||node.role==='link';
  if(interactive&&rectValid(node.rect)&&node.rect.width>0&&node.rect.height>0&&(node.rect.width<44||node.rect.height<44))
   add('TARGET_TOO_SMALL',target,'Interactive target '+node.rect.width+'×'+node.rect.height+'px (<44px)',{captureId:c.id,viewport:c.viewport});
  if(rectValid(node.rect)&&node.rect.width>0&&(node.rect.x < -1||node.rect.x+node.rect.width>c.viewport.width+1))
   add('HORIZONTAL_OVERFLOW',target,'Element extends beyond viewport width',{captureId:c.id,viewport:c.viewport,rect:node.rect});
 }
 for(const e of c.consoleErrors||[]){
  if(e?.message)add('CONSOLE_ERROR',publicUrl(e.source)||'browser-console',bound(e.message,320),{captureId:c.id,console:true});
 }
 for(const e of c.networkFailures||[]){
  if(!Number.isInteger(e?.status)||e.status<400||e.status>599)continue;
  add('HTTP_FAILURE',publicUrl(e.url)||'redacted-resource','HTTP '+e.status+(e.resourceType?' '+bound(e.resourceType,30):''),{captureId:c.id,status:e.status,network:true});
 }
 // A vision observation must come from a separately evidenced image-analysis receipt.
 for(const v of c.visionFindings||[]){
  if(!v?.receiptId||!v?.evidenceRef||!v?.description||!v?.target||
    !Number.isFinite(v.confidence)||v.confidence<0||v.confidence>1)continue;
  add('VISION_OBSERVATION',bound(v.target),bound(v.description,320),
   {captureId:c.id,visionReceiptId:bound(v.receiptId,100),evidenceRef:bound(v.evidenceRef,120),confidence:v.confidence});
 }
 return {schemaVersion:1,kind:'ui-evidence-triage',
  source:{repository:source.repository,commitSha:source.commitSha,pageUrl:publicUrl(source.pageUrl)},
  capture:{id:bound(c.id,120),at:c.at,viewport:c.viewport,screenshotRef:bound(c.screenshotRef||'',150)||null},
  findings,execution:{performed:false,sourceModified:false,testsRun:false,merged:false,deployed:false},
  limitations:['DOM, console and network rules find symptoms, not confirmed root causes.',
    'Screenshots require an external vision adapter with a verifiable receipt.',
    'Repairs require an existing authenticated lease, tests, review and release readback.']};
}
export function makeRepairPacket(report){
 if(report?.schemaVersion!==1||report.kind!=='ui-evidence-triage'||!Array.isArray(report.findings))throw Error('Expected UI triage report');
 const ticketKey='ui-repair-'+digest([report.source.repository,report.source.commitSha,report.findings.map(x=>x.id).sort()]).slice(0,16);
 return {schemaVersion:1,ticketKey,mode:'propose_only',source:report.source,
  authorization:{writes:false,pr:false,merge:false,deployment:false,ownerLeaseRequired:true},
  lane:'existing-moltnook-repository-engine',roles:['red-if-source-unknown','green','pink','purple','black'],
  jobs:report.findings.map(f=>({findingId:f.id,code:f.code,target:f.target,observed:f.detail,sourceEvidence:f.evidence,
   acceptance:['Reproduce the symptom against the same pinned commit before changing code.',
    'Green: patch the correct source with a failing-then-passing regression test.',
    'Pink and Purple: review exact-head tests; Black: separately verify merge, deployment, and mobile acceptance.']}))};
}
