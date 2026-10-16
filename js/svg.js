export const NS='http://www.w3.org/2000/svg';
export function inspect(text){
 if(text.length>10*1024*1024)throw Error('SVG_TOO_LARGE: 10 MiB');
 if(/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(text))throw Error('UNSUPPORTED: DTD / entity / stylesheet processing instruction');
 const doc=new DOMParser().parseFromString(text,'image/svg+xml'),root=doc.documentElement;
 if(doc.querySelector('parsererror')||root.localName!=='svg'||root.namespaceURI!==NS)throw Error('INVALID_SVG');
 for(const el of doc.querySelectorAll('*')){
  if(el.namespaceURI!==NS)throw Error('UNSUPPORTED_NAMESPACE');
  if(['script','foreignObject','animate','animateTransform','animateMotion','set','discard','handler'].includes(el.localName))throw Error('UNSUPPORTED_ELEMENT: '+el.localName+' / animation and script validation pending');
  for(const a of el.attributes){if(/^on/i.test(a.name))throw Error('UNSUPPORTED_SCRIPT_EVENT: '+a.name);if(a.localName==='href'&&a.value&&!a.value.startsWith('#')){if(!(el.localName==='image'&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i.test(a.value)))throw Error('EXTERNAL_RESOURCE_OR_UNSUPPORTED_URI: '+a.value.slice(0,160));}}
 }
 const css=[...doc.querySelectorAll('style')].map(e=>e.textContent).join('\n')+'\n'+[...doc.querySelectorAll('[style]')].map(e=>e.getAttribute('style')).join('\n');
 if(/@|\\|\/\*|animation|transition|behavior|expression\s*\(/i.test(css))throw Error('UNSUPPORTED_CSS: animation / at-rule / escaped CSS');
 for(const m of text.matchAll(/url\s*\(\s*['"]?([^)'"\s]+)/gi))if(!m[1].startsWith('#'))throw Error('EXTERNAL_RESOURCE: '+m[1].slice(0,160));
 const vb=(root.getAttribute('viewBox')||'').trim().split(/[\s,]+/).map(Number);
 const len=(s,fallback)=>{if(!s)return fallback;if(!/^\d+(\.\d+)?(px)?$/.test(s))throw Error('UNSUPPORTED_DIMENSION: '+s);return parseFloat(s);};
 const w=len(root.getAttribute('width'),vb.length===4?vb[2]:NaN),h=len(root.getAttribute('height'),vb.length===4?vb[3]:NaN);
 if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)throw Error('INVALID_SIZE: width/height or viewBox required');
 return{doc,root,w,h,text:new XMLSerializer().serializeToString(root)};
}
export function loadImage(blob){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(blob),im=new Image();im.onload=()=>{URL.revokeObjectURL(url);resolve(im);};im.onerror=()=>{URL.revokeObjectURL(url);reject(Error('RASTERIZATION_FAILED'));};im.src=url;});}
export function dimensions(info,s){let w=info.w,h=info.h;if(s.preset==='scale'){w*=s.scale;h*=s.scale;}else if(s.preset==='custom'){w=s.width;h=s.height;}else if(s.preset!=='original'){[w,h]=s.preset.split('x').map(Number);}w=Math.round(w);h=Math.round(h);const memory=navigator.deviceMemory||4,maxPixels=Math.min(32e6,memory*4e6);if(!Number.isFinite(w)||!Number.isFinite(h)||w<1||h<1||w>16384||h>16384||w*h>maxPixels)throw Error('RESOURCE_LIMIT: reduce dimensions / サイズを下げてください');return{w,h};}
export async function render(info,s,background,size){const {w,h}=size||dimensions(info,s),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(!x)throw Error('CANVAS_UNAVAILABLE');if(s.bg==='white'||s.bg==='color'){x.fillStyle=s.bg==='white'?'#fff':s.color;x.fillRect(0,0,w,h);}else if(s.bg==='image'){if(!background)throw Error('BACKGROUND_REQUIRED');const k=Math.max(w/background.width,h/background.height);x.drawImage(background,(w-background.width*k)/2,(h-background.height*k)/2,background.width*k,background.height*k);}
 const im=await loadImage(new Blob([info.text],{type:'image/svg+xml'}));if(s.fit==='stretch')x.drawImage(im,0,0,w,h);else{const k=(s.fit==='cover'?Math.max:Math.min)(w/info.w,h/info.h);x.drawImage(im,(w-info.w*k)/2,(h-info.h*k)/2,info.w*k,info.h*k);}return c;}
