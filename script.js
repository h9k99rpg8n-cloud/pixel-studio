var canvas=document.getElementById('pixelCanvas');
var ctx=canvas.getContext('2d');
var sizeSelect=document.getElementById('sizeSelect');
var colorPicker=document.getElementById('colorPicker');
var statusText=document.getElementById('statusText');
var exportBtn=document.getElementById('exportBtn');
var clearBtn=document.getElementById('clearBtn');
var zoomInBtn=document.getElementById('zoomInBtn');
var zoomOutBtn=document.getElementById('zoomOutBtn');
var zoomResetBtn=document.getElementById('zoomResetBtn');
var canvasScroll=document.getElementById('canvasScroll');
var saveBtn=document.getElementById('saveBtn');
var loadBtn=document.getElementById('loadBtn');
var undoBtn=document.getElementById('undoBtn');
var redoBtn=document.getElementById('redoBtn');
var addLayerBtn=document.getElementById('addLayerBtn');
var toggleLayerBtn=document.getElementById('toggleLayerBtn');
var deleteLayerBtn=document.getElementById('deleteLayerBtn');
var importBtn=document.getElementById('importBtn');
var importInput=document.getElementById('importInput');
var layersPanel=document.getElementById('layersPanel');
var gridSize=Number(sizeSelect.value);
var tool='pencil';
var down=false;
var zoom=1;
var layers=[];
var active=0;
var undo=[];
var redo=[];
function blank(){var a=[];for(var y=0;y<gridSize;y++){var r=[];for(var x=0;x<gridSize;x++)r.push('');a.push(r);}return a;}
function copyPixels(p){return p.map(function(r){return r.slice();});}
function copyLayers(ls){return ls.map(function(l){return{name:l.name,visible:l.visible,pixels:copyPixels(l.pixels)};});}
function init(){layers=[{name:'Capa 1',visible:true,pixels:blank()}];active=0;}
function hist(){undo.push({size:gridSize,active:active,layers:copyLayers(layers)});if(undo.length>40)undo.shift();redo=[];}
function restore(s){gridSize=s.size;active=s.active;layers=copyLayers(s.layers);sizeSelect.value=String(gridSize);renderLayers();draw();}
function drawBg(){var b=32;for(var y=0;y<canvas.height;y+=b){for(var x=0;x<canvas.width;x+=b){ctx.fillStyle=((x/b+y/b)%2===0)?'#182033':'#222c42';ctx.fillRect(x,y,b,b);}}}
function grid(c){ctx.strokeStyle='rgba(255,255,255,0.10)';for(var i=0;i<=gridSize;i++){ctx.beginPath();ctx.moveTo(i*c,0);ctx.lineTo(i*c,canvas.height);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*c);ctx.lineTo(canvas.width,i*c);ctx.stroke();}}
function draw(){var c=canvas.width/gridSize;drawBg();for(var l=0;l<layers.length;l++){if(!layers[l].visible)continue;var p=layers[l].pixels;for(var y=0;y<gridSize;y++){for(var x=0;x<gridSize;x++){if(p[y][x]){ctx.fillStyle=p[y][x];ctx.fillRect(x*c,y*c,c,c);}}}}grid(c);}
function renderLayers(){layersPanel.innerHTML='';for(var i=layers.length-1;i>=0;i--){var b=document.createElement('button');b.className='layer-chip'+(i===active?' active':'')+(!layers[i].visible?' hidden-layer':'');b.textContent=layers[i].name+(layers[i].visible?'':' oculta');b.dataset.layer=i;b.onclick=function(){active=Number(this.dataset.layer);renderLayers();statusText.textContent='Capa activa: '+layers[active].name;};layersPanel.appendChild(b);}}
function applyZoom(){var s=Math.round(512*zoom);canvas.style.width=s+'px';canvas.style.height=s+'px';statusText.textContent='Zoom '+Math.round(zoom*100)+'%';}
function point(e){var r=canvas.getBoundingClientRect();var x=Math.floor((e.clientX-r.left)/r.width*gridSize);var y=Math.floor((e.clientY-r.top)/r.height*gridSize);if(x<0||y<0||x>=gridSize||y>=gridSize)return null;return{x:x,y:y};}
function fill(sx,sy,color){var p=layers[active].pixels;var old=p[sy][sx];if(old===color)return;var st=[{x:sx,y:sy}];while(st.length){var q=st.pop();if(q.x<0||q.y<0||q.x>=gridSize||q.y>=gridSize)continue;if(p[q.y][q.x]!==old)continue;p[q.y][q.x]=color;st.push({x:q.x+1,y:q.y});st.push({x:q.x-1,y:q.y});st.push({x:q.x,y:q.y+1});st.push({x:q.x,y:q.y-1});}}
function use(e){var q=point(e);if(!q)return;var p=layers[active].pixels;if(tool==='picker'){for(var l=layers.length-1;l>=0;l--){if(layers[l].visible&&layers[l].pixels[q.y][q.x]){colorPicker.value=layers[l].pixels[q.y][q.x];statusText.textContent='Color copiado';return;}}statusText.textContent='Pixel transparente';return;}if(tool==='bucket'){hist();fill(q.x,q.y,colorPicker.value);draw();statusText.textContent='Cubeta aplicada';return;}p[q.y][q.x]=tool==='eraser'?'':colorPicker.value;statusText.textContent='Pixel '+q.x+', '+q.y;draw();}
canvas.onpointerdown=function(e){down=true;if(tool==='pencil'||tool==='eraser')hist();use(e);};
canvas.onpointermove=function(e){if(down&&(tool==='pencil'||tool==='eraser'))use(e);};
window.onpointerup=function(){down=false;};
var tbs=document.querySelectorAll('[data-tool]');for(var i=0;i<tbs.length;i++){tbs[i].onclick=function(){tool=this.dataset.tool;for(var j=0;j<tbs.length;j++)tbs[j].classList.remove('active');this.classList.add('active');var n={pencil:'Modo pintar',eraser:'Modo borrar',bucket:'Modo cubeta',picker:'Modo cuentagotas'};statusText.textContent=n[tool];};}
sizeSelect.onchange=function(){hist();gridSize=Number(sizeSelect.value);init();zoom=gridSize===64?1.5:1;applyZoom();renderLayers();draw();};
clearBtn.onclick=function(){hist();layers[active].pixels=blank();draw();statusText.textContent='Capa limpia';};
zoomInBtn.onclick=function(){zoom=Math.min(3,zoom+0.25);applyZoom();};
zoomOutBtn.onclick=function(){zoom=Math.max(0.75,zoom-0.25);applyZoom();};
zoomResetBtn.onclick=function(){zoom=1;applyZoom();canvasScroll.scrollLeft=0;canvasScroll.scrollTop=0;};
addLayerBtn.onclick=function(){hist();layers.push({name:'Capa '+(layers.length+1),visible:true,pixels:blank()});active=layers.length-1;renderLayers();draw();};
toggleLayerBtn.onclick=function(){hist();layers[active].visible=!layers[active].visible;renderLayers();draw();};
deleteLayerBtn.onclick=function(){if(layers.length<=1){statusText.textContent='Debe existir una capa';return;}hist();layers.splice(active,1);active=Math.max(0,active-1);renderLayers();draw();};
saveBtn.onclick=function(){localStorage.setItem('pixelStudioProject',JSON.stringify({size:gridSize,active:active,layers:layers}));statusText.textContent='Proyecto guardado';};
loadBtn.onclick=function(){var raw=localStorage.getItem('pixelStudioProject');if(!raw){statusText.textContent='No hay proyecto guardado';return;}var pr=JSON.parse(raw);hist();gridSize=pr.size;active=pr.active||0;layers=pr.layers||[{name:'Capa 1',visible:true,pixels:pr.data}];sizeSelect.value=String(gridSize);renderLayers();draw();statusText.textContent='Proyecto cargado';};
undoBtn.onclick=function(){if(!undo.length){statusText.textContent='Nada que deshacer';return;}redo.push({size:gridSize,active:active,layers:copyLayers(layers)});restore(undo.pop());};
redoBtn.onclick=function(){if(!redo.length){statusText.textContent='Nada que rehacer';return;}undo.push({size:gridSize,active:active,layers:copyLayers(layers)});restore(redo.pop());};
importBtn.onclick=function(){importInput.click();};
importInput.onchange=function(e){var f=e.target.files[0];if(!f)return;var img=new Image();img.onload=function(){hist();var c=document.createElement('canvas');c.width=gridSize;c.height=gridSize;var ic=c.getContext('2d');ic.imageSmoothingEnabled=false;ic.drawImage(img,0,0,gridSize,gridSize);var d=ic.getImageData(0,0,gridSize,gridSize).data;var p=layers[active].pixels;for(var y=0;y<gridSize;y++){for(var x=0;x<gridSize;x++){var k=(y*gridSize+x)*4;if(d[k+3]===0)p[y][x]='';else p[y][x]='#'+[d[k],d[k+1],d[k+2]].map(function(v){return v.toString(16).padStart(2,'0');}).join('');}}draw();statusText.textContent='Imagen importada';};img.src=URL.createObjectURL(f);importInput.value='';};
function exp(scale){var out=document.createElement('canvas');out.width=gridSize*scale;out.height=gridSize*scale;var oc=out.getContext('2d');oc.imageSmoothingEnabled=false;for(var l=0;l<layers.length;l++){if(!layers[l].visible)continue;var p=layers[l].pixels;for(var y=0;y<gridSize;y++){for(var x=0;x<gridSize;x++){if(p[y][x]){oc.fillStyle=p[y][x];oc.fillRect(x*scale,y*scale,scale,scale);}}}}out.toBlob(function(blob){var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='pixel-studio-'+gridSize+'x'+gridSize+'-x'+scale+'.png';document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(url);},1000);statusText.textContent='PNG exportado';},'image/png');}
exportBtn.onclick=function(){exp(16);};
init();renderLayers();applyZoom();draw();
