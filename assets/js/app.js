/**
 * 2026 紐西蘭南北島夢幻仙境之旅 - 核心互動邏輯與應用
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.NZ_TRIP_DATA;
  if (!data) {
    console.error('Trip data not loaded.');
    return;
  }

  // 1. 初始化倒數計時器
  initCountdown(data.tripMeta.startDate);

  // 2. 主題切換 (星空 / 極光 / 晨曦)
  initThemeSwitcher();

  // 3. 星空動態粒子 Canvas
  initStarfield();

  // 4. 自然氛圍白噪音播放器 (Web Audio API)
  initAmbientAudio();

  // 5. 渲染動態路線地圖
  initRouteMap(data.itinerary);

  // 6. 渲染 30 天詳細行程時間軸
  initItinerary(data.itinerary);

  // 7. 渲染深度擴充指南 (7 大指南)
  initGuides(data.guides);

  // 8. 渲染互動行李打包清單
  initPackingList(data.packing);

  // 9. 渲染即時匯率換算器
  initCurrencyConverter();

  // 10. 渲染共同行程分帳計算機
  initExpenseSplitter(data.expenseRules);
});

/* ==========================================================
   1. 出發倒數計時器
   ========================================================== */
function initCountdown(targetDateStr) {
  const targetDate = new Date(targetDateStr).getTime();
  const dEl = document.getElementById('count-days');
  const hEl = document.getElementById('count-hours');
  const mEl = document.getElementById('count-mins');
  const sEl = document.getElementById('count-secs');

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (dEl) dEl.textContent = '00';
      if (hEl) hEl.textContent = '00';
      if (mEl) mEl.textContent = '00';
      if (sEl) sEl.textContent = '00';
      const header = document.querySelector('.countdown-header');
      if (header) header.innerHTML = '🎉 旅程已經啟航！中土世界冒險進行中！';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(mins).padStart(2, '0');
    if (sEl) sEl.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================
   2. 主題切換 (星空 / 極光 / 晨曦)
   ========================================================== */
function initThemeSwitcher() {
  const themes = [
    { id: 'tekapo', label: '🌌 蒂卡波星空' },
    { id: 'aurora', label: '🌈 南島極光' },
    { id: 'dawn', label: '🌅 瓦卡蒂普晨曦' }
  ];

  let currentIdx = 0;
  const saved = localStorage.getItem('nz_theme');
  if (saved) {
    const found = themes.findIndex(t => t.id === saved);
    if (found !== -1) currentIdx = found;
  }

  applyTheme(themes[currentIdx].id);

  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>${themes[currentIdx].label}</span>`;
    btn.addEventListener('click', () => {
      currentIdx = (currentIdx + 1) % themes.length;
      const nextTheme = themes[currentIdx];
      applyTheme(nextTheme.id);
      btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>${nextTheme.label}</span>`;
      localStorage.setItem('nz_theme', nextTheme.id);
    });
  }
}

function applyTheme(themeId) {
  if (themeId === 'tekapo') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeId);
  }
}

/* ==========================================================
   3. 動態星空粒子 Canvas
   ========================================================== */
