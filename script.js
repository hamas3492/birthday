/* ===== JANAM DIN MUBARAK — script v3 (GSAP scroll cinema + Taaj instrumental) ===== */
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const rand = (a,b)=>a+Math.random()*(b-a);

let experienceShown = false;
let gsapActive = false;

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

/* ---------- SCROLL PROGRESS ---------- */
addEventListener('scroll', () => {
  const h = document.documentElement;
  const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
  const fill = $('#pfill');
  if(fill) fill.style.width = (p*100)+'%';
}, { passive: true });

/* ---------- PARTICLE ENGINE (confetti + fireworks) ---------- */
const FX = (function(){
  const canvas = $('#fx'), ctx = canvas.getContext('2d');
  let pieces = [], rockets = [];
  const COLORS = ['#8b5cf6','#22d3ee','#ec4899','#fbbf24','#f472b6','#a78bfa','#ffffff','#fde68a'];
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  let scaled = false;
  function resize(){
    canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth+'px'; canvas.style.height = innerHeight+'px';
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); scaled = true;
  }
  addEventListener('resize', resize);

  function burst(x, y, count=90, power=11){
    for(let i=0;i<count;i++){
      const a = rand(0, Math.PI*2), v = rand(3, power);
      pieces.push({ x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v - 3,
        w:rand(6,12), h:rand(3,7), rot:rand(0,Math.PI*2), vr:rand(-.25,.25),
        c:pick(COLORS), life:1, decay:rand(.006,.012), shape:Math.random()<.35?'circle':'rect' });
    }
    if(pieces.length>600) pieces.splice(0, pieces.length-600);
  }
  function cannons(count=120){
    const H0 = innerHeight*.78;
    burst(30, H0, count/2, 16);
    burst(innerWidth-30, H0, count/2, 16);
  }
  function firework(x){
    rockets.push({ x: x!==undefined ? x : rand(innerWidth*.15, innerWidth*.85),
      y: innerHeight+10, vy:-rand(9,12), target:rand(innerHeight*.18, innerHeight*.45) });
  }
  function explode(r){
    const count = 90, base = rand(0,Math.PI*2);
    for(let i=0;i<count;i++){
      const a = base + (i/count)*Math.PI*2, v = rand(2,5.5);
      pieces.push({ x:r.x, y:r.y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, w:3, h:3,
        rot:0, vr:0, c:pick(COLORS), life:1, decay:rand(.008,.016), shape:'spark', glow:true });
    }
  }
  (function loop(){
    if(!scaled) resize();
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(let i=rockets.length-1;i>=0;i--){
      const r = rockets[i];
      r.y += r.vy; r.vy += .12;
      ctx.beginPath(); ctx.arc(r.x,r.y,2.6,0,Math.PI*2); ctx.fillStyle='#ffe9a8'; ctx.fill();
      ctx.beginPath(); ctx.arc(r.x,r.y+9,1.6,0,Math.PI*2); ctx.fillStyle='rgba(255,200,120,.5)'; ctx.fill();
      if(r.y <= r.target || r.vy > -1){ explode(r); rockets.splice(i,1); }
    }
    for(let i=pieces.length-1;i>=0;i--){
      const p = pieces[i];
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      p.vy += p.shape==='spark' ? .045 : .18;
      p.vx *= p.shape==='spark' ? .985 : .992;
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
  })();
  return { burst, cannons, firework };
})();

/* ---------- AMBIENT BALLOONS (mobile-tuned) ---------- */
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
  let started = false;
  window.__startAmbient = () => {
    if(started) return; started = true;
    const isMobile = window.innerWidth < 600;
    spawn(); if(!isMobile) spawn();
    setInterval(spawn, isMobile ? 3200 : 2400);
  };
})();

