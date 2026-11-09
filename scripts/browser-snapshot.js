/* Use only in an authorized browser; explicitly invoke captureBubblesUiEvidence({repository,commitSha}).
 * Never collect cookies, localStorage, entered text, tokens, passwords or credential URLs.
 * Real console/network/screenshot receipts must be collected separately.
 */
(()=>{
 const sanitizeUrl=value=>{try{const u=new URL(value,location.href);return u.origin+u.pathname;}catch{return ''}};
 const selectorFor=(el,index)=>{
  const safe=value=>String(value||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,70);
  if(el.getAttribute('data-testid'))return '[data-testid="'+safe(el.getAttribute('data-testid'))+'"]';
  if(el.id)return '#'+safe(el.id);
  return el.tagName.toLowerCase()+'[capture-index="'+index+'"]';
 };
 window.captureBubblesUiEvidence=({repository,commitSha})=>{
  if(!/^[a-fA-F0-9]{40}$/.test(commitSha||''))throw Error('Pinned SHA required, never a mutable branch');
  const at=new Date().toISOString();
  const nodes=Array.from(document.querySelectorAll('img,button,a,input,select,textarea,[role="button"],[role="link"]')).slice(0,1500).map((el,i)=>{
   const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
   const box={x:Math.round(rect.x),y:Math.round(rect.y),width:Math.round(rect.width),height:Math.round(rect.height)};
   return {tag:el.tagName.toLowerCase(),role:el.getAttribute('role')||undefined,selector:selectorFor(el,i),
    visible:style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0,rect:box,
    ...(el.tagName.toLowerCase()==='img'?{complete:el.complete,naturalWidth:el.naturalWidth}:{})};
  });
  return {schemaVersion:1,source:{repository,commitSha,pageUrl:sanitizeUrl(location.href)},
   capture:{id:'browser-'+at,at,viewport:{width:innerWidth,height:innerHeight},nodes,consoleErrors:[],networkFailures:[],visionFindings:[]}};
 };
})();