function initStarfield() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const stars = [];
  const count = Math.floor((width * height) / 8000);

  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
      delta: Math.random() * 0.02
    });
  }

  // 流星
  let meteors = [];
  function createMeteor() {
    if (Math.random() < 0.02 && meteors.length < 2) {
      meteors.push({
        x: Math.random() * width,
        y: Math.random() * (height / 2),
        len: Math.random() * 80 + 40,
        speed: Math.random() * 6 + 4,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        alpha: 1
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // 繪製微星
    stars.forEach(s => {
      s.alpha += s.delta;
      if (s.alpha > 0.9 || s.alpha < 0.2) s.delta = -s.delta;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, s.alpha)})`;
      ctx.fill();
    });

    // 繪製流星
    createMeteor();
    meteors.forEach((m, idx) => {
      const endX = m.x - Math.cos(m.angle) * m.len;
      const endY = m.y - Math.sin(m.angle) * m.len;

      const grad = ctx.createLinearGradient(m.x, m.y, endX, endY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= 0.015;

      if (m.alpha <= 0 || m.x > width || m.y > height) {
        meteors.splice(idx, 1);
      }
    });

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================
   4. 自然氛圍白噪音 (Web Audio API)
   ========================================================== */
function initAmbientAudio() {
  let audioCtx = null;
  let isPlaying = false;
  let noiseNode = null;
  let gainNode = null;

  const toggleBtn = document.getElementById('audio-toggle-btn');
  const pulseDot = document.getElementById('audio-pulse-dot');
  const label = document.getElementById('audio-label');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isPlaying) {
      startAmbientSound();
      isPlaying = true;
      if (pulseDot) pulseDot.classList.add('playing');
      if (label) label.textContent = '大自然白噪音: 播放中';
    } else {
      stopAmbientSound();
      isPlaying = false;
      if (pulseDot) pulseDot.classList.remove('playing');
      if (label) label.textContent = '大自然白噪音: 靜音';
    }
  });

  function startAmbientSound() {
    // 產生柔和粉紅噪聲 (如同南島湖水微風與森林沙沙聲)
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04; // 柔和微音量
      b6 = white * 0.115926;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // 低通濾波器模擬微風湖水
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, audioCtx.currentTime);

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 1.5);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start(0);
    noiseNode = whiteNoise;
  }

  function stopAmbientSound() {
    if (gainNode && audioCtx) {
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      setTimeout(() => {
        if (noiseNode) {
          noiseNode.stop();
          noiseNode.disconnect();
        }
      }, 800);
    }
  }
}

/* ==========================================================
   5. 渲染動態路線地圖 (SVG Map)
   ========================================================== */
function initRouteMap(days) {
  const container = document.getElementById('route-svg-container');
  const chipsScroll = document.getElementById('map-chips-container');
  if (!container) return;

  // 關鍵站點列表
  const keyStops = [
    { day: 1, name: '奧克蘭起點', x: 740, y: 70, island: 'north' },
    { day: 7, name: '漢密爾頓', x: 730, y: 110, island: 'north' },
    { day: 8, name: '懷托摩 & 哈比村', x: 710, y: 140, island: 'north' },
    { day: 9, name: '跨島飛抵皇后鎮', x: 260, y: 340, island: 'south' },
    { day: 10, name: 'Shotover 峽谷', x: 250, y: 330, island: 'south' },
    { day: 11, name: 'Jack\'s Point & 吉布斯頓', x: 270, y: 350, island: 'south' },
    { day: 12, name: '克倫威爾 & 瓦納卡', x: 290, y: 310, island: 'south' },
    { day: 13, name: '林迪斯隘口 & 蒂卡波', x: 370, y: 260, island: 'south' },
    { day: 14, name: '庫克山直升機冰川', x: 330, y: 240, island: 'south' },
    { day: 15, name: '內陸景觀公路 ➔ 基督城', x: 440, y: 230, island: 'south' },
    { day: 17, name: '露營車首航 ➔ 亞瑟隘口', x: 390, y: 200, island: 'south' },
    { day: 18, name: '納尼亞巨石 ➔ 霍基蒂卡', x: 350, y: 180, island: 'south' },
    { day: 19, name: '牛奶藍峽谷 ➔ 法蘭茲冰川', x: 310, y: 220, island: 'south' },
    { day: 20, name: '馬瑟森鏡面湖 ➔ 哈斯特', x: 270, y: 260, island: 'south' },
    { day: 21, name: '哈斯特瀑布 ➔ 哈威亞湖營地', x: 290, y: 290, island: 'south' },
    { day: 23, name: '皇后鎮纜車滑車二刷', x: 255, y: 345, island: 'south' },
    { day: 25, name: '隧道海灘 ➔ 達尼丁', x: 390, y: 370, island: 'south' },
    { day: 26, name: '莫埃拉基巨石 ➔ 奧馬魯藍企鵝', x: 420, y: 330, island: 'south' },
    { day: 27, name: '基督城還車打包', x: 450, y: 235, island: 'south' },
    { day: 29, name: '奧克蘭滿載返台', x: 740, y: 70, island: 'north' }
  ];

  // 繪製 SVG
  let pathD = `M ${keyStops[0].x} ${keyStops[0].y}`;
  for (let i = 1; i < keyStops.length; i++) {
    const prev = keyStops[i - 1];
    const curr = keyStops[i];
    // 跨島飛機航線虛線
    if (curr.day === 9 || curr.day === 28) {
      pathD += ` M ${curr.x} ${curr.y}`;
    } else {
      const cx = (prev.x + curr.x) / 2;
      const cy = (prev.y + curr.y) / 2;
      pathD += ` Q ${cx} ${cy - 10}, ${curr.x} ${curr.y}`;
    }
  }

  let svgHtml = `
    <svg viewBox="0 0 900 440" width="100%" height="100%" style="display:block;">
      <defs>
        <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#10b981" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.9"/>
        </linearGradient>
        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- 裝飾網格與指北針 -->
      <circle cx="100" cy="80" r="35" stroke="rgba(255,255,255,0.1)" fill="none" stroke-width="1"/>
      <path d="M 100 50 L 100 110 M 70 80 L 130 80" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <text x="100" y="44" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">N</text>

      <!-- 紐西蘭全島簡約背景輪廓示意 -->
      <path d="M 720 40 Q 760 60 780 100 T 730 180 T 670 140 Z" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <path d="M 450 150 Q 480 220 430 350 T 260 400 T 200 330 T 360 170 Z" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.25)" stroke-width="1.5" stroke-dasharray="4 4"/>
      
      <!-- 跨島飛行虛線 -->
      <path d="M 730 120 Q 500 200 260 340" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="6 6" opacity="0.75"/>
      <text x="510" y="215" fill="#f43f5e" font-size="11" font-weight="bold">✈️ 跨島航班 NZ623</text>

      <!-- 公路軌跡主線條 -->
      <path d="${pathD}" fill="none" stroke="url(#routeGrad)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowEffect)"/>

      <!-- 各站錨點與標籤 -->
      ${keyStops.map(s => `
        <g class="map-node" data-day="${s.day}" style="cursor:pointer;" onclick="scrollToDay(${s.day})">
          <circle cx="${s.x}" cy="${s.y}" r="6" fill="#070b19" stroke="#38bdf8" stroke-width="2.5" filter="url(#glowEffect)"/>
          <circle cx="${s.x}" cy="${s.y}" r="2.5" fill="#fbbf24"/>
          <text x="${s.x + 10}" y="${s.y + 4}" fill="#f8fafc" font-size="11" font-weight="600" style="text-shadow: 0 2px 4px rgba(0,0,0,0.9);">${s.name}</text>
        </g>
      `).join('')}
    </svg>
  `;

  container.innerHTML = svgHtml;

  // 渲染水平橫向快捷 Chips
  if (chipsScroll) {
    chipsScroll.innerHTML = keyStops.map(s => `
      <div class="map-point-chip" onclick="scrollToDay(${s.day})">
        <i class="fa-solid fa-location-dot"></i>
        <span>Day ${s.day}: ${s.name}</span>
      </div>
    `).join('');
  }
}

// 捲動至特定天數並展開高亮
window.scrollToDay = function(dayNum) {
  const card = document.getElementById(`day-card-${dayNum}`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('expanded');
    card.style.borderColor = 'var(--secondary)';
    card.style.boxShadow = '0 0 25px var(--secondary-glow)';
    setTimeout(() => {
      card.style.borderColor = '';
      card.style.boxShadow = '';
    }, 2500);
  }
};

/* ==========================================================
   6. 渲染 30 天詳細行程
   ========================================================== */
function initItinerary(days) {
  const container = document.getElementById('itinerary-container');
  const filterTabs = document.querySelectorAll('.filter-tab-btn');
  const searchInput = document.getElementById('itinerary-search');
  const expandAllBtn = document.getElementById('btn-expand-all');
  const collapseAllBtn = document.getElementById('btn-collapse-all');

  let currentPhase = 'all';
  let searchTerm = '';

  function render() {
    if (!container) return;

    const filtered = days.filter(d => {
      const matchPhase = (currentPhase === 'all') || (d.phase === currentPhase);
      const str = `${d.day} ${d.title} ${d.content} ${d.region} ${d.stay} ${d.todos}`.toLowerCase();
      const matchSearch = !searchTerm || str.includes(searchTerm.toLowerCase());
      return matchPhase && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size:2rem; margin-bottom:1rem; color: var(--accent);"></i>
          <p>查無符合的行程，請嘗試更換篩選條件或關鍵字。</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(d => {
      const mapQuery = encodeURIComponent(`${d.locName || d.region} New Zealand`);
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

      return `
        <div class="day-card ${d.day === 1 ? 'expanded' : ''}" id="day-card-${d.day}">
          <div class="day-header" onclick="toggleDay(${d.day})">
            <div class="day-meta-left">
              <div class="day-badge">Day ${d.day}</div>
              <div class="day-title-box">
                <div class="day-date-line">
                  <span><i class="fa-regular fa-calendar"></i> ${d.date} (${d.weekday})</span>
                  <span>•</span>
                  <span><i class="fa-solid fa-map-pin"></i> ${d.locName || d.region}</span>
                </div>
                <div class="day-title-text">${d.title}</div>
              </div>
            </div>
            <div class="day-meta-right">
              <span class="phase-pill">${d.phaseName.split('：')[1] || d.phaseName}</span>
              <i class="fa-solid fa-chevron-down toggle-arrow"></i>
            </div>
          </div>

          <div class="day-body">
            <div class="day-detail-grid">
              <!-- 行程亮點 -->
              <div class="detail-block">
                <div class="detail-block-title">
                  <i class="fa-solid fa-sparkles"></i> <span>精選亮點與行程重點</span>
                </div>
                <ul class="highlight-list">
                  ${d.highlights.map(h => `<li><span>${h}</span></li>`).join('')}
                </ul>
              </div>

              <!-- 交通動線 -->
              <div class="detail-block">
                <div class="detail-block-title">
                  <i class="fa-solid fa-van-shuttle"></i> <span>交通方式與行車時間</span>
                </div>
                <div class="detail-block-desc">${d.transport || '步行慢活'}</div>
                <a href="${mapUrl}" target="_blank" rel="noopener" class="btn-nav-map">
                  <i class="fa-solid fa-diamond-turn-right"></i> Google 地圖導航定位
                </a>
              </div>

              <!-- 住宿或營地 -->
              <div class="detail-block">
                <div class="detail-block-title">
                  <i class="fa-solid fa-hotel"></i> <span>住宿 / 營位安排</span>
                </div>
                <div class="detail-block-desc">${d.stay.replace(/\n/g, '<br>')}</div>
              </div>

              <!-- 餐食推薦 -->
              <div class="detail-block">
                <div class="detail-block-title">
                  <i class="fa-solid fa-utensils"></i> <span>推薦餐食規劃</span>
                </div>
                <div class="detail-block-desc" style="font-size:0.85rem;">
                  <div><b>早餐：</b>${d.meals.breakfast}</div>
                  <div><b>午餐：</b>${d.meals.lunch}</div>
                  <div><b>晚餐：</b>${d.meals.dinner}</div>
                </div>
              </div>
            </div>

            <!-- 詳細全文內容 -->
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:1.2rem; margin-bottom:1rem; line-height:1.7;">
              <div style="font-weight:700; color:var(--accent); font-size:0.9rem; margin-bottom:0.4rem;">
                <i class="fa-solid fa-circle-info"></i> 詳細行程安排
              </div>
              <p style="font-size:0.93rem;">${d.content}</p>
            </div>

            <!-- 待辦事項 -->
            ${d.todos ? `
              <div style="background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.25); border-radius:12px; padding:0.9rem 1.2rem; margin-bottom:1rem; font-size:0.88rem; color:var(--secondary);">
                <i class="fa-solid fa-triangle-exclamation"></i> <b>特別叮嚀 / 待辦事項：</b> ${d.todos}
              </div>
            ` : ''}

            <!-- 預訂代號與快速複製標籤 -->
            ${d.bookingRefs && d.bookingRefs.length > 0 ? `
              <div class="ref-codes-row">
                <span style="font-size:0.82rem; color:var(--text-muted); align-self:center;">一鍵複製憑證：</span>
                ${d.bookingRefs.map(ref => `
                  <div class="ref-code-tag" onclick="copyText('${ref.code}', '${ref.label}')" title="點擊複製代碼">
                    <i class="fa-regular fa-copy"></i>
                    <span>${ref.label}: <b>${ref.code}</b></span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // 篩選 Tab 事件
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPhase = tab.dataset.phase;
      render();
    });
  });

  // 搜尋事件
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      render();
    });
  }

  // 全部展開 / 折疊
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.day-card').forEach(c => c.classList.add('expanded'));
    });
  }
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.day-card').forEach(c => c.classList.remove('expanded'));
    });
  }

  render();
}