/* ---------- TAP HEARTS (jaadu har tap pe) ---------- */
document.addEventListener('click', e => {
  if(!experienceShown) return;
  if(e.target.closest('button, a, input, .cake, #musicToggle')) return;
  spawnTapHearts(e.clientX, e.clientY);
});
function spawnTapHearts(x, y){
  const EMOJIS = ['💖','💖','💖','✨','🌙','🧿'];
  const n = 2 + Math.floor(Math.random()*3);
  for(let i=0;i<n;i++){
    const h = document.createElement('span');
    h.className = 'tap-heart';
    h.textContent = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
    h.style.left = (x + rand(-22,22))+'px';
    h.style.top = (y + rand(-14,14))+'px';
    h.style.fontSize = rand(14,26)+'px';
    h.style.setProperty('--dur', rand(.9,1.6)+'s');
    document.body.appendChild(h);
    setTimeout(()=>h.remove(), 1700);
  }
}

/* ---------- MUSIC BOX (Web Audio — guaranteed fallback) ---------- */
const MusicBox = (function(){
  let ctx=null, master=null, delay=null, playing=false, loopTO=null, initialized=false;
  const FREQ = {G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,C3:130.81,G3:196};
  const MELODY = [
    ['G4',.5],['G4',.5],['A4',1],['G4',1],['C5',1],['B4',1.7],['r',.3],
    ['G4',.5],['G4',.5],['A4',1],['G4',1],['D5',1],['C5',1.7],['r',.3],
    ['G4',.5],['G4',.5],['G5',1],['E5',1],['C5',1],['B4',1],['A4',1.7],['r',.3],
    ['F5',.5],['F5',.5],['E5',1],['C5',1],['D5',1],['C5',2.2],['r',1.6],
  ];
  function init(){ // MUST be called inside a user gesture (iOS unlock)
    if(initialized) return;
    try{
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination);
      delay = ctx.createDelay(); delay.delayTime.value = .3;
      const fb = ctx.createGain(); fb.gain.value = .32;
      const wet = ctx.createGain(); wet.gain.value = .18;
      delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
      if(ctx.state === 'suspended') ctx.resume();
      initialized = true;
    }catch(e){}
  }
  function tone(freq, t, dur, vol=.5, isBass=false){
    if(!freq || !ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = isBass ? 'sine' : 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(master); g.connect(delay);
    o.start(t); o.stop(t + dur + .05);
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
  function scheduleLoop(){
    if(!playing || !ctx) return;
    const beat = .48;
    const startAt = ctx.currentTime + .08;
    let t = startAt;
    MELODY.forEach(([n,b])=>{ if(n!=='r') tone(FREQ[n], t, Math.max(b*beat*.9,.35), .4); t += b*beat; });
    [FREQ.G3, FREQ.G3, FREQ.C3, FREQ.C3].forEach((root,i)=>{
      const phrase = [0, 3.4, 6.9, 10.3];
      if(root && phrase[i]!==undefined) tone(root, startAt + phrase[i]*beat, beat*3, .15, true);
    });
    loopTO = setTimeout(scheduleLoop, (t - ctx.currentTime + 1.2) * 1000);
  }
  function start(){ if(!initialized) return; if(ctx.state==='suspended') ctx.resume(); if(playing) return; playing = true; master.gain.value = .5; scheduleLoop(); }
  function stop(){ playing = false; clearTimeout(loopTO); if(master && ctx) master.gain.setTargetAtTime(0, ctx.currentTime, .15); }
  return { init, start, stop, get playing(){return playing;}, get ready(){return initialized;} };
})();

/* ---------- YOUTUBE PLAYER (Taaj Instrumental — Lost Stories) ---------- */
const TAAJ_ID = 'h7r67MpcGAQ';
const YTPlayer = (function(){
  let player=null, created=false, ready=false, needsTap=false, apiRequested=false;
  let playingState=false, confirmed=false;

  function loadAPI(cb){
    if(window.YT && window.YT.Player){ cb(); return; }
    window.onYouTubeIframeAPIReady = cb;
    if(apiRequested) return;
    apiRequested = true;
    const t = document.createElement('script');
    t.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(t);
  }
  function create(){ // MUST be called inside user gesture
    loadAPI(function(){
      if(created || !document.getElementById('ytPlayer')) return;
      try{
        player = new YT.Player('ytPlayer', {
          videoId: TAAJ_ID,
          playerVars: { autoplay:0, controls:0, playsinline:1, rel:0, modestbranding:1, iv_load_policy:3 },
          events: {
            onReady: function(){
              ready = true;
              try{ player.setVolume(65); player.mute(); player.playVideo(); }catch(e){}
            },
            onStateChange: function(e){
              const S = YT.PlayerState;
              if(e.data === S.PLAYING){
                playingState = true;
                try{ if(!player.isMuted()){ onConfirmed(); } }catch(err){}
              }
              else if(e.data === S.PAUSED){ playingState = false; }
              else if(e.data === S.ENDED){ try{ player.seekTo(0); player.playVideo(); }catch(e2){} }
            },
            onError: function(){ confirmed = false; playingState = false; }
          }
        });
        created = true;
      }catch(e){}
    });
  }
  function onConfirmed(){
    confirmed = true; needsTap = false;
    const btn = $('#musicToggle');
    if(btn){ btn.classList.remove('needsTap'); btn.textContent = '🔊'; }
    MusicBox.stop();
  }
  function unmuteAndPlay(){
    if(!ready) return false;
    try{
      player.unMute(); player.setVolume(65); player.playVideo();
      let tries = 0;
      const poll = setInterval(() => {
        if(checkPlaying()){ clearInterval(poll); onConfirmed(); }
        else if(++tries >= 6){ clearInterval(poll); }
      }, 500);
      return true;
    }catch(e){ return false; }
  }
  function checkPlaying(){
    if(!ready) return false;
    try{ return playingState && !player.isMuted(); }catch(e){ return false; }
  }
  function pause(){ if(ready){ try{ player.pauseVideo(); }catch(e){} } }
  function resume(){ if(ready){ try{ player.playVideo(); }catch(e){} } }
  return {
    create, unmuteAndPlay, pause, resume, checkPlaying,
    get created(){ return created; }, get ready(){ return ready; },
    get confirmed(){ return confirmed; }, get playing(){ return playingState; },
    get needsTap(){ return needsTap; }, set needsTap(v){ needsTap = v; }
  };
})();

/* ---------- MUSIC TOGGLE ---------- */
let userMuted = false;
$('#musicToggle').addEventListener('click', () => {
  const btn = $('#musicToggle');
  if(YTPlayer.created && YTPlayer.ready && !YTPlayer.confirmed && !userMuted){
    if(YTPlayer.unmuteAndPlay()){
      MusicBox.stop();
      return;
    }
  }
  userMuted = !userMuted;
  if(YTPlayer.confirmed){
    userMuted ? YTPlayer.pause() : YTPlayer.resume();
  } else if(MusicBox.ready){
    userMuted ? MusicBox.stop() : MusicBox.start();
  }
  btn.classList.remove('needsTap');
  btn.textContent = userMuted ? '🔇' : '🔊';
});

/* ---------- GSAP SCROLL CINEMA ---------- */
function setNameLetters(name){
  const el = $('#bigName');
  el.innerHTML = '';
  [...name].forEach(ch => {
    const m = document.createElement('span'); m.className = 'lmask';
    const c = document.createElement('span'); c.className = 'lchar';
    c.textContent = ch === ' ' ? '\u00A0' : ch;
    m.appendChild(c); el.appendChild(m);
  });
}

function buildScrollFX(){
  if(!window.gsap || !window.ScrollTrigger){
    revealFallback();
    return false;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsapActive = true;

  // .reveal class hatao — GSAP inline styles control karega
  $$('.reveal').forEach(el => el.classList.remove('reveal'));

  // initial states
  gsap.set('.lline', { yPercent: 115 });
  gsap.set('#bigName .lchar', { yPercent: 120, rotate: 6 });
  gsap.set('[data-anim="fade"]', { opacity: 0, y: 40 });
  gsap.set('[data-anim="left"]', { opacity: 0, x: -70, rotate: -2 });
  gsap.set('[data-anim="right"]', { opacity: 0, x: 70, rotate: 2 });
  gsap.set('[data-anim="pop"]', { opacity: 0, scale: .65, y: 20 });

  // ===== INTRO — countdown ke baad khud chalta hai =====
  window.__playIntro = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.scene--intro .lline', { yPercent: 0, duration: .95, stagger: .12 })
      .to('#bigName .lchar', { yPercent: 0, rotate: 0, duration: .7, stagger: .035, ease: 'back.out(1.7)' }, '-=.45')
      .to('.scene--intro [data-anim="fade"]', { opacity: 1, y: 0, duration: .8, stagger: .15, ease: 'power3.out' }, '-=.4');
  };

  // ===== STORY — lines ek ek karke scroll pe =====
  gsap.utils.toArray('.story__line').forEach((line, i) => {
    gsap.to(line.querySelectorAll('.lline'), { yPercent: 0, duration: .9, ease: 'power4.out',
      scrollTrigger: { trigger: line, start: 'top 80%', once: true } });
    gsap.to(line, { opacity: 1, y: 0, duration: .8, delay: .15, ease: 'power3.out',
      scrollTrigger: { trigger: line, start: 'top 80%', once: true } });
  });

  // ===== SCENE HEADS — masked reveals =====
  $$('.scene').forEach(scene => {
    if(scene.classList.contains('scene--intro') || scene.classList.contains('scene--story')) return;
    const lines = scene.querySelectorAll('.scr__head .lline, .fin__big .lline, .fin__name .lline');
    if(lines.length){
      gsap.to(lines, { yPercent: 0, duration: .95, stagger: .14, ease: 'power4.out',
        scrollTrigger: { trigger: scene, start: 'top 68%', once: true } });
    }
    const fades = scene.querySelectorAll('[data-anim="fade"]');
    if(fades.length){
      gsap.to(fades, { opacity: 1, y: 0, duration: .8, stagger: .16, ease: 'power3.out',
        scrollTrigger: { trigger: scene, start: 'top 55%', once: true } });
    }
  });

  // ===== WISHES — left/right se aate hain =====
  gsap.utils.toArray('.wish').forEach(w => {
    gsap.to(w, { opacity: 1, x: 0, rotate: 0, duration: .95, ease: 'power3.out',
      scrollTrigger: { trigger: w, start: 'top 85%', once: true } });
  });

  // ===== CAKE — bounce =====
  gsap.to('.cake', { opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.5)',
    scrollTrigger: { trigger: '.cake', start: 'top 82%', once: true } });

  // ===== BUTTONS — pop =====
  gsap.utils.toArray('[data-anim="pop"]').forEach(el => {
    gsap.to(el, { opacity: 1, scale: 1, y: 0, duration: .7, ease: 'back.out(2)',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // ===== STICKERS — parallax =====
  gsap.utils.toArray('.sticker').forEach((s, i) => {
    gsap.to(s, { yPercent: i % 2 ? -60 : 60, ease: 'none',
      scrollTrigger: { trigger: s.closest('.scene'), start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
  });

  // ===== SCENE ENTRY — chhota confetti pop =====
  $$('.scene').forEach(scene => {
    if(scene.classList.contains('scene--intro')) return;
    ScrollTrigger.create({
      trigger: scene, start: 'top 62%', once: true,
      onEnter: () => FX.burst(innerWidth/2, innerHeight*.38, 35, 7)
    });
  });

  ScrollTrigger.refresh();
  return true;
}

/* ---------- FALLBACK (no GSAP) ---------- */
function revealFallback(){
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .25 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------- FLOW: NAME → SUSPENSE → COUNTDOWN → EXPERIENCE ---------- */
const nameInput = $('#nameInput'), startBtn = $('#startBtn');
const param = new URLSearchParams(location.search).get('name');
if(param){ nameInput.value = param.slice(0,24); }

function sanitize(s){ return s.replace(/[<>&"]/g,'').trim().slice(0,24); }

startBtn.addEventListener('click', begin);
nameInput.addEventListener('keydown', e => { if(e.key === 'Enter') begin(); });

function begin(){
  const name = sanitize(nameInput.value) || 'Dost';
  setNameLetters(name);
  $('#finalNameLine').textContent = `Janam Din Mubarak, ${name}!`;
  const count = $('#countdown'), suspense = $('#countSuspense'), num = $('#countNum'), go = $('#countGo');

  // === USER GESTURE KE ANDAR (iOS unlock) ===
  MusicBox.init();
  YTPlayer.create();

  $('#nameScreen').classList.add('hide');
  count.classList.add('show');
  suspense.classList.add('show');

  // Suspense → countdown → dhamaka
  setTimeout(() => {
    suspense.classList.remove('show');
    num.textContent = '3'; num.classList.add('pop');
    let step = 2;
    const iv = setInterval(() => {
      if(step > 0){
        num.classList.remove('pop'); void num.offsetWidth;
        num.textContent = step; num.classList.add('pop');
        step--;
      } else {
        clearInterval(iv);
        num.style.display = 'none';
        go.classList.add('show');

        // === DHAMAKA + TAAJ (Instrumental) ===
        FX.burst(innerWidth/2, innerHeight*.35, 130, 13);
        YTPlayer.unmuteAndPlay();

        // 3.2s baad — YT block hua to music box fallback + manual tap hint (iOS)
        setTimeout(() => {
          if(!YTPlayer.checkPlaying()){
            if(!userMuted) MusicBox.start();
            if(YTPlayer.created && YTPlayer.ready){
              YTPlayer.needsTap = true;
              const b = $('#musicToggle');
              b.classList.add('needsTap');
              b.textContent = '🎵';
            }
          }
        }, 3200);

        setTimeout(() => {
          count.classList.remove('show');
          $('#experience').removeAttribute('hidden');
          experienceShown = true;
          window.scrollTo(0,0);
          FX.cannons(150);
          let shots = 0;
          const fw = setInterval(() => { FX.firework(); if(++shots >= 14) clearInterval(fw); }, 420);
          setTimeout(() => {
            buildScrollFX();
            window.__startAmbient();
            if(gsapActive) setTimeout(() => window.__playIntro && window.__playIntro(), 250);
          }, 300);
        }, 1600);
      }
    }, 1000);
  }, 1900);
}

/* ---------- CAKE ---------- */
const cake = $('#cake');
let blown = false;
function blowCandles(){
  if(blown) return; blown = true;
  $$('.candle').forEach((c,i) => setTimeout(() => c.classList.add('out'), i*130));
  $('#cakeTip').hidden = true;
  if(gsapActive){
    gsap.fromTo('#cakeDone', {opacity:0, y:30, scale:.9}, {opacity:1, y:0, scale:1, duration:.8, ease:'back.out(2)'});
  }
  setTimeout(() => {
    $('#cakeDone').hidden = false;
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
  window.scrollTo({ top: 0, behavior: 'auto' });
  setTimeout(() => {
    FX.cannons(120);
    if(gsapActive){
      // intro dobara chalao — naam letters wapas animate
      gsap.set('#bigName .lchar', { yPercent: 120, rotate: 6 });
      gsap.set('.scene--intro .lline', { yPercent: 115 });
      gsap.set('.scene--intro [data-anim="fade"]', { opacity: 0, y: 40 });
      window.__playIntro();
    } else {
      $$('.reveal').forEach(el => el.classList.remove('in'));
      revealFallback();
    }
  }, 150);
});