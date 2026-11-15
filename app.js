'use strict';
/* DARK CYBER PRO — fictional simulator. No network access, no real scanning. */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[rnd(0,a.length-1)];
const pad=n=>String(n).padStart(2,'0');
const hex=n=>Array.from({length:n},()=>rnd(0,15).toString(16)).join('').toUpperCase();
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const hash=s=>{let x=5381;for(const c of s)x=((x*33)^c.charCodeAt(0))>>>0;return x.toString(36)};
const MCH='01ABCDEF<>{}[]/\\|#$%&*アカサタナハマヤラワ';
const busy={};let user='',mt=null;

/* ---------- Matrix background ---------- */
(function(){const c=$('#bg'),x=c.getContext('2d');let drops=[];
function size(){c.width=innerWidth;c.height=innerHeight;drops=Array.from({length:Math.ceil(c.width/16)},()=>rnd(-50,0))}
size();addEventListener('resize',size);
setInterval(()=>{x.fillStyle='rgba(6,3,12,.12)';x.fillRect(0,0,c.width,c.height);x.fillStyle=getComputedStyle(document.body).getPropertyValue('--a').trim()||'#ff2a4d';x.font='14px monospace';
drops.forEach((d,i)=>{x.fillText(MCH[rnd(0,MCH.length-1)],i*16,d*16);drops[i]=(d*16>c.height&&Math.random()>.97)?0:d+1})},60)})();

/* ---------- Theme / clock / log ---------- */
function theme(t){document.body.dataset.theme=t;store.set('dcp_theme',t)}
theme(store.get('dcp_theme','red'));
$('#themeBtn').onclick=()=>{theme(document.body.dataset.theme==='red'?'purple':'red');log('Theme switched (saved locally)')};
function tick(){const d=new Date();$('#clock').textContent=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())}
tick();setInterval(tick,1000);
function log(m){
 const now=Date.now(),entry={time:now,message:String(m).slice(0,180)};
 const history=store.get('dcp_activity',[]);history.push(entry);store.set('dcp_activity',history.slice(-500));
 const li=document.createElement('li'),t=document.createElement('time');t.textContent=new Date(now).toLocaleTimeString()+' ';li.append(t,entry.message);const u=$('#log');u.prepend(li);while(u.children.length>30)u.lastChild.remove()
}
$('#b-clog').onclick=()=>{$('#log').innerHTML=''};

/* ---------- Auth ---------- */
function msg(t,ok){const m=$('#authMsg');m.textContent=t;m.className=ok?'ok':'err'}
$$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(b=>b.classList.toggle('active',b===t));$('#loginForm').classList.toggle('hidden',t.dataset.tab!=='login');$('#regForm').classList.toggle('hidden',t.dataset.tab!=='reg');msg('')});
$('#demo').onclick=()=>{$('#lu').value='admin';$('#lp').value='dark123'};
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
$('#loginForm').onsubmit=e=>{e.preventDefault();const u=$('#lu').value.trim(),p=$('#lp').value,users=store.get('dcp_users',{});
 if((u==='admin'&&p==='dark123')||(has(users,u)&&users[u]===hash(p)))enter(u);else msg('ACCESS DENIED: invalid credentials. Demo: admin / dark123')};
$('#regForm').onsubmit=e=>{e.preventDefault();const u=$('#ru').value.trim(),p=$('#rp').value,users=store.get('dcp_users',{});
 if(!/^[\w.-]{3,16}$/.test(u)||u==='__proto__')return msg('Username: 3-16 letters, digits, . _ -');
 if(u.toLowerCase()==='admin'||has(users,u))return msg('Username already taken');
 if(p.length<4)return msg('Password must be at least 4 characters');
 if(p!==$('#rp2').value)return msg('Passwords do not match');
 users[u]=hash(p);store.set('dcp_users',users);$$('.tab')[0].click();msg('Local account created. You can log in now.',true);$('#lu').value=u;$('#lp').value='';$('#lp').focus()};
async function transition(text,ms){const t=$('#trans'),b=$('#tbar');$('#ttxt').textContent=text;t.classList.remove('hidden');b.style.transition='none';b.style.width='0';void b.offsetWidth;b.style.transition='width '+ms+'ms linear';b.style.width='100%';await sleep(ms+100)}
async function enter(u){user=u;await transition('AUTHENTICATING '+u.toUpperCase()+'...',1400);
 $('#auth').classList.add('hidden');$('#app').classList.remove('hidden');$('#who').textContent='OPERATOR: '+u.toUpperCase();$('#op').textContent=u.toUpperCase();
 $('#lp').value='';show('dash');log('Operator '+u+' logged in (simulated session)');termBanner();$('#trans').classList.add('hidden')}
$('#logout').onclick=async()=>{if(mt)toggleMat(false);await transition('TERMINATING SESSION...',900);
 $('#app').classList.add('hidden');$('#auth').classList.remove('hidden');$('#trans').classList.add('hidden');msg('Logged out safely.',true)};

/* ---------- Navigation ---------- */
function show(v){$$('.view').forEach(s=>s.classList.toggle('active',s.id==='v-'+v));$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.v===v));
 $('#side').classList.remove('open');if(mt)toggleMat(false);if(v==='sec')renderSec();if(v==='term')$('#ti').focus();$('#views').scrollTop=0}
$$('#nav button').forEach(b=>b.onclick=()=>show(b.dataset.v));
$('#menuBtn').onclick=()=>$('#side').classList.toggle('open');

/* ---------- Simulation line generators ---------- */
function scanLines(){const L=['[SIMULATION] Target: 192.0.2.0/24 (reserved documentation range)','[SIMULATION] No network traffic is generated','Initializing fictional scan engine v1.0...'];
 for(let i=0;i<6;i++)L.push('192.0.2.'+rnd(2,254)+'  UP  ports: '+([22,80,443,3306,8080].filter(()=>Math.random()>.5).join(',')||'none')+'  [fictional]');
 L.push('Scan complete. 6 fictional hosts found. [SIMULATED RESULT]');return L}
function fwLines(){const R=['SYN flood filter','Port-knock guard','Geo-block rules','Deep packet inspection','Rate limiter','Signature database'];let ok=0;
 const L=['[SIMULATION] Testing a pretend firewall — nothing real is probed'];
 R.forEach(r=>{const p=Math.random()>.25;if(p)ok++;L.push('Testing '+r+' ... '+(p?'PASSED':'WARNING'))});
 L.push('Fictional firewall score: '+Math.round(ok/R.length*100)+'/100 [SIMULATED RESULT]');return L}
function decLines(){return ['[SIMULATION] Loading built-in fictional ciphertext...','Cipher: FAKE-AES-999 (not a real algorithm)','Key: '+hex(16),'Block 1: '+hex(24)+' -> OK','Block 2: '+hex(24)+' -> OK','Block 3: '+hex(24)+' -> OK','Integrity check ... PASSED','DECRYPTED: "THIS MESSAGE IS PURE FICTION. WELCOME, OPERATOR."','[SIMULATED RESULT]']}
function accLines(){return ['[SIMULATION] Cinematic sequence — no system is contacted','Bypassing fictional firewall ... done','Spoofing imaginary token ... done','Handshake with node '+hex(8)+' (fake) ... done','Escalating pretend privileges ... done','Mounting virtual drive /dev/fiction ... done','ACCESS GRANTED [SIMULATED]']}
const glyphs=()=>Array.from({length:60},()=>MCH[rnd(0,MCH.length-1)]).join('');

/* ---------- Generic animated module runner ---------- */
async function play(id,L){if(busy[id])return;busy[id]=1;
 const o=$('#o-'+id),p=$('#p-'+id),t=$('#t-'+id),b=$('#b-'+id);if(b)b.disabled=true;if(o)o.textContent='';p.style.width='0';
 for(let i=0;i<L.length;i++){if(o){o.textContent+=L[i]+'\n';o.scrollTop=o.scrollHeight}if(t)t.textContent=L[i];p.style.width=((i+1)/L.length*100)+'%';await sleep(rnd(180,380))}
 if(id==='acc')$('#flash').classList.remove('hidden');
 log(id.toUpperCase()+' simulation complete');if(b)b.disabled=false;busy[id]=0}
const MODS={
 scan:{t:'FAKE IP SCANNER',b:'START SIMULATED SCAN',n:'Only the reserved documentation range 192.0.2.0/24 is "scanned". No packets are ever sent.',f:scanLines},
 fw:{t:'FAKE FIREWALL TESTING',b:'RUN FIREWALL TEST',n:'A pretend firewall with randomly generated outcomes.',f:fwLines},
 dec:{t:'FAKE DATA DECRYPTION',b:'DECRYPT SAMPLE',n:'Decrypts a built-in fictional sample only.',f:decLines},
 acc:{t:'FAKE SYSTEM ACCESS',b:'INITIATE ACCESS SEQUENCE',n:'Cinematic animation. No real system is touched.',f:accLines}};
Object.entries(MODS).forEach(([k,m])=>{const s=document.createElement('section');s.className='view';s.id='v-'+k;
 s.innerHTML='<h2>'+m.t+'</h2><p class="sub">'+m.n+' Results are <b>SIMULATED</b>.</p><div class="card"><button class="btn" id="b-'+k+'">'+m.b+'</button><div class="bar"><i id="p-'+k+'"></i></div><pre class="out" id="o-'+k+'">Ready. Press the button to begin.</pre></div>';
 $('#views').append(s);$('#b-'+k).onclick=()=>play(k,m.f())});
$('#b-dash').onclick=()=>play('dash',scanLines());

/* ---------- Password analysis (local, for show) ---------- */
function fmtTime(s){if(s<1)return'instantly';if(s>3.15e9)return'over 100 years';for(const[n,v]of[['years',31536000],['days',86400],['hours',3600],['minutes',60],['seconds',1]])if(s>=v)return Math.round(s/v).toLocaleString()+' '+n;return'instantly'}
$('#b-pass').onclick=async()=>{const v=$('#i-pass').value;if(busy.pass)return;
 if(!v){$('#o-pass').textContent='Enter a sample password first (it never leaves this page).';return}
 let pool=0;if(/[a-z]/.test(v))pool+=26;if(/[A-Z]/.test(v))pool+=26;if(/\d/.test(v))pool+=10;if(/[^a-zA-Z0-9]/.test(v))pool+=33;
 const bits=Math.round(v.length*Math.log2(pool)),score=Math.min(100,Math.round(bits*1.25)),secs=Math.pow(2,bits)/1e10;
 const label=score<35?'WEAK':score<65?'MODERATE':score<85?'STRONG':'EXCELLENT';
 $('#m-pass').style.width='0';
 await play('pass',['[SIMULATION] Analyzing sample locally — nothing is cracked or transmitted','Length: '+v.length+' characters','Character pool: '+pool+' symbols','Estimated entropy: ~'+bits+' bits','Pretend crack time (fictional 10 billion guesses/sec): '+fmtTime(secs),'Verdict: '+label+' ('+score+'/100) [SIMULATED RESULT]']);
 $('#m-pass').style.width=score+'%'};

/* ---------- Matrix generator ---------- */
function toggleMat(on){const b=$('#b-mat');if(on===undefined)on=!mt;clearInterval(mt);mt=null;b.textContent=on?'STOP GENERATOR':'START GENERATOR';
 if(on)mt=setInterval(()=>{const o=$('#o-mat'),L=o.textContent.split('\n');L.push(Array.from({length:70},()=>MCH[rnd(0,MCH.length-1)]).join(''));o.textContent=L.slice(-22).join('\n')},430-$('#r-mat').value)}
$('#b-mat').onclick=()=>{toggleMat();if(mt)log('Matrix generator started')};
$('#b-cmat').onclick=()=>{$('#o-mat').textContent=''};
$('#r-mat').oninput=()=>{if(mt)toggleMat(true)};

/* ---------- Security dashboard ---------- */
function renderSec(){
 $('#gauges').innerHTML=['FIREWALL','ENCRYPTION','INTRUSION RISK','PATCH LEVEL'].map(n=>{const v=rnd(35,99);return '<div class="card gwrap"><div class="gauge" style="--v:'+v+'"><b>'+v+'%</b></div><small>'+n+'</small></div>'}).join('');
 $('#threats').innerHTML=['Fictional port sweep from 198.51.100.7','Imaginary phishing kit detected','Simulated brute-force pattern','Pretend malware signature','Fake privilege escalation attempt'].map(t=>{const s=pick(['LOW','MED','HIGH']);return '<li><span class="tag '+s+'">'+s+'</span> '+t+' <em>[SIMULATED]</em></li>'}).join('')}
$('#b-sec').onclick=()=>{renderSec();log('Security metrics refreshed (fictional)')};

/* ---------- Terminal ---------- */
const hist=[];let hi=0,tbusy=false;
function tp(t,c){const d=document.createElement('div');if(c)d.className=c;d.textContent=t;$('#tout').append(d);$('#tout').scrollTop=1e9}
function termBanner(){$('#tout').innerHTML='';['DARK CYBER PRO terminal v1.0 — FICTIONAL SIMULATION','Nothing here touches real systems. Type "help".',''].forEach(l=>tp(l))}
const TC={
 help:()=>['Available commands:','  help     show this list','  status   fictional system status','  scan     simulated scan of 192.0.2.0/24','  matrix   print random code','  decrypt  decrypt a fictional sample','  clear    clear the screen','  whoami   show operator info'],
 status:()=>['[SIMULATED STATUS]','Core:      ONLINE','Firewall:  '+rnd(80,99)+'% (fictional)','Uplink:    '+rnd(20,90)+' Mb/s (fake)','Threats:   '+rnd(0,5)+' imaginary'],
 whoami:()=>[user,'role: SIMULATED OPERATOR','clearance: LEVEL 9 (fictional)'],
 scan:scanLines,decrypt:decLines,
 matrix:()=>Array.from({length:6},glyphs)};
async function exec(raw){const c=raw.trim().toLowerCase();tp('operator@darkcyber:~$ '+raw,'cmd');if(!c)return;hist.push(raw);hi=hist.length;
 if(c==='clear'){$('#tout').innerHTML='';return}
 const f=TC[c];if(!f){tp('"'+c+'": command not found. Type "help".','err');return}
 tbusy=true;const slow=c==='scan'||c==='decrypt';for(const l of f()){tp(l);await sleep(slow?200:40)}tbusy=false;log('Terminal: '+c)}
$('#tf').onsubmit=async e=>{e.preventDefault();if(tbusy)return;const i=$('#ti'),v=i.value;i.value='';await exec(v)};
$('#ti').onkeydown=e=>{if(e.key==='ArrowUp'&&hi>0){hi--;e.target.value=hist[hi];e.preventDefault()}else if(e.key==='ArrowDown'){hi=Math.min(hi+1,hist.length);e.target.value=hist[hi]||'';e.preventDefault()}};

/* ---------- Dashboard live data ---------- */
const st={cpu:30,mem:50,net:40,thr:20},nd=Array(40).fill(30);
function drawNet(){const c=$('#net'),x=c.getContext('2d'),col=getComputedStyle(document.body).getPropertyValue('--a').trim();x.clearRect(0,0,c.width,c.height);x.strokeStyle=col;x.lineWidth=2;x.shadowColor=col;x.shadowBlur=10;x.beginPath();
 nd.forEach((v,i)=>{const X=i*c.width/(nd.length-1),Y=c.height-4-v*(c.height-8)/100;i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke()}
setInterval(()=>{for(const k in st)st[k]=Math.max(5,Math.min(98,st[k]+rnd(-8,8)));
 [['cpu','%'],['mem','%'],['net',' Mb/s'],['thr','%']].forEach(([k,u])=>{$('#s-'+k).textContent=st[k]+u;$('#sb-'+k).style.width=st[k]+'%'});nd.push(st.net);nd.shift();drawNet()},1500);
const ML=['[ok] sandbox kernel online','[..] syncing fictional nodes','[ok] encryption layer: SIMULATED','[!!] imaginary anomaly isolated','[ok] heartbeat 192.0.2.1 (fake)','[..] rotating pretend keys'];
let mi=[];setInterval(()=>{mi.push(new Date().toLocaleTimeString()+' '+pick(ML));mi=mi.slice(-9);$('#mini').textContent=mi.join('\n')},900);

/* =========================================================
   DARK CYBER PRO ULTRA — selected feature pack
   3D globe, sandbox code studio, missions/levels, settings
   ========================================================= */

/* ---------- 3D Cyber Globe (local visual simulation) ---------- */
const globeCanvas = $('#globeCanvas');
const globeCtx = globeCanvas.getContext('2d');
let globeAngle = 0;
let globeRunning = true;
let globeRAF = 0;
let globeSignals = [];
let globeLastTime = 0;
const globeLandDots=[];
[[ -15,-65,35,25],[-5,20,38,18],[35,65,35,24],[-25,125,25,35],[5,-105,18,18],[-35,145,12,18]].forEach(([lat,lon,latSpan,lonSpan])=>{
  for(let i=0;i<90;i++)globeLandDots.push({lat:lat+(Math.random()-.5)*latSpan,lon:lon+(Math.random()-.5)*lonSpan});
});

function regenerateGlobeSignals(){
  const labels = ['NODE','BEACON','RELAY','SENSOR','ORBIT'];
  globeSignals = Array.from({length:12},(_,i)=>({
    lat:rnd(-65,65), lon:rnd(-180,180), name:labels[i%labels.length]+'-'+String(i+1).padStart(2,'0'),
    strength:rnd(42,99), hue:i%3
  }));
  $('#globeNodes').textContent = globeSignals.length;
  $('#globeFeed').innerHTML = '';
  globeSignals.slice(0,8).forEach(signal=>{
    const li=document.createElement('li');
    li.textContent=signal.name+'  ·  SIGNAL '+signal.strength+'%  ·  SIMULATED';
    $('#globeFeed').appendChild(li);
  });
}

function projectGlobe(lat,lon,cx,cy,radius){
  const la=lat*Math.PI/180;
  const lo=(lon+globeAngle)*Math.PI/180;
  const x=Math.cos(la)*Math.sin(lo);
  const y=Math.sin(la);
  const z=Math.cos(la)*Math.cos(lo);
  return {x:cx+x*radius,y:cy-y*radius,z};
}

function drawGlobe(){
  const ctx=globeCtx, w=globeCanvas.width, h=globeCanvas.height;
  const cx=w/2,cy=h/2,r=215;
  ctx.clearRect(0,0,w,h);
  const sphere=ctx.createRadialGradient(cx-r*.35,cy-r*.35,10,cx,cy,r*1.3);
  sphere.addColorStop(0,'#16496b');sphere.addColorStop(.58,'#09253a');sphere.addColorStop(1,'#020711');
  ctx.fillStyle=sphere;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
  ctx.strokeStyle='rgba(69,205,255,.32)';ctx.lineWidth=1;
  for(let lat=-60;lat<=60;lat+=30){
    ctx.beginPath();let started=false;
    for(let lon=-180;lon<=180;lon+=3){const p=projectGlobe(lat,lon,cx,cy,r);if(p.z>=0){if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)}else started=false;}
    ctx.stroke();
  }
  for(let lon=0;lon<180;lon+=30){
    ctx.beginPath();let started=false;
    for(let lat=-89;lat<=89;lat+=2){const p=projectGlobe(lat,lon,cx,cy,r);if(p.z>=0){if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)}else started=false;}
    ctx.stroke();
  }
  // Stylized continent-like clusters: decorative dots, not geographic data.
  ctx.fillStyle='rgba(71,210,166,.46)';
  globeLandDots.forEach(dot=>{
    const p=projectGlobe(dot.lat,dot.lon,cx,cy,r);
    if(p.z>0){ctx.globalAlpha=.25+p.z*.45;ctx.fillRect(p.x,p.y,2.2,2.2);}
  });
  ctx.globalAlpha=1;
  globeSignals.forEach((signal,i)=>{
    const p=projectGlobe(signal.lat,signal.lon,cx,cy,r);
    if(p.z>0){
      const color=['#41e7ff','#ff4f76','#a77cff'][signal.hue];
      ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=12;
      ctx.beginPath();ctx.arc(p.x,p.y,3.5+p.z*2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      if(i%3===0){ctx.fillStyle='#d9f7ff';ctx.font='10px Consolas';ctx.fillText(signal.name,p.x+7,p.y-6);}
    }
  });
  ctx.restore();
  ctx.strokeStyle='rgba(65,220,255,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='rgba(65,220,255,.08)';ctx.beginPath();ctx.ellipse(cx,cy+r+8,r*.78,13,0,0,Math.PI*2);ctx.fill();
}

function globeLoop(time){
  if(!globeRunning || !$('#v-globe').classList.contains('active'))return;
  const delta=globeLastTime?Math.min(40,time-globeLastTime):16;globeLastTime=time;
  globeAngle=(globeAngle+delta*.006)%360;
  drawGlobe();
  globeRAF=requestAnimationFrame(globeLoop);
}
function startGlobe(){
  globeRunning=true;globeLastTime=0;$('#globeState').textContent='ROTATING · SIMULATED';
  $('#globeToggle').textContent='PAUSE ROTATION';cancelAnimationFrame(globeRAF);globeRAF=requestAnimationFrame(globeLoop);
}
function pauseGlobe(){
  globeRunning=false;cancelAnimationFrame(globeRAF);$('#globeState').textContent='PAUSED';$('#globeToggle').textContent='RESUME ROTATION';drawGlobe();
}
$('#globeToggle').addEventListener('click',()=>{if(globeRunning)pauseGlobe();else startGlobe();});
$('#globeRefresh').addEventListener('click',()=>{regenerateGlobeSignals();drawGlobe();log('Globe signal markers regenerated locally.');});
regenerateGlobeSignals();drawGlobe();

/* ---------- Advanced Code Studio ---------- */
const studioTemplates={
 starter:{
  html:'<main class="hero">\n  <p class="eyebrow">DARK CYBER LAB</p>\n  <h1>Hello, Operator.</h1>\n  <p>Build something creative with HTML, CSS and JavaScript.</p>\n  <button id="demoButton">Activate demo</button>\n  <p id="message">Waiting for input...</p>\n</main>',
  css:'* { box-sizing: border-box; }\nbody { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #080b14; color: #eaf4ff; font-family: Arial, sans-serif; }\n.hero { text-align: center; padding: 40px; }\n.eyebrow { color: #00d9ff; letter-spacing: 4px; }\nh1 { font-size: clamp(32px, 7vw, 64px); }\nbutton { padding: 12px 20px; border: 0; border-radius: 8px; background: #00a9c7; color: white; cursor: pointer; }',
  js:'document.getElementById("demoButton").addEventListener("click", () => {\n  document.getElementById("message").textContent = "Demo activated successfully!";\n});'
 },
 card:{
  html:'<article class="profile">\n  <div class="avatar">DC</div>\n  <h1>Cyber Creator</h1>\n  <p>Frontend developer · UI explorer</p>\n  <button id="follow">Follow</button>\n  <p id="count">0 followers</p>\n</article>',
  css:'body { min-height:100vh; display:grid; place-items:center; margin:0; background:#0b1020; color:#f2f5ff; font-family:Arial,sans-serif; }\n.profile { text-align:center; padding:32px; border:1px solid #31405d; border-radius:18px; background:#141d32; width:min(320px,85vw); }\n.avatar { margin:auto; display:grid; place-items:center; width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#00d9ff,#8b42ff); font-size:25px; font-weight:bold; }\nbutton { border:0; border-radius:20px; padding:10px 24px; background:#00b9d7; color:#001018; cursor:pointer; }',
  js:'let followers = 0;\ndocument.getElementById("follow").addEventListener("click", () => {\n  followers += 1;\n  document.getElementById("count").textContent = followers + " followers";\n});'
 },
 counter:{
  html:'<main class="counter">\n  <h1>Counter Lab</h1>\n  <strong id="value">0</strong>\n  <div><button id="minus">−</button><button id="plus">+</button><button id="reset">Reset</button></div>\n</main>',
  css:'body { margin:0; min-height:100vh; display:grid; place-items:center; background:#080b12; color:white; font-family:Arial,sans-serif; text-align:center; }\n.counter { padding:35px; border-radius:16px; background:#151e30; }\nstrong { display:block; font-size:70px; margin:15px; color:#00d9ff; }\nbutton { margin:5px; padding:12px 18px; border:0; border-radius:8px; cursor:pointer; }',
  js:'let value = 0;\nconst output = document.getElementById("value");\nfunction render() { output.textContent = value; }\ndocument.getElementById("plus").onclick = () => { value++; render(); };\ndocument.getElementById("minus").onclick = () => { value--; render(); };\ndocument.getElementById("reset").onclick = () => { value = 0; render(); };'
 }
};
function loadStudioTemplate(){
 const t=studioTemplates[$('#studioTemplate').value]||studioTemplates.starter;
 $('#studioHTML').value=t.html;$('#studioCSS').value=t.css;$('#studioJS').value=t.js;
 $('#studioStatus').textContent='TEMPLATE LOADED';
}
function runStudioPreview(){
 const html=$('#studioHTML').value;
 const css=$('#studioCSS').value.replace(/<\/style/gi,'<\\/style');
 const js=$('#studioJS').value.replace(/<\/script/gi,'<\\/script');
 const policy="default-src 'none'; img-src data: blob:; media-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'";
 const documentText='<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+policy+'"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body>'+html+'<script>'+js+'</'+'script></body></html>';
 $('#studioPreview').srcdoc=documentText;
 $('#studioStatus').textContent='PREVIEW UPDATED · SANDBOXED';
 completeMission('studio');log('Code Studio sandbox preview updated.');
}
$('#studioTemplate').addEventListener('change',loadStudioTemplate);
$('#studioRun').addEventListener('click',runStudioPreview);
$('#studioReset').addEventListener('click',()=>{loadStudioTemplate();runStudioPreview();});
loadStudioTemplate();

/* ---------- Missions, XP, ranks and achievements ---------- */
const missionDefs=[
 {id:'globe',title:'Explore the 3D Globe',desc:'Open the globe and rotate the visual model.',xp:20},
 {id:'studio',title:'Run a Code Studio Preview',desc:'Run one of the local starter templates.',xp:30},
 {id:'theme',title:'Choose a New Theme',desc:'Change the interface colour theme.',xp:15},
 {id:'custom',title:'Save Your Settings',desc:'Save a customization profile.',xp:20},
 {id:'scan',title:'Complete a Demo Scan',desc:'Run the fictional dashboard scan.',xp:20},
 {id:'terminal',title:'Visit the Terminal',desc:'Run a harmless local terminal command.',xp:15}
];
const achievementDefs=[
 {id:'first',title:'First Steps',desc:'Earn your first 20 XP.',test:s=>s.xp>=20},
 {id:'builder',title:'Creative Builder',desc:'Run a Code Studio preview.',test:s=>s.done.includes('studio')},
 {id:'designer',title:'Theme Designer',desc:'Choose a new interface theme.',test:s=>s.done.includes('theme')},
 {id:'explorer',title:'Globe Explorer',desc:'Explore the 3D Globe.',test:s=>s.done.includes('globe')},
 {id:'veteran',title:'Cyber Veteran',desc:'Reach 100 XP.',test:s=>s.xp>=100},
 {id:'master',title:'Ultra Operator',desc:'Complete every mission.',test:s=>s.done.length>=missionDefs.length}
];
let missionState=store.get('dcp_ultra_missions',{xp:0,done:[]});
if(!missionState || !Array.isArray(missionState.done) || typeof missionState.xp!=='number')missionState={xp:0,done:[]};
function rankFor(level){if(level>=8)return'ULTRA';if(level>=5)return'ELITE';if(level>=3)return'EXPERT';if(level>=2)return'OPERATOR';return'ROOKIE';}
function completeMission(id){
 const mission=missionDefs.find(m=>m.id===id);
 if(!mission||missionState.done.includes(id))return;
 missionState.done.push(id);missionState.xp+=mission.xp;
 store.set('dcp_ultra_missions',missionState);renderMissions();
 log('Mission completed: '+mission.title+' (+'+mission.xp+' XP)');
}
function renderMissions(){
 const level=Math.floor(missionState.xp/100)+1;
 const current=missionState.xp%100;
 $('#operatorLevel').textContent='LEVEL '+level;
 $('#totalXP').textContent=missionState.xp;
 $('#missionsDone').textContent=missionState.done.length+' / '+missionDefs.length;
 $('#operatorRank').textContent=rankFor(level);
 $('#rankCaption').textContent=level>=8?'Top local rank': 'Next level at '+(level*100)+' XP';
 $('#xpLabel').textContent=current+' / 100 XP';$('#levelBar').style.width=current+'%';
 $('#missionList').innerHTML='';
 missionDefs.forEach(m=>{
  const done=missionState.done.includes(m.id),row=document.createElement('div');row.className='mission-item'+(done?' done':'');
  const info=document.createElement('div'),title=document.createElement('b'),desc=document.createElement('p');
  title.textContent=(done?'✓ ':'')+m.title;desc.textContent=m.desc+'  ·  '+m.xp+' XP';info.append(title,desc);
  const btn=document.createElement('button');btn.className='btn'+(done?' ghost':'');btn.textContent=done?'COMPLETED':'MARK COMPLETE';btn.disabled=done;btn.addEventListener('click',()=>completeMission(m.id));
  row.append(info,btn);$('#missionList').appendChild(row);
 });
 $('#achievementList').innerHTML='';
 achievementDefs.forEach(a=>{
  const unlocked=a.test(missionState),row=document.createElement('div');row.className='achievement-item'+(unlocked?'':' locked');
  const info=document.createElement('div'),title=document.createElement('b'),desc=document.createElement('p');
  title.textContent=(unlocked?'🏆 ':'🔒 ')+a.title;desc.textContent=a.desc;info.append(title,desc);
  const status=document.createElement('span');status.className='xp';status.textContent=unlocked?'UNLOCKED':'LOCKED';row.append(info,status);$('#achievementList').appendChild(row);
 });
}
$('#resetProgress').addEventListener('click',()=>{
 if(!confirm('Reset all local mission XP and achievements?'))return;
 missionState={xp:0,done:[]};store.set('dcp_ultra_missions',missionState);renderMissions();
});
renderMissions();

/* ---------- Customization Center ---------- */
const defaultSettings={theme:'red',matrix:true,glow:true,reduced:false,density:'normal',font:'system'};
let customSettings={...defaultSettings,...store.get('dcp_ultra_settings',{})};
function applySettings(){
 document.body.dataset.theme=customSettings.theme;
 $('#bg').classList.toggle('bg-off',!customSettings.matrix);
 document.body.classList.toggle('no-glow',!customSettings.glow);
 document.body.classList.toggle('reduced-motion',!!customSettings.reduced);
 document.body.classList.toggle('compact',customSettings.density==='compact');
 document.body.classList.toggle('mono-font',customSettings.font==='mono');
 $('#themeSelect').value=customSettings.theme;$('#matrixToggle').checked=!!customSettings.matrix;
 $('#glowToggle').checked=!!customSettings.glow;$('#motionToggle').checked=!!customSettings.reduced;
 $('#densitySelect').value=customSettings.density;$('#fontSelect').value=customSettings.font;
}
function readSettings(){
 customSettings={theme:$('#themeSelect').value,matrix:$('#matrixToggle').checked,glow:$('#glowToggle').checked,
 reduced:$('#motionToggle').checked,density:$('#densitySelect').value,font:$('#fontSelect').value};
 applySettings();
}
['themeSelect','matrixToggle','glowToggle','motionToggle','densitySelect','fontSelect'].forEach(id=>{
 $('#'+id).addEventListener('change',()=>{readSettings();if(id==='themeSelect')completeMission('theme');$('#settingsStatus').textContent='Preview applied. Press SAVE SETTINGS to keep it.';});
});
$('#saveSettings').addEventListener('click',()=>{
 readSettings();store.set('dcp_ultra_settings',customSettings);store.set('dcp_theme',customSettings.theme);
 $('#settingsStatus').textContent='Settings saved locally.';completeMission('custom');log('Customization settings saved.');
});
$('#resetSettings').addEventListener('click',()=>{
 customSettings={...defaultSettings};store.set('dcp_ultra_settings',customSettings);store.set('dcp_theme','red');applySettings();
 $('#settingsStatus').textContent='Default settings restored.';
});
// Keep the header theme shortcut in sync with the full theme picker.
$('#themeBtn').onclick=()=>{
 const names=['red','purple','cyan','green'];
 const index=names.indexOf(document.body.dataset.theme);
 customSettings.theme=names[(index+1)%names.length];
 $('#themeSelect').value=customSettings.theme;applySettings();
 store.set('dcp_ultra_settings',customSettings);store.set('dcp_theme',customSettings.theme);
 completeMission('theme');log('Theme changed to '+customSettings.theme+'.');
};
applySettings();

/* ---------- Connect navigation and existing activities ---------- */
const originalShow=show;
show=function(view){
 originalShow(view);
 if(view==='globe'){completeMission('globe');if(globeRunning)startGlobe();else drawGlobe();}
 else {if(globeRunning)pauseGlobe();}
 if(view==='studio')$('#studioHTML').focus({preventScroll:true});
 if(view==='missions')renderMissions();
 if(view==='custom')applySettings();
 if(view==='term')completeMission('terminal');
};
$('#b-scan').addEventListener('click',()=>completeMission('scan'));
$('#b-dash').addEventListener('click',()=>completeMission('scan'));
$('#tf').addEventListener('submit',()=>completeMission('terminal'));


/* =========================================================
   V2 FEATURES: Radar, analytics, command center, profile,
   synthesized audio visualizer, boot sequence and mouse FX.
   All activity is local and fictional.
   ========================================================= */

// Cinematic boot screen: progress is purely decorative.
(function bootSequence(){
 const screen=$('#bootScreen'),bar=$('#bootProgress'),status=$('#bootStatus');
 if(!screen)return;
 const stages=['LOADING INTERFACE MODULES...','PREPARING LOCAL DEMO DATA...','STARTING VISUAL SYSTEMS...','READY'];
 let n=0;const timer=setInterval(()=>{n=Math.min(100,n+4+rnd(0,9));bar.style.width=n+'%';status.textContent=stages[Math.min(stages.length-1,Math.floor(n/26))];if(n>=100){clearInterval(timer);setTimeout(()=>screen.classList.add('done'),250)}},90);
})();

// Advanced radar: randomly generated contact points; never reads network/GPS.
const radarCanvas=$('#radarCanvas'),radarCtx=radarCanvas.getContext('2d');
let radarContacts=[],radarAngle=0,radarActive=true,radarFrame=0;
function refreshRadar(){
 const names=['ECHO','NOVA','GHOST','PULSE','ORBIT','DELTA','SIGMA','VEGA'];
 radarContacts=names.map((name,i)=>({name:name+'-'+String(i+1).padStart(2,'0'),a:Math.random()*Math.PI*2,r:.18+Math.random()*.72,power:rnd(35,99)}));
 $('#radarCount').textContent=radarContacts.length;$('#radarFeed').innerHTML='';
 radarContacts.forEach(c=>{const li=document.createElement('li');li.textContent=c.name+' · '+c.power+'% · FICTIONAL';$('#radarFeed').appendChild(li)});
 drawRadar();
}
function drawRadar(){
 const c=radarCanvas,x=radarCtx,w=c.width,h=c.height,cx=w/2,cy=h/2,R=Math.min(w,h)*.42;
 x.clearRect(0,0,w,h);x.save();x.translate(cx,cy);
 x.strokeStyle='rgba(44,240,183,.28)';x.lineWidth=1;
 for(let k=1;k<=4;k++){x.beginPath();x.arc(0,0,R*k/4,0,Math.PI*2);x.stroke()}
 for(let a=0;a<Math.PI*2;a+=Math.PI/4){x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*R,Math.sin(a)*R);x.stroke()}
 const grad=x.createConicalGradient?null:null;
 const sweep=x.createLinearGradient(0,0,Math.cos(radarAngle)*R,Math.sin(radarAngle)*R);sweep.addColorStop(0,'rgba(41,255,186,0)');sweep.addColorStop(1,'rgba(41,255,186,.85)');
 x.strokeStyle=sweep;x.lineWidth=5;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(radarAngle)*R,Math.sin(radarAngle)*R);x.stroke();
 radarContacts.forEach((p,i)=>{const px=Math.cos(p.a)*R*p.r,py=Math.sin(p.a)*R*p.r;x.fillStyle=i%2?'#00d9ff':'#54ffad';x.shadowColor=x.fillStyle;x.shadowBlur=13;x.beginPath();x.arc(px,py,4+(p.power/100)*3,0,Math.PI*2);x.fill();x.shadowBlur=0;if(i%2===0){x.fillStyle='#bfffee';x.font='12px Consolas';x.fillText(p.name,px+9,py-7)}});
 x.restore();x.fillStyle='#75ffd0';x.font='12px Consolas';x.fillText('LOCAL SIMULATION ONLY',14,24);
}
function radarLoop(){if(!radarActive||!$('#v-radar').classList.contains('active'))return;radarAngle=(radarAngle+.018)%(Math.PI*2);drawRadar();radarFrame=requestAnimationFrame(radarLoop)}
function startRadar(){radarActive=true;$('#radarState').textContent='ACTIVE';$('#radarToggle').textContent='PAUSE RADAR';cancelAnimationFrame(radarFrame);radarFrame=requestAnimationFrame(radarLoop)}
function stopRadar(){radarActive=false;$('#radarState').textContent='PAUSED';$('#radarToggle').textContent='RESUME RADAR';cancelAnimationFrame(radarFrame);drawRadar()}
$('#radarToggle').addEventListener('click',()=>radarActive?stopRadar():startRadar());
$('#radarRefresh').addEventListener('click',()=>{refreshRadar();log('Fictional radar contacts regenerated.')});
refreshRadar();

