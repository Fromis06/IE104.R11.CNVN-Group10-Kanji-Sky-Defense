(function () {
  'use strict';
  const utils = window.KanjiUtils;
  const review = window.KanjiStorage.review;
  const canvas = document.querySelector('#game-canvas');
  const ctx = canvas.getContext('2d');
  const input = document.querySelector('#answer-input');
  const feedback = document.querySelector('#feedback');
  let source = utils.sample.slice();
  let queue = [], target = null, y = 0, score = 0, combo = 0, hp = 3, running = false, paused = false;
  let mode = 'study';
  // vẽ lại list từ sai sau mỗi lần nhập sai
  function renderReview() {
    const list = document.querySelector('#review-list');
    list.replaceChildren();
    review.load().forEach(word => { const li=document.createElement('li'); li.textContent=word.kanji+' — '+word.hiragana; list.append(li); });
  }
  function next() {
    target = queue.shift() || null;
    y = 25;
    if(!target) { running=false; feedback.textContent='Đã hoàn thành bộ từ. Bấm Bắt đầu để chơi lại.'; }
  }
  document.querySelector('#start-button').addEventListener('click', () => {
    queue=source.slice(); score=0; combo=0; hp=3; paused=false; running=true;
    mode='study';
    document.querySelector('#view-play').hidden=false;
    window.KanjiStorage.activity.recordSession(); next(); input.focus();
  });
  document.querySelector('#answer-form').addEventListener('submit', event => {
    event.preventDefault();
    if(!running || paused || !target ) return;
    if(utils.matches(input.value,target)) {
      combo += 1; score += utils.score(target.hiragana,combo); feedback.textContent='Đúng!'; next();
    } else { review.remember(target); combo=0; feedback.textContent='Chưa đúng, thử lại.'; renderReview(); }
    input.value='';
  });
  
  // mỗi lần cộng y một ít, chưa biết chỉnh cho tốc độ đều trên các máy
  function frame() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#ff8a3d'; ctx.beginPath(); ctx.moveTo(0,320); ctx.lineTo(700,320); ctx.stroke();
    if(running && target) {
      if(!paused) y += .7;
      ctx.fillStyle='#f2ede2'; ctx.font='30px sans-serif'; ctx.fillText(target.kanji,310,y);
      if(y>=320) {
        review.remember(target); renderReview();
        if(mode==='challenge') hp-=1;
        if(mode==='challenge' && hp<=0) { running=false; feedback.textContent='Hết HP. Bấm Bắt đầu để thử lại.'; }
        else next();
      }
    }
    document.querySelector('#game-status').textContent='Điểm: '+score+' · Combo: '+combo+(mode==='challenge'?' · HP: '+hp:'')+(paused?' · Tạm dừng':'');
    requestAnimationFrame(frame);
  }
  renderReview(); frame();
})();
