// Data-only catalog UI. Source JSON is not executed as HTML or code.
const root=document.getElementById('templates'),status=document.getElementById('status');
const label=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n};
async function show(){
 try{
  const response=await fetch('templates/index.json',{cache:'no-store'});
  if(!response.ok)throw Error('Catalog unavailable: HTTP '+response.status);
  const catalog=await response.json();
  if(catalog.schema!=='bubbles.template.catalog'||catalog.version!==1||!Array.isArray(catalog.templates))throw Error('Unknown catalog schema');
  for(const entry of catalog.templates){
   if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id))continue;
   const r=await fetch(entry.path,{cache:'no-store'});if(!r.ok)continue;
   const t=await r.json();if(t.schema!=='bubbles.card-template'||t.id!==entry.id)continue;
   const card=document.createElement('article');card.className='card';card.dataset.accent=t.style.accent;
   const art=document.createElement('img');const url=new URL(t.artwork.url);
   if(url.protocol!=='https:'||url.hostname!=='raw.githubusercontent.com')continue;
   art.src=url.href;art.alt=t.artwork.alt;art.loading='lazy';
   const content=document.createElement('div');content.className='details';
   content.append(label('h2',t.title),label('p',t.description));
   const actions=document.createElement('div');actions.className='actions';
   const link=document.createElement('a');link.className='action';link.textContent='View template';link.href='https://github.com/www-infinity4/Bubbles-Cognitive-Automation/blob/main/templates/'+encodeURIComponent(entry.id)+'.json';link.target='_blank';link.rel='noopener noreferrer';
   const copy=label('button','Copy WidgetPhi manifest');copy.className='primary';copy.type='button';
   copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(JSON.stringify(t.widgetphi,null,2));status.textContent='Copied '+t.title+'. Production remains unverified.';}catch{status.textContent='Clipboard unavailable; use View template.';}});
   actions.append(link,copy);content.append(actions);card.append(art,content);root.append(card);
  }
  status.textContent=root.childElementCount+' configuration templates loaded. None auto-publishes.';
 }catch(e){status.textContent=e.message+' · Open templates/index.json on GitHub.';}
}
void show();