window.toggleDay = function(dayNum) {
  const card = document.getElementById(`day-card-${dayNum}`);
  if (card) {
    card.classList.toggle('expanded');
  }
};

window.copyText = function(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`已複製 ${label}：${text}`);
  }).catch(() => {
    prompt('請手動複製代碼：', text);
  });
};

/* ==========================================================
   7. 渲染深度擴充指南 (7 大指南)
   ========================================================== */
function initGuides(guides) {
  const tabContainer = document.getElementById('guide-tabs-container');
  const contentContainer = document.getElementById('guide-content-container');
  if (!tabContainer || !contentContainer) return;

  const guideKeys = Object.keys(guides);
  let activeKey = guideKeys[0];

  function renderTabs() {
    tabContainer.innerHTML = guideKeys.map(k => {
      const g = guides[k];
      return `
        <button class="guide-tab-btn ${k === activeKey ? 'active' : ''}" onclick="switchGuide('${k}')">
          <i class="fa-solid ${g.icon}"></i>
          <span>${g.title.split(' ')[0]}</span>
        </button>
      `;
    }).join('');
  }

  function renderContent() {
    const g = guides[activeKey];
    contentContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:1rem;">
        <div>
          <h3 style="font-size:1.4rem; font-weight:700; color:var(--text-main); margin-bottom:0.3rem;">
            <i class="fa-solid ${g.icon}" style="color:var(--accent); margin-right:0.5rem;"></i>
            ${g.title}
          </h3>
          <p style="color:var(--text-muted); font-size:0.92rem;">${g.desc}</p>
        </div>
        <span class="hero-badge" style="margin-bottom:0; font-size:0.8rem;">${g.badge}</span>
      </div>

      <div class="guide-cards-grid">
        ${g.cards.map(c => `
          <div class="guide-item-card">
            <div class="guide-item-title">${c.title}</div>
            <div class="guide-item-desc">${c.content}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  window.switchGuide = function(key) {
    activeKey = key;
    renderTabs();
    renderContent();
  };

  renderTabs();
  renderContent();
}

/* ==========================================================
   8. 渲染互動行李打包清單
   ========================================================== */
function initPackingList(categories) {
  const container = document.getElementById('packing-categories-container');
  const progressFill = document.getElementById('packing-progress-fill');
  const progressPercent = document.getElementById('packing-progress-percent');
  const progressCount = document.getElementById('packing-progress-count');
  const resetBtn = document.getElementById('btn-reset-packing');

  if (!container) return;

  const storageKey = 'nz_trip_packing_v1';
  let checkedState = {};
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) checkedState = JSON.parse(saved);
  } catch (e) {
    checkedState = {};
  }

  function updateProgress() {
    let total = 0;
    let checked = 0;
    categories.forEach(cat => {
      cat.items.forEach(item => {
        total++;
        if (checkedState[item]) checked++;
      });
    });

    const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressPercent) progressPercent.textContent = `${pct}%`;
    if (progressCount) progressCount.textContent = `已打包 ${checked} / ${total} 項`;
  }

  function render() {
    container.innerHTML = categories.map((cat, catIdx) => `
      <div class="pack-cat-card">
        <div class="pack-cat-title">
          <i class="fa-solid ${cat.icon}"></i>
          <span>${cat.category}</span>
        </div>
        <div class="pack-items-list">
          ${cat.items.map((item, itemIdx) => {
            const isChecked = !!checkedState[item];
            return `
              <label class="pack-item-row ${isChecked ? 'checked' : ''}">
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="togglePackItem('${item.replace(/'/g, "\\'")}')">
                <span>${item}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    updateProgress();
  }

  window.togglePackItem = function(itemText) {
    checkedState[itemText] = !checkedState[itemText];
    localStorage.setItem(storageKey, JSON.stringify(checkedState));
    render();
  };

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('確定要清空所有已勾選的行李項目嗎？')) {
        checkedState = {};
        localStorage.removeItem(storageKey);
        render();
      }
    });
  }

  render();
}

/* ==========================================================
   9. 渲染即時匯率換算器
   ========================================================== */
function initCurrencyConverter() {
  const nzdInput = document.getElementById('calc-nzd');
  const twdInput = document.getElementById('calc-twd');
  const usdInput = document.getElementById('calc-usd');

  const rateNZDtoTWD = 19.5;
  const rateUSDtoTWD = 32.0;

  if (nzdInput) {
    nzdInput.addEventListener('input', () => {
      const nzd = parseFloat(nzdInput.value) || 0;
      const twd = nzd * rateNZDtoTWD;
      const usd = twd / rateUSDtoTWD;
      if (twdInput) twdInput.value = twd.toFixed(1);
      if (usdInput) usdInput.value = usd.toFixed(1);
    });
  }

  if (twdInput) {
    twdInput.addEventListener('input', () => {
      const twd = parseFloat(twdInput.value) || 0;
      const nzd = twd / rateNZDtoTWD;
      const usd = twd / rateUSDtoTWD;
      if (nzdInput) nzdInput.value = nzd.toFixed(1);
      if (usdInput) usdInput.value = usd.toFixed(1);
    });
  }
}

/* ==========================================================
   10. 共同行程分帳計算機 (Derek 2人 / Simon 2人 / 阿冰哥 1人)
   ========================================================== */
function initExpenseSplitter(rules) {
  const tableBody = document.getElementById('expense-table-body');
  const summaryBox = document.getElementById('expense-summary-box');
  if (!tableBody || !rules) return;

  let items = [...rules.sampleItems];

  function calculate() {
    let totalDerekPaid = 0;
    let totalSimonPaid = 0;
    let totalIcePaid = 0;
    let grandTotalNZD = 0;

    const rateNZD = 1;
    const rateUSD = 1.62; // 1 USD ≈ 1.62 NZD
    const rateTWD = 1 / 19.5; // 19.5 TWD ≈ 1 NZD

    items.forEach(item => {
      let nzdVal = item.amount;
      if (item.currency === 'USD') nzdVal = item.amount * rateUSD;
      if (item.currency === 'TWD') nzdVal = item.amount * rateTWD;

      grandTotalNZD += nzdVal;
      if (item.payer.includes('Derek')) totalDerekPaid += nzdVal;
      else if (item.payer.includes('Simon')) totalSimonPaid += nzdVal;
      else totalIcePaid += nzdVal;
    });

    // 依人頭分攤：總共 5 份 (Derek 40%, Simon 40%, 阿冰哥 20%)
    const derekOught = grandTotalNZD * 0.4;
    const simonOught = grandTotalNZD * 0.4;
    const iceOught = grandTotalNZD * 0.2;

    const derekBalance = totalDerekPaid - derekOught;
    const simonBalance = totalSimonPaid - simonOught;
    const iceBalance = totalIcePaid - iceOught;

    tableBody.innerHTML = items.map((it, idx) => `
      <tr>
        <td style="padding:0.6rem 0.4rem; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.85rem;">${it.desc}</td>
        <td style="padding:0.6rem 0.4rem; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.85rem; color:var(--accent);">${it.payer}</td>
        <td style="padding:0.6rem 0.4rem; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.85rem; text-align:right;">${it.currency} $${it.amount.toLocaleString()}</td>
      </tr>
    `).join('');

    if (summaryBox) {
      summaryBox.innerHTML = `
        <div style="background:rgba(255,255,255,0.03); border-radius:14px; padding:1.2rem; margin-top:1.2rem;">
          <div style="font-weight:700; color:var(--accent); margin-bottom:0.8rem; font-size:0.95rem;">
            <i class="fa-solid fa-scale-balanced"></i> 結算平攤分析 (換算約 NZD $${Math.round(grandTotalNZD).toLocaleString()})
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.8rem; font-size:0.85rem;">
            <div style="background:rgba(255,255,255,0.04); padding:0.8rem; border-radius:10px;">
              <b>何志偉夫妻 (40%)</b><br>
              實付: NZD $${Math.round(totalDerekPaid)}<br>
              應攤: NZD $${Math.round(derekOught)}<br>
              <span style="color:${derekBalance >= 0 ? '#10b981' : '#f43f5e'}; font-weight:700;">
                ${derekBalance >= 0 ? `應收回 +NZD $${Math.round(derekBalance)}` : `應補付 -NZD $${Math.round(-derekBalance)}`}
              </span>
            </div>
            <div style="background:rgba(255,255,255,0.04); padding:0.8rem; border-radius:10px;">
              <b>Simon 夫妻 (40%)</b><br>
              實付: NZD $${Math.round(totalSimonPaid)}<br>
              應攤: NZD $${Math.round(simonOught)}<br>
              <span style="color:${simonBalance >= 0 ? '#10b981' : '#f43f5e'}; font-weight:700;">
                ${simonBalance >= 0 ? `應收回 +NZD $${Math.round(simonBalance)}` : `應補付 -NZD $${Math.round(-simonBalance)}`}
              </span>
            </div>
            <div style="background:rgba(255,255,255,0.04); padding:0.8rem; border-radius:10px;">
              <b>阿冰哥 (20%)</b><br>
              實付: NZD $${Math.round(totalIcePaid)}<br>
              應攤: NZD $${Math.round(iceOught)}<br>
              <span style="color:${iceBalance >= 0 ? '#10b981' : '#f43f5e'}; font-weight:700;">
                ${iceBalance >= 0 ? `應收回 +NZD $${Math.round(iceBalance)}` : `應補付 -NZD $${Math.round(-iceBalance)}`}
              </span>
            </div>
          </div>
        </div>
      `;
    }
  }

  calculate();
}