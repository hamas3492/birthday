/* ===== HAPPY BIRTHDAY SURPRISE — script ===== */
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ---------- STARS ---------- */
(function stars(){
  const box = $('#stars');
  const n = window.innerWidth < 600 ? 60 : 90;
  let html = '';
  for(let i=0;i<n;i++){
    const s = 1 + Math.random()*2.2;
    html += `<span class="star" style="left:${(Math.random()*100).toFixed(2)}%;top:${(Math.random()*100).toFixed(2)}%;width:${s.toFixed(1)}px;height:${s.toFixed(1)}px;--tw:${(2+Math.random()*4).toFixed(1)}s;--d:${(Math.random()*5).toFixed(2)}s"></span>`;
  }
  box.innerHTML = html;
})();

/* ---------- PARTICLE ENGINE (confetti + fireworks) ---------- */
const FX = (function(){
  const canvas = $('#fx'), ctx = canvas.getContext('2d');
  let W, H, pieces = [], rockets = [];
  const COLORS = ['#8b5cf6','#22d3ee','#ec4899','#fbbf24','#f472b6','#a78bfa','#ffffff','#fde68a'];
  const rand = (a,b)=>a+Math.random()*(b-a);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  function resize(){ W = canvas.width = innerWidth * devicePixelRatio; H = canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth+'px'; canvas.style.height = innerHeight+'px'; ctx.scale(devicePixelRatio,devicePixelRatio); }
  let scaled = false;
  addEventListener('resize', ()=>{ scaled=false; resize(); scaled=true; });

  // confetti burst from a point
  function burst(x, y, count=90, power=11){
    for(let i=0;i<count;i++){
      const a = rand(0, Math.PI*2), v = rand(3, power);
      pieces.push({ x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v - 3,
        w:rand(6,12), h:rand(3,7), rot:rand(0,Math.PI*2), vr:rand(-.25,.25),
        c:pick(COLORS), life:1, decay:rand(.006,.012), shape:Math.random()<.35?'circle':'rect' });
    }
    if(pieces.length>600) pieces.splice(0, pieces.length-600);
  }
  // side cannons
  function cannons(count=120){
    const H0 = innerHeight*.78;
    burst(30, H0, count/2, 16);
    burst(innerWidth-30, H0, count/2, 16);
  }
  // firework
  function firework(x){
    rockets.push({ x: x!==undefined ? x : rand(innerWidth*.15, innerWidth*.85),
      y: innerHeight+10, vy:-rand(9,12), target:rand(innerHeight*.18, innerHeight*.45), exploded:false });
  }
  function explode(r){
    const count = 90, base = rand(0,Math.PI*2);
    for(let i=0;i<count;i++){
      const a = base + (i/count)*Math.PI*2, v = rand(2,5.5);
      pieces.push({ x:r.x, y:r.y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, w:3, h:3,
        rot:0, vr:0, c:pick(COLORS), life:1, decay:rand(.008,.016), shape:'spark', glow:true });
    }
  }
  function loop(){
    if(!scaled){ resize(); scaled=true; }
    ctx.clearRect(0,0,innerWidth,innerHeight);
    // rockets
    for(let i=rockets.length-1;i>=0;i--){
      const r = rockets[i];
      r.y += r.vy; r.vy += .12;
      ctx.beginPath(); ctx.arc(r.x,r.y,2.6,0,Math.PI*2); ctx.fillStyle='#ffe9a8'; ctx.fill();
      ctx.beginPath(); ctx.arc(r.x,r.y+9,1.6,0,Math.PI*2); ctx.fillStyle='rgba(255,200,120,.5)'; ctx.fill();
      if(r.y <= r.target || r.vy > -1){ explode(r); rockets.splice(i,1); }
    }
    // pieces
    for(let i=pieces.length-1;i>=0;i--){
      const p = pieces[i];
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      p.vy += p.shape==='spark' ? .045 : .18;   // gravity
      p.vx *= p.shape==='spark' ? .985 : .992;   // drag
      p.life -= p.decay;
      if(p.life <= 0){ pieces.splice(i,1); continue; }
      ctx.save(); ctx.globalAlpha = Math.max(p.life,0); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      if(p.glow){ ctx.shadowBlur = 12; ctx.shadowColor = p.c; }
      ctx.fillStyle = p.c;
      if(p.shape==='circle'||p.shape==='spark'){ ctx.beginPath(); ctx.arc(0,0,p.w/2.2,0,Math.PI*2); ctx.fill(); }
      else { ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); }
      ctx.restore();
    }
    requestAnimationFrame(loop);
  }
  loop();
  return { burst, cannons, firework };
})();

/* ---------- AMBIENT BALLOONS ---------- */
(function balloons(){
  const layer = $('#ambient');
  const PALETTE = [['#f472b6','#be185d'],['#a78bfa','#6d28d9'],['#22d3ee','#0e7490'],['#fbbf24','#b45309'],['#fb7185','#e11d48']];
  function spawn(){
    const b = document.createElement('div');
    b.className = 'balloon';
    const size = rand(38, 64), dur = rand(11, 18);
    const [c1,c2] = PALETTE[Math.floor(Math.random()*PALETTE.length)];
    b.style.left = rand(2, 92)+'vw';
    b.style.setProperty('--sw', rand(-60,60)+'px');
    b.style.animationDuration = dur+'s';
    b.innerHTML = `<div class="balloon__body" style="width:${size}px;height:${size*1.22}px;--c1:${c1};--c2:${c2}"></div><div class="balloon__string"></div>`;
    layer.appendChild(b);
    setTimeout(()=>b.remove(), dur*1000+100);
  }
  function rand(a,b){ return a+Math.random()*(b-a); }
  let started = false;
  window.__startAmbient = () => {
    if(started) return; started = true;
    spawn(); spawn();
    setInterval(spawn, 2600);
  };
})();

/* ---------- MUSIC BOX (Web Audio) ---------- */
const MusicBox = (function(){
  let ctx=null, master=null, delay=null, playing=false, loopTO=null;
  const N = {G3:196,C4:261.63,F4:349.23,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99};
  // Happy Birthday — [note, beats]
  const MELODY = [
    ['G4',.5],['G4',.5],['A4',1],['G4',1],['C5',1],['B4',1.7],['r',.3],
    ['G4',.5],['G4',.5],['A4',1],['G4',1],['D5',1],['C5',1.7],['r',.3],
    ['G4',.5],['G4',.5],['G5',1],['E5',1],['C5',1],['B4',1],['A4',1.7],['r',.3],
    ['F5',.5],['F5',.5],['E5',1],['C5',1],['D5',1],['C5',2.2],['r',1.6],
  ];
  const BASS = ['C3','C3','G3','C3']; // rough roots per phrase
  const FREQ = {G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,
                C3:130.81,G3:196,F3:174.61};

  function init(){
    if(ctx) return;
    ctx = new (window.AudioContext||window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination);
    // shimmer delay
    delay = ctx.createDelay(); delay.delayTime.value = .3;
    const fb = ctx.createGain(); fb.gain.value = .32;
    const wet = ctx.createGain(); wet.gain.value = .18;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
  }
  function tone(freq, t, dur, vol=.5, isBass=false){
    if(!freq) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = isBass ? 'sine' : 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(master); g.connect(delay);
    o.start(t); o.stop(t + dur + .05);
    // bell overtone for melody
    if(!isBass){
      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.type = 'sine'; o2.frequency.value = freq*2;
      g2.gain.setValueAtTime(0,t);
      g2.gain.linearRampToValueAtTime(vol*.28, t+.012);
      g2.gain.exponentialRampToValueAtTime(.0001, t+dur*.7);
      o2.connect(g2); g2.connect(master);
      o2.start(t); o2.stop(t+dur);
    }
  }
  function playPhrase(startAt, beat){
    let t = startAt;
    MELODY.forEach(([n,b])=>{
      if(n!=='r') tone(FREQ[n], t, Math.max(b*beat*.9,.35), .42);
      t += b*beat;
    });
    return t; // end time
  }
  function playBass(startAt, beat){
    // soft root notes each phrase start
    let t = startAt; let i = 0;
    MELODY.forEach(([n,b])=>{ 
      if(n!=='r' && t === startAt) {}
      t += b*beat;
    });
    // simple: play roots at phrase starts
    const phraseLen = beat*3.5;
    [0, phraseLen*2, phraseLen*4.6, phraseLen*7.2].forEach((off,i)=>{
      const root = [FREQ.G3, FREQ.G3, FREQ.C3, FREQ.C3][i];
      if(root) tone(root, startAt+off, beat*3, .16, true);
    });
  }
  function start(){
    init();
    if(ctx.state === 'suspended') ctx.resume();
    if(playing) return;
    playing = true;
    scheduleLoop();
  }
  function scheduleLoop(){
    if(!playing) return;
    const beat = .48;
    const startAt = ctx.currentTime + .08;
    const end = playPhrase(startAt, beat);
    playBass(startAt, beat);
    loopTO = setTimeout(scheduleLoop, (end - ctx.currentTime + 1.2) * 1000);
  }
  function stop(){ playing = false; clearTimeout(loopTO); if(master) master.gain.setTargetAtTime(0, ctx.currentTime, .1); }
  function toggleMute(mute){
    if(!master) return;
    master.gain.setTargetAtTime(mute ? 0 : .5, ctx.currentTime, .05);
  }
  return { start, stop, toggleMute, get playing(){return playing;} };
})();