// Analytics is based on real activity recorded by this app in localStorage.
function renderAnalytics(){
 const all=store.get('dcp_activity',[]),now=Date.now(),day=86400000,today=all.filter(e=>now-e.time<day && new Date(e.time).toDateString()===new Date(now).toDateString());
 const alerts=today.filter(e=>/denied|warning|error|failed/i.test(e.message)).length;
 const score=Math.max(0,100-Math.min(100,alerts*8));
 $('#anEvents').textContent=String(today.length);$('#anAlerts').textContent=String(alerts).padStart(2,'0');$('#anScore').textContent=score+'%';
 const sessionStart=Number(sessionStorage.getItem('dcp_session_start')||now);sessionStorage.setItem('dcp_session_start',String(sessionStart));
 const elapsed=Math.max(0,Math.floor((now-sessionStart)/60000));$('#anUptime').textContent=elapsed<60?elapsed+'m':Math.floor(elapsed/60)+'h '+(elapsed%60)+'m';
 const categories=[
  ['Navigation',all.filter(e=>/^Opened /i.test(e.message)).length],
  ['Simulations',all.filter(e=>/simulation complete/i.test(e.message)).length],
  ['Code previews',all.filter(e=>/preview|studio/i.test(e.message)).length],
  ['Commands',all.filter(e=>/Command Center/i.test(e.message)).length]
 ];
 const max=Math.max(1,...categories.map(x=>x[1]));$('#analyticsBreakdown').innerHTML='';
 categories.forEach(([name,count])=>{const row=document.createElement('div');row.className='analytics-row';const label=document.createElement('span');label.textContent=name;const bar=document.createElement('div');bar.className='bar';const fill=document.createElement('i');fill.style.width=(count/max*100)+'%';bar.append(fill);const value=document.createElement('b');value.textContent=String(count);row.append(label,bar,value);$('#analyticsBreakdown').append(row)});
 const c=$('#analyticsChart'),x=c.getContext('2d'),daily=[];for(let i=6;i>=0;i--){const d=new Date(now-i*day);daily.push({label:['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()],count:all.filter(e=>new Date(e.time).toDateString()===d.toDateString()).length})}
 x.clearRect(0,0,c.width,c.height);x.strokeStyle=getComputedStyle(document.body).getPropertyValue('--a').trim();x.lineWidth=3;x.shadowColor=x.strokeStyle;x.shadowBlur=9;x.beginPath();daily.forEach((v,i)=>{const px=45+i*(c.width-90)/6,py=c.height-38-(v.count/Math.max(1,...daily.map(d=>d.count)))*(c.height-85);i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();x.shadowBlur=0;x.fillStyle='#9ab5c5';x.font='12px Consolas';daily.forEach((v,i)=>{const px=45+i*(c.width-90)/6;x.fillText(v.label,px-12,c.height-12);x.fillText(String(v.count),px-4,c.height-48-(v.count/Math.max(1,...daily.map(d=>d.count)))*(c.height-85))});
 $('#analyticsStamp').textContent='Updated: '+new Date().toLocaleString()+' · REAL LOCAL APP ACTIVITY · '+all.length+' SAVED EVENTS';
}
$('#analyticsRefresh').addEventListener('click',()=>{renderAnalytics();log('Local analytics report refreshed')});renderAnalytics();

// Command center: intentionally limited to harmless in-app actions.
const commandHelp=['Available in-app commands:','  help                  show this help','  status                show local app status','  open dashboard        open a page (dashboard/radar/analytics/profile/studio)','  radar                 open fictional radar','  analytics             open local activity analytics','  profile               open local profile editor','  theme                 cycle theme','  theme <red|purple|cyan|green>  set theme','  clear                 clear command output','Only built-in app commands are accepted; no Windows shell or network commands.'];
function runCommand(raw){const parts=raw.trim().toLowerCase().split(/\s+/),cmd=parts[0],arg=parts.slice(1).join(' '),out=$('#commandOutput');if(!cmd)return;
 const line='darkcyber> '+raw+'\n';let result='';
 if(cmd==='help')result=commandHelp.join('\n');
 else if(cmd==='status')result='CORE: LOCAL APP ONLINE\nUSER: '+(user||'GUEST')+'\nNETWORK ACCESS: NONE\nLOCAL EVENTS: '+store.get('dcp_activity',[]).length+'\nRADAR: FICTIONAL CONTACTS ONLY';
 else if(cmd==='radar'){show('radar');result='Opening fictional radar module...'}
 else if(cmd==='analytics'){show('analytics');result='Opening real local activity analytics...'}
 else if(cmd==='profile'){show('profile');result='Opening local profile editor...'}
 else if(cmd==='open'){const pages=['dashboard','radar','analytics','profile','studio'];const page=arg==='dash'?'dashboard':arg;if(pages.includes(page)){show(page==='dashboard'?'dash':page);result='Opened '+page+'.'}else result='Unknown page. Allowed: '+pages.join(', ')}
 else if(cmd==='theme'){const names=['red','purple','cyan','green'];if(arg&&names.includes(arg)){theme(arg);result='Theme set to '+arg+'.'}else{const i=names.indexOf(document.body.dataset.theme);theme(names[(i+1)%names.length]);result='Theme changed to '+document.body.dataset.theme}}
 else if(cmd==='clear'){out.textContent='';return}
 else result='Unknown safe command. Type help.';
 out.textContent=(out.textContent+'\n'+line+result).slice(-9000);out.scrollTop=out.scrollHeight;log('Command Center: '+cmd+(arg?' '+arg:''));
}
$('#commandForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#commandInput');runCommand(input.value);input.value=''});
$$('[data-command]').forEach(b=>b.addEventListener('click',()=>runCommand(b.dataset.command)));

// Profile editor stores only non-sensitive display preferences locally.
function updateProfilePreview(p){const name=p.name||'Operator',initials=name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'DC';
 $('#profileAvatar').textContent=initials;$('#profilePreviewAvatar').textContent=initials;$('#profilePreviewName').textContent=name;$('#profilePreviewRole').textContent=p.role||'Cyber Explorer';$('#profilePreviewBio').textContent=p.bio||'Your profile bio appears here.';
 const colors={cyan:'linear-gradient(135deg,#00d9ff,#287bff)',red:'linear-gradient(135deg,#ff2a4d,#9b30ff)',purple:'linear-gradient(135deg,#b66cff,#ff2a6d)',green:'linear-gradient(135deg,#31ef91,#00a878)'};const bg=colors[p.color]||colors.cyan;$('#profileAvatar').style.background=bg;$('#profilePreviewAvatar').style.background=bg;
}
function profileKey(){return 'dcp_profile_'+(user||'guest').toLowerCase()}
function loadProfile(){const legacy=store.get('dcp_profile',null),p=store.get(profileKey(),legacy||{name:user||'Operator',role:'Cyber Explorer',bio:'',color:'cyan'});$('#profileName').value=p.name||'';$('#profileRole').value=p.role||'Cyber Explorer';$('#profileBio').value=p.bio||'';$('#profileColor').value=p.color||'cyan';updateProfilePreview(p)}
$('#profileSave').addEventListener('click',()=>{const p={name:$('#profileName').value.trim().slice(0,24)||'Operator',role:$('#profileRole').value,bio:$('#profileBio').value.trim().slice(0,160),color:$('#profileColor').value};store.set(profileKey(),p);updateProfilePreview(p);$('#profileStatus').textContent='Profile saved locally for '+(user||'guest')+'.';log('Local operator profile updated.')});
['profileName','profileRole','profileBio','profileColor'].forEach(id=>$('#'+id).addEventListener('input',()=>updateProfilePreview({name:$('#profileName').value,role:$('#profileRole').value,bio:$('#profileBio').value,color:$('#profileColor').value})));
loadProfile();

// Audio visualizer reads the generated oscillator through Web Audio AnalyserNode.
// No microphone, recording, or external audio input is used.
const audioCanvas=$('#audioCanvas'),audioCtx2=audioCanvas.getContext('2d');let audioRAF=0,audioContext=null,audioOsc=null,audioGain=null,audioAnalyser=null,audioPlaying=false,audioData=null;
function drawAudio(){
 const c=audioCanvas,x=audioCtx2,w=c.width,h=c.height;x.clearRect(0,0,w,h);const bars=72,step=w/bars;
 if(audioAnalyser&&audioData){audioAnalyser.getByteFrequencyData(audioData)}
 for(let i=0;i<bars;i++){const v=audioData?audioData[Math.floor(i*audioData.length/bars)]/255:0.025;const bh=8+v*(h*.82);x.fillStyle=i%3===0?'#00d9ff':i%3===1?'#9b30ff':'#31ef91';x.globalAlpha=.55+v*.45;x.fillRect(i*step+2,(h-bh)/2,Math.max(2,step-4),bh)}x.globalAlpha=1;
 if(audioPlaying)audioRAF=requestAnimationFrame(drawAudio)
}
async function startAudio(){
 if(audioPlaying)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC){$('#audioStatus').textContent='Web Audio is not supported by this browser.';return}
 try{audioContext=new AC();if(audioContext.state==='suspended')await audioContext.resume();audioOsc=audioContext.createOscillator();audioGain=audioContext.createGain();audioAnalyser=audioContext.createAnalyser();audioAnalyser.fftSize=256;audioData=new Uint8Array(audioAnalyser.frequencyBinCount);audioOsc.type='sawtooth';audioOsc.frequency.value=110;audioGain.gain.value=Number($('#audioVolume').value)/100;audioOsc.connect(audioGain);audioGain.connect(audioAnalyser);audioAnalyser.connect(audioContext.destination);audioOsc.start();audioPlaying=true;$('#audioStatus').textContent='Generated tone playing · live frequency analysis active · no microphone';$('#audioStart').disabled=true;log('Sound visualizer started');drawAudio()}
 catch(e){$('#audioStatus').textContent='Could not start demo audio: '+e.message;stopAudio()}
}
function stopAudio(){audioPlaying=false;cancelAnimationFrame(audioRAF);if(audioOsc){try{audioOsc.stop()}catch(e){}audioOsc.disconnect();audioOsc=null}if(audioGain){audioGain.disconnect();audioGain=null}if(audioAnalyser){audioAnalyser.disconnect();audioAnalyser=null}audioData=null;if(audioContext){audioContext.close();audioContext=null}$('#audioStart').disabled=false;$('#audioStatus').textContent='Audio stopped.';drawAudio()}
$('#audioStart').addEventListener('click',startAudio);$('#audioStop').addEventListener('click',stopAudio);$('#audioVolume').addEventListener('input',()=>{if(audioGain&&audioContext)audioGain.gain.setTargetAtTime(Number($('#audioVolume').value)/100,audioContext.currentTime,.03)});
drawAudio();

// Decorative cursor ripple on clicks. Respects reduced-motion setting.
document.addEventListener('click',e=>{if(document.body.classList.contains('reduced-motion'))return;const el=document.createElement('span');el.className='mouse-ripple';el.style.left=e.clientX+'px';el.style.top=e.clientY+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),700)});

// Extend existing navigation so animations run only while their view is open.
const showV2=show;show=function(v){showV2(v);if(v==='radar')startRadar();else stopRadar();if(v==='analytics')renderAnalytics();if(v==='profile')loadProfile();if(v!=='audio'&&audioPlaying)stopAudio();if(user)log('Opened '+v+' module')};
window.addEventListener('beforeunload',()=>{if(audioPlaying)stopAudio()});


/* =========================================================
   V3.0 ADD-ON PACK — eight additive modules.
   Existing V2.1 modules and storage keys are left untouched.
   All processing stays in this browser; no network scanning.
   ========================================================= */
(function initV3(){
 'use strict';
 const $v=s=>document.querySelector(s), $$v=s=>[...document.querySelectorAll(s)];
 const safeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const addView=(id,title,subtitle,body)=>{
   if($v('#v-'+id))return;
   const nav=document.createElement('button');nav.dataset.v=id;nav.textContent=title;nav.addEventListener('click',()=>show(id));$('#nav').appendChild(nav);
   const section=document.createElement('section');section.className='view';section.id='v-'+id;
   section.innerHTML='<h2>'+title+'</h2><p class="sub">'+subtitle+'</p>'+body;
   $('#views').appendChild(section);
 };
 addView('advanced','ADVANCED DASHBOARD','A compact overview built from this app\'s own local data. No device telemetry is collected.',
 `<div class="v3-grid"><div class="v3-stat"><small>LOCAL EVENTS</small><b id="v3Events">0</b><span class="v3-note">Saved app actions</span></div><div class="v3-stat"><small>MISSIONS COMPLETED</small><b id="v3Missions">0</b><span class="v3-note">Local progress</span></div><div class="v3-stat"><small>ACTIVE MODULES</small><b id="v3Modules">7</b><span class="v3-note">Enabled V3 modules</span></div><div class="v3-stat"><small>LOCAL STORAGE</small><b id="v3Storage">—</b><span class="v3-note">Approximate app data size</span></div></div><div class="grid2"><div class="card"><h3>QUICK ACTIONS</h3><div class="v3-row"><button class="btn" data-v3-open="academy">OPEN ACADEMY</button><button class="btn ghost" data-v3-open="filelab">FILE HASH LAB</button><button class="btn ghost" data-v3-open="backup">BACKUP DATA</button></div></div><div class="card"><h3>RECENT LOCAL ACTIVITY</h3><div id="v3Recent" class="v3-output">No events yet.</div></div></div>`);
 addView('holo','HOLOGRAPHIC INTERFACE','A decorative 3D interface preview. It does not represent real system hardware.',
 `<div class="card"><div class="holo-stage" id="holoStage"><div class="holo-core"><div><strong>DARK CYBER</strong><br><span>HOLOGRAPHIC CORE · LOCAL UI</span></div></div></div><div class="v3-row"><button class="btn" id="holoToggle">PAUSE ANIMATION</button><button class="btn ghost" id="holoRotate">CHANGE VIEW</button></div><p class="v3-note">Visual-only effect. Animation preference is kept in this browser.</p></div>`);
 addView('academy','CYBER TRAINING ACADEMY','Short defensive cybersecurity learning checks. Questions are educational and use fictional examples.',
 `<div class="grid2"><div class="card"><div class="v3-card-title"><h3 id="academyTopic">LESSON 01 · ACCOUNT SAFETY</h3><span class="v3-pill" id="academyCount">1 / 4</span></div><h2 id="academyQuestion" style="font-size:18px;letter-spacing:0;margin:14px 0">Loading lesson…</h2><div id="academyOptions"></div><p id="academyFeedback" class="sub" aria-live="polite"></p><div class="v3-row"><button class="btn" id="academyNext" disabled>NEXT LESSON</button><span class="v3-note" id="academyScore">Score: 0 / 4</span></div></div><div class="card"><h3>LEARNING PATH</h3><ul><li>Strong account habits</li><li>Recognizing suspicious messages</li><li>Safe software updates</li><li>Protecting personal information</li></ul><p class="v3-note">This academy does not teach intrusion or unauthorized access.</p></div></div>`);
 addView('filelab','FILE SECURITY LAB','Inspect a file locally: name, size, type and SHA-256 digest. File contents are not uploaded or saved.',
 `<div class="grid2"><div class="card"><h3>LOCAL FILE INSPECTOR</h3><input type="file" id="fileLabInput"><div class="v3-row"><button class="btn" id="fileHashBtn">CALCULATE SHA-256</button></div><div id="fileLabInfo" class="v3-output">Choose a file to view its basic metadata.</div><p class="v3-note">The selected file is read in memory only to calculate its digest.</p></div><div class="card"><h3>ABOUT SHA-256</h3><p>A cryptographic hash creates a fixed-length fingerprint of file bytes. Matching hashes can help compare whether two files are identical, but a hash alone does not prove a file is safe.</p><p class="v3-note">Maximum file size: 25 MB for this browser demo.</p></div></div>`);
 addView('passwordlab','PASSWORD STRENGTH CHECKER','Checks a sample locally in your browser. The text is never stored, logged or transmitted.',
 `<div class="grid2"><div class="card"><h3>LOCAL PASSWORD CHECK</h3><input id="v3Password" type="password" autocomplete="off" placeholder="Enter a sample password"><div class="v3-row"><button class="btn" id="v3PassToggle">SHOW</button><button class="btn" id="v3PassCheck">CHECK STRENGTH</button><button class="btn ghost" id="v3PassClear">CLEAR</button></div><div class="v3-meter"><i id="v3PassMeter"></i></div><b id="v3PassLabel">Not checked</b><div id="v3PassAdvice" class="v3-output">Use a long, unique passphrase. Avoid personal details and reused passwords.</div></div><div class="card"><h3>SAFETY TIPS</h3><ul><li>Use a different password for every account.</li><li>Prefer long passphrases.</li><li>Use a trusted password manager.</li><li>Enable multi-factor authentication where available.</li></ul><p class="v3-note">This tool is an educational estimate, not a guarantee of account security.</p></div></div>`);
 addView('history','ACTIVITY HISTORY','Review saved app events from this browser. This list contains only activity recorded by the app.',
 `<div class="card"><div class="v3-row"><button class="btn" id="historyRefresh">REFRESH HISTORY</button><button class="btn ghost" id="historyExport">EXPORT CSV</button><button class="btn ghost" id="historyClear">CLEAR HISTORY</button></div><div id="historyCount" class="v3-note">0 events</div><div style="overflow:auto"><table class="v3-table"><thead><tr><th>TIME</th><th>EVENT</th></tr></thead><tbody id="historyRows"></tbody></table></div></div>`);
 addView('backup','BACKUP & RESTORE','Export or restore selected DARK CYBER app settings and progress. Account credentials are deliberately excluded.',
 `<div class="grid2"><div class="card"><h3>CREATE BACKUP</h3><p>Backup includes theme, customization, missions, profiles and activity history.</p><button class="btn" id="backupExport">DOWNLOAD BACKUP JSON</button><p id="backupStatus" class="v3-note"></p></div><div class="card"><h3>RESTORE BACKUP</h3><input type="file" id="backupInput" accept=".json,application/json"><button class="btn" id="backupRestore">VALIDATE & RESTORE</button><p class="v3-note">Only backups created by this app are accepted. Existing included data will be replaced.</p><p id="restoreStatus" class="v3-note" aria-live="polite"></p></div></div>`);
 addView('plugins','PLUGIN SYSTEM','Manage built-in optional interface widgets. Only trusted features shipped with this app are listed; arbitrary code plugins are not supported.',
 `<div class="card"><div class="v3-card-title"><h3>BUILT-IN MODULE REGISTRY</h3><span class="v3-pill">LOCAL ONLY</span></div><div id="pluginList"></div><p class="v3-note">Toggling a module here records your preference; it does not delete or modify the original V2.1 modules.</p></div>`);

 // New navigation buttons call the same shared show() function as the original modules.
 // Add a delegated click listener for V3 quick actions.
 $('#views').addEventListener('click',e=>{const b=e.target.closest('[data-v3-open]');if(b)$$v('#nav button').find(n=>n.dataset.v===b.dataset.v3Open)?.click()});

 // 1) Advanced dashboard metrics.
 function renderAdvanced(){const events=getEvents(),missions=store.get('dcp_ultra_missions',{xp:0,done:[]});$('#v3Events').textContent=events.length;$('#v3Missions').textContent=Array.isArray(missions.done)?missions.done.length:0;$('#v3Modules').textContent=pluginDefs.filter(([id])=>pluginState[id]!==false).length;let bytes=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(k.startsWith('dcp_'))bytes+=(localStorage.getItem(k)||'').length*2}$('#v3Storage').textContent=bytes<1024?bytes+' B':(bytes/1024).toFixed(1)+' KB';$('#v3Recent').textContent=events.slice(-6).reverse().map(e=>new Date(e.time).toLocaleTimeString()+'  '+e.message).join('\n')||'No events yet.'}

 // 2) Holographic UI controls.
 let holoPaused=false,holoTurn=0;$('#holoToggle').onclick=()=>{holoPaused=!holoPaused;$('#holoStage').classList.toggle('holo-static',holoPaused);$('#holoToggle').textContent=holoPaused?'RESUME ANIMATION':'PAUSE ANIMATION'};$('#holoRotate').onclick=()=>{holoTurn=(holoTurn+1)%4;const core=$('.holo-core');core.style.filter=['none','hue-rotate(65deg)','hue-rotate(150deg)','hue-rotate(260deg)'][holoTurn]};

 // 3) Defensive learning quiz; score is stored separately from existing mission XP.
 const lessons=[
  {topic:'LESSON 01 · ACCOUNT SAFETY',q:'Which is the safest way to protect an important account?',a:['Reuse one easy password','Use a long unique password and MFA','Share the password with a friend'],correct:1,why:'Correct: unique long passwords and multi-factor authentication add protection.'},
  {topic:'LESSON 02 · PHISHING',q:'An unexpected message asks you to sign in through a strange link. What should you do?',a:['Open it quickly','Reply with your details','Avoid the link and verify through the official app/site'],correct:2,why:'Correct: verify requests using a known official channel.'},
  {topic:'LESSON 03 · UPDATES',q:'Why should apps and operating systems be updated?',a:['Updates can fix security weaknesses','Updates always remove passwords','Updates make every file public'],correct:0,why:'Correct: updates often patch known security issues.'},
  {topic:'LESSON 04 · PRIVACY',q:'Which information should you avoid posting publicly?',a:['A made-up game score','Private address and account recovery details','A public weather report'],correct:1,why:'Correct: keep private identifying and recovery details confidential.'}
 ];let lessonIndex=0,lessonScore=0,lessonAnswered=false,courseFinished=false;
 function renderLesson(){const q=lessons[lessonIndex];$('#academyTopic').textContent=q.topic;$('#academyCount').textContent=(lessonIndex+1)+' / '+lessons.length;$('#academyQuestion').textContent=q.q;$('#academyOptions').innerHTML='';lessonAnswered=false;$('#academyFeedback').textContent='';$('#academyNext').disabled=true;$('#academyNext').textContent=lessonIndex===lessons.length-1?'FINISH':'NEXT LESSON';q.a.forEach((a,i)=>{const b=document.createElement('button');b.type='button';b.className='v3-quiz-option';b.textContent=String.fromCharCode(65+i)+'. '+a;b.onclick=()=>{if(lessonAnswered)return;lessonAnswered=true;const good=i===q.correct;if(good)lessonScore++;$('#academyFeedback').textContent=(good?'✓ ':'✕ ')+q.why;$('#academyScore').textContent='Score: '+lessonScore+' / '+lessons.length;$$v('.v3-quiz-option').forEach((x,j)=>{x.disabled=true;if(j===q.correct)x.style.borderColor='#31ef91'});$('#academyNext').disabled=false};$('#academyOptions').appendChild(b)})}
 $('#academyNext').onclick=()=>{if(courseFinished){lessonIndex=0;lessonScore=0;courseFinished=false;$('#academyScore').textContent='Score: 0 / '+lessons.length;renderLesson();return}if(!lessonAnswered)return;if(lessonIndex<lessons.length-1){lessonIndex++;renderLesson()}else{$('#academyQuestion').textContent='Training complete';$('#academyOptions').innerHTML='';$('#academyFeedback').textContent='Final score: '+lessonScore+' / '+lessons.length+'. Select RESTART COURSE to try again.';$('#academyNext').disabled=false;$('#academyNext').textContent='RESTART COURSE';courseFinished=true;store.set('dcp_v3_academy_score',lessonScore);if(typeof log==='function')log('Cyber Academy course completed: '+lessonScore+'/'+lessons.length)}};renderLesson();

 // 4) Local file metadata + SHA-256. Never sends the selected file anywhere.
 $('#fileHashBtn').onclick=async()=>{const file=$('#fileLabInput').files[0];if(!file){$('#fileLabInfo').textContent='Choose a file first.';return}if(file.size>25*1024*1024){$('#fileLabInfo').textContent='File is larger than the 25 MB demo limit.';return}$('#fileLabInfo').textContent='Calculating SHA-256 locally…';try{if(!crypto.subtle)throw new Error('Web Crypto is unavailable. Open the app in a modern browser or localhost.');const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');$('#fileLabInfo').textContent='NAME: '+file.name+'\nSIZE: '+file.size.toLocaleString()+' bytes\nTYPE: '+(file.type||'Unknown')+'\nLAST MODIFIED: '+new Date(file.lastModified).toLocaleString()+'\nSHA-256: '+hash+'\n\nLocal calculation complete. File was not uploaded.';if(typeof log==='function')log('Local SHA-256 calculated for a file (name not recorded).')}catch(err){$('#fileLabInfo').textContent='Could not calculate digest: '+err.message}};

 // 5) Password strength estimation: never persist or log the input.
 const common=['password','123456','12345678','qwerty','letmein','admin','welcome','iloveyou'];
 function evaluatePassword(v){if(!v)return{score:0,label:'EMPTY',tips:['Enter a sample to check.']};let score=0,tips=[];if(v.length>=12)score+=30;else if(v.length>=8)score+=18;else tips.push('Use at least 12 characters when possible.');if(/[a-z]/.test(v))score+=12;if(/[A-Z]/.test(v))score+=12;if(/\d/.test(v))score+=12;if(/[^A-Za-z0-9]/.test(v))score+=14;if(v.length>=16)score+=12;if(common.includes(v.toLowerCase())){score=0;tips.push('This is a commonly used password; avoid it.')}if(/(.)\1{2,}/.test(v)) {score-=12;tips.push('Avoid repeated characters.')}if(/1234|abcd|qwer/i.test(v)){score-=12;tips.push('Avoid predictable sequences.')}score=Math.max(0,Math.min(100,score));if(score<40)tips.push('Try a longer, unique passphrase.');else if(score<70)tips.push('Add length and avoid predictable patterns.');else tips.push('Good estimate. Keep it unique and enable MFA.');return{score,label:score<40?'WEAK':score<70?'FAIR':score<85?'STRONG':'VERY STRONG',tips}}
 $('#v3PassToggle').onclick=()=>{const i=$('#v3Password');i.type=i.type==='password'?'text':'password';$('#v3PassToggle').textContent=i.type==='password'?'SHOW':'HIDE'};
 $('#v3PassCheck').onclick=()=>{const r=evaluatePassword($('#v3Password').value);$('#v3PassMeter').style.width=r.score+'%';$('#v3PassLabel').textContent=r.label+' · '+r.score+'/100';$('#v3PassAdvice').textContent=r.tips.join('\n')};
 $('#v3PassClear').onclick=()=>{$('#v3Password').value='';$('#v3Password').type='password';$('#v3PassMeter').style.width='0';$('#v3PassLabel').textContent='Not checked';$('#v3PassAdvice').textContent='Password sample cleared.'};

 // 6) Activity history. CSV export uses safe quoting.
 function getEvents(){const value=store.get('dcp_activity',[]);return Array.isArray(value)?value.filter(e=>e&&typeof e==='object'&&Number.isFinite(Number(e.time))):[]}
 function renderHistory(){const events=getEvents().slice().reverse();$('#historyCount').textContent=events.length+' saved events';$('#historyRows').innerHTML='';events.slice(0,250).forEach(e=>{const tr=document.createElement('tr'),td1=document.createElement('td'),td2=document.createElement('td');td1.textContent=new Date(Number(e.time)).toLocaleString();td2.textContent=String(e.message??'');tr.append(td1,td2);$('#historyRows').appendChild(tr)})}
 const csvCell=value=>{let v=String(value??'');if(/^[\s]*[=+@\-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 $('#historyRefresh').onclick=renderHistory;$('#historyExport').onclick=()=>{const rows=[['Time','Event'],...getEvents().map(e=>[new Date(Number(e.time)).toISOString(),e.message])];const csv=rows.map(row=>row.map(csvCell).join(',')).join('\r\n');downloadText('dark-cyber-activity.csv',csv,'text/csv')};$('#historyClear').onclick=()=>{if(!confirm('Clear the saved activity history for this browser?'))return;store.set('dcp_activity',[]);renderHistory();if(typeof log==='function')log('Activity history cleared by operator')};renderHistory();

 // 7) Backup/restore. Whitelisted local settings only; credentials/session are never exported.
 const backupKeys=['dcp_theme','dcp_ultra_settings','dcp_ultra_missions','dcp_activity','dcp_v3_plugins','dcp_v3_academy_score'];
 function makeBackup(){const profiles={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(/^dcp_profile_[a-z0-9_.-]+$/i.test(k)){try{profiles[k]=JSON.parse(localStorage.getItem(k))}catch(e){}}}const data={app:'DARK-CYBER-PRO-ULTRA',version:3,createdAt:new Date().toISOString(),data:{}};backupKeys.forEach(k=>{try{const v=localStorage.getItem(k);if(v!==null)data.data[k]=JSON.parse(v)}catch(e){}});data.data.dcp_profiles=profiles;return data}
 $('#backupExport').onclick=()=>{try{const backup=makeBackup();downloadText('dark-cyber-pro-backup.json',JSON.stringify(backup,null,2),'application/json');$('#backupStatus').textContent='Backup created. Login credentials and session data are excluded.'}catch(err){$('#backupStatus').textContent='Backup failed: '+err.message}};
 $('#backupRestore').onclick=async()=>{const f=$('#backupInput').files[0];if(!f){$('#restoreStatus').textContent='Choose a JSON backup file first.';return}if(f.size>2*1024*1024){$('#restoreStatus').textContent='Backup file is larger than the 2 MB limit.';return}try{const obj=JSON.parse(await f.text());if(!obj||obj.app!=='DARK-CYBER-PRO-ULTRA'||obj.version!==3||!obj.data||typeof obj.data!=='object'||Array.isArray(obj.data))throw new Error('Not a supported V3 backup.');const d=obj.data;
  if(d.dcp_theme!==undefined&&!['red','purple','cyan','green'].includes(d.dcp_theme))throw new Error('Invalid theme value.');
  if(d.dcp_ultra_settings!==undefined&&(!d.dcp_ultra_settings||typeof d.dcp_ultra_settings!=='object'||Array.isArray(d.dcp_ultra_settings)))throw new Error('Invalid settings data.');
  if(d.dcp_ultra_missions!==undefined&&(!d.dcp_ultra_missions||!Array.isArray(d.dcp_ultra_missions.done)||!Number.isFinite(d.dcp_ultra_missions.xp)))throw new Error('Invalid mission data.');
  if(d.dcp_activity!==undefined&&(!Array.isArray(d.dcp_activity)||d.dcp_activity.length>500||d.dcp_activity.some(e=>!e||typeof e!=='object'||!Number.isFinite(Number(e.time))||!Number.isFinite(new Date(Number(e.time)).getTime())||typeof e.message!=='string')))throw new Error('Invalid activity history.');
  if(d.dcp_v3_plugins!==undefined&&(!d.dcp_v3_plugins||typeof d.dcp_v3_plugins!=='object'||Array.isArray(d.dcp_v3_plugins)))throw new Error('Invalid plugin settings.');
  if(d.dcp_v3_academy_score!==undefined&&(!Number.isInteger(d.dcp_v3_academy_score)||d.dcp_v3_academy_score<0||d.dcp_v3_academy_score>4))throw new Error('Invalid academy score.');
  const profiles=d.dcp_profiles??{};if(!profiles||typeof profiles!=='object'||Array.isArray(profiles)||Object.keys(profiles).length>100)throw new Error('Invalid profile data.');
  for(const [k,v] of Object.entries(profiles)){if(!/^dcp_profile_[a-z0-9_.-]+$/i.test(k)||!v||typeof v!=='object'||Array.isArray(v))throw new Error('Invalid profile entry.');}
  // Validation is complete before changing local storage.
  backupKeys.forEach(k=>{if(Object.prototype.hasOwnProperty.call(d,k))localStorage.setItem(k,JSON.stringify(d[k]))});
  for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i)||'';if(/^dcp_profile_[a-z0-9_.-]+$/i.test(k))localStorage.removeItem(k)}
  Object.entries(profiles).forEach(([k,v])=>localStorage.setItem(k,JSON.stringify(v)));
  $('#restoreStatus').textContent='Restore complete. Reload the app to apply restored settings and modules.';if(typeof log==='function')log('V3 backup restored locally')
 }catch(err){$('#restoreStatus').textContent='Restore failed: '+err.message}};

 // 8) Built-in plugin registry; no dynamic script loading or arbitrary execution.
 const pluginDefs=[['advanced','Advanced Dashboard','Local overview cards and recent activity'],['holo','Holographic Interface','Decorative 3D interface panel'],['academy','Cyber Training Academy','Defensive cybersecurity quiz'],['filelab','File Security Lab','Local file metadata and SHA-256'],['passwordlab','Password Strength Checker','Local password estimate'],['history','Activity History','View and export app activity'],['backup','Backup & Restore','Export and restore app preferences']];
 let pluginState=store.get('dcp_v3_plugins',{});if(!pluginState||typeof pluginState!=='object'||Array.isArray(pluginState))pluginState={};
 function applyPluginState(){pluginDefs.forEach(([id])=>{const enabled=pluginState[id]!==false;const nav=$v('#nav button[data-v="'+id+'"]'),view=$v('#v-'+id);if(nav)nav.hidden=!enabled;if(view)view.hidden=!enabled});if($('#v3Modules'))$('#v3Modules').textContent=pluginDefs.filter(([id])=>pluginState[id]!==false).length;}
 function renderPlugins(){const root=$('#pluginList');root.innerHTML='';pluginDefs.forEach(([id,name,desc])=>{const row=document.createElement('div');row.className='v3-plugin';const info=document.createElement('div'),title=document.createElement('b'),p=document.createElement('p');title.textContent=name;p.textContent=desc;info.append(title,p);const btn=document.createElement('button');btn.type='button';btn.className='btn '+(pluginState[id]===false?'ghost':'');btn.textContent=pluginState[id]===false?'ENABLE':'DISABLE';btn.setAttribute('aria-pressed',String(pluginState[id]!==false));btn.onclick=()=>{pluginState[id]=pluginState[id]===false?true:false;store.set('dcp_v3_plugins',pluginState);applyPluginState();renderPlugins();if(pluginState[id]===false&&document.querySelector('#v-'+id+'.active'))show('dash');if(typeof log==='function')log(name+' '+(pluginState[id]===false?'disabled':'enabled'))};row.append(info,btn);root.appendChild(row)});applyPluginState()}
 renderPlugins();

 function downloadText(name,text,mime){const blob=new Blob([text],{type:mime+';charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 // Refresh V3 views when selected.
 const originalV3Show=show;
 show=function(view){originalV3Show(view);if(view==='advanced')renderAdvanced();if(view==='history')renderHistory();if(view==='plugins')renderPlugins()};
 // Existing navigation listeners invoke show through the shared lexical binding.
 renderAdvanced();
})();