/* ---------- MUSIC TOGGLE ---------- */
let muted = false;
$('#musicToggle').addEventListener('click', () => {
  muted = !muted;
  MusicBox.toggleMute(muted);
  $('#musicToggle').textContent = muted ? '🔇' : '🔊';
});

/* ---------- FLOW: NAME → COUNTDOWN → EXPERIENCE ---------- */
const nameInput = $('#nameInput'), startBtn = $('#startBtn');
// prefill via ?name=
const param = new URLSearchParams(location.search).get('name');
if(param){ nameInput.value = param.slice(0,24); }

function sanitize(s){ return s.replace(/[<>&"]/g,'').trim().slice(0,24); }

startBtn.addEventListener('click', begin);
nameInput.addEventListener('keydown', e => { if(e.key === 'Enter') begin(); });

function begin(){
  const name = sanitize(nameInput.value) || 'Dost';
  $('#bigName').textContent = name;
  $('#finalName').textContent = `Happy Birthday, ${name}!`;
  const count = $('#countdown'), num = $('#countNum'), go = $('#countGo');
  $('#nameScreen').classList.add('hide');
  count.classList.add('show');

  let step = 3;
  num.textContent = step;
  num.classList.add('pop');
  const iv = setInterval(() => {
    step--;
    if(step > 0){
      num.classList.remove('pop'); void num.offsetWidth; // reflow restart
      num.textContent = step; num.classList.add('pop');
    } else {
      clearInterval(iv);
      num.style.display = 'none';
      go.classList.add('show');
      // === DHAMAKA ===
      MusicBox.start();
      launchExperience(name);
      setTimeout(() => {
        count.classList.remove('show');
        $('#experience').removeAttribute('hidden');
        window.scrollTo(0,0);
        FX.cannons(150);
        FX.burst(innerWidth/2, innerHeight*.35, 130, 13);
        let shots = 0;
        const fw = setInterval(() => {
          FX.firework();
          if(++shots >= 14) clearInterval(fw);
        }, 420);
        setTimeout(() => { revealInit(); window.__startAmbient(); }, 400);
      }, 1500);
    }
  }, 1000);
}

function launchExperience(name){
  // small confetti during countdown "go"
  FX.burst(innerWidth/2, innerHeight/2, 60, 8);
}

/* ---------- SCROLL REVEALS ---------- */
function revealInit(){
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .25 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------- CAKE ---------- */
const cake = $('#cake');
let blown = false;
function blowCandles(){
  if(blown) return; blown = true;
  $$('.candle').forEach((c,i) => setTimeout(() => c.classList.add('out'), i*130));
  $('#cakeTip').hidden = true;
  setTimeout(() => {
    const done = $('#cakeDone'); done.hidden = false;
    FX.burst(innerWidth/2, innerHeight*.55, 120, 12);
    let shots = 0;
    const fw = setInterval(() => { FX.firework(); if(++shots >= 6) clearInterval(fw); }, 380);
  }, 950);
}
cake.addEventListener('click', blowCandles);
cake.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); blowCandles(); } });

/* ---------- REPLAY ---------- */
$('#replayBtn').addEventListener('click', () => {
  blown = false;
  $$('.candle').forEach(c => c.classList.remove('out'));
  $('#cakeDone').hidden = true;
  $('#cakeTip').hidden = false;
  $$('.reveal').forEach(el => el.classList.remove('in'));
  window.scrollTo({ top: 0, behavior: 'auto' });
  setTimeout(() => { revealInit(); FX.cannons(120); }, 100);
});