/**
 * FOIT EXAM PREP - Interactive Engine
 * Handles Text-to-Speech, Sound FX, Gamification, Word Scrambler & Type Checker
 */

// ================= GAMIFICATION & STATE =================
const FOIT_STATE = {
  getStorage() {
    try {
      const data = localStorage.getItem('foit_prep_state');
      return data ? JSON.parse(data) : {
        xp: 150,
        completed: {},
        theme: 'dark'
      };
    } catch (e) {
      return { xp: 150, completed: {}, theme: 'dark' };
    }
  },

  saveStorage(state) {
    try {
      localStorage.setItem('foit_prep_state', JSON.stringify(state));
    } catch (e) {}
  },

  addXP(amount, reason = '') {
    const s = this.getStorage();
    s.xp = (s.xp || 0) + amount;
    this.saveStorage(s);
    this.updateHeaderUI();
    if (window.soundFX) window.soundFX.success();
    this.showToast(`+${amount} XP ${reason ? '• ' + reason : ''}`, 'xp');
  },

  markCompleted(questionId) {
    const s = this.getStorage();
    if (!s.completed) s.completed = {};
    if (!s.completed[questionId]) {
      s.completed[questionId] = true;
      s.xp = (s.xp || 0) + 50;
      this.saveStorage(s);
      this.updateHeaderUI();
      this.showToast(`Tebrikler! Soru tamamlandı (+50 XP)`, 'success');
    }
  },

  isCompleted(questionId) {
    const s = this.getStorage();
    return !!(s.completed && s.completed[questionId]);
  },

  toggleTheme() {
    const s = this.getStorage();
    s.theme = s.theme === 'light' ? 'dark' : 'light';
    this.saveStorage(s);
    this.applyTheme(s.theme);
  },

  applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      const btn = document.getElementById('themeBtn');
      if (btn) btn.innerHTML = '🌙';
    } else {
      document.body.classList.remove('light-theme');
      const btn = document.getElementById('themeBtn');
      if (btn) btn.innerHTML = '☀️';
    }
  },

  updateHeaderUI() {
    const s = this.getStorage();
    const xpEl = document.getElementById('xpCounter');
    if (xpEl) xpEl.textContent = `${s.xp || 0} XP`;

    const isS2 = window.location.pathname.includes('s2_') || window.location.pathname.includes('scenario2');
    let compCount = 0;
    if (isS2) {
      compCount = [1, 2, 3, 4, 5, 6].filter(i => s.completed && s.completed['s2_q' + i]).length;
    } else {
      compCount = [1, 2, 3, 4, 5, 6].filter(i => s.completed && s.completed['q' + i]).length;
    }
    const progEl = document.getElementById('progressCounter');
    if (progEl) progEl.textContent = `${compCount} / 6 Soru`;

    // Highlight completed step dots
    document.querySelectorAll('.step-dot[data-qid]').forEach(dot => {
      const qid = dot.getAttribute('data-qid');
      if (s.completed && s.completed[qid]) {
        dot.classList.add('completed');
      }
    });
  },

  showToast(message, type = 'info') {
    let toast = document.getElementById('foitToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'foitToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 12px 20px;
        background: #1e293b;
        color: #f8fafc;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border: 1px solid #3b82f6;
        font-weight: 700;
        font-size: 0.9rem;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateY(100px);
        opacity: 0;
      `;
      document.body.appendChild(toast);
    }

    if (type === 'xp') {
      toast.style.borderColor = '#f59e0b';
      toast.innerHTML = `⚡ ${message}`;
    } else if (type === 'success') {
      toast.style.borderColor = '#10b981';
      toast.innerHTML = `🎉 ${message}`;
    } else {
      toast.style.borderColor = '#06b6d4';
      toast.innerHTML = `💡 ${message}`;
    }

    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 2800);
  }
};

// ================= WEB AUDIO SYNTHESIZER =================
class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, vol = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  click() {
    this.playTone(600, 'sine', 0.06, 0.08);
  }

  success() {
    this.playTone(523.25, 'triangle', 0.1, 0.15); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.12, 0.15), 90); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.2, 0.15), 180); // G5
  }

  error() {
    this.playTone(220, 'sawtooth', 0.15, 0.12);
    setTimeout(() => this.playTone(196, 'sawtooth', 0.25, 0.12), 120);
  }
}
window.soundFX = new SoundController();

// ================= TEXT-TO-SPEECH (SPEECH SYNTHESIS) =================
function speakText(text, btnElement) {
  if (!('speechSynthesis' in window)) {
    alert("Tarayıcınız ses sentezini (Text-to-Speech) desteklemiyor.");
    return;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech

  const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[•\-*]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'en-US';
  utterance.rate = 0.92; // slightly slower for exam clarity
  utterance.pitch = 1.0;

  // Try selecting an English voice if available
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
  if (enVoice) utterance.voice = enVoice;

  if (btnElement) {
    btnElement.classList.add('speaking');
    utterance.onend = () => btnElement.classList.remove('speaking');
    utterance.onerror = () => btnElement.classList.remove('speaking');
  }

  window.speechSynthesis.speak(utterance);
}

// ================= TAB SWITCHER =================
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  const pane = document.getElementById(tabId);

  if (btn) btn.classList.add('active');
  if (pane) pane.classList.add('active');

  if (window.soundFX) window.soundFX.click();
}

// ================= TURKISH HINT TOGGLE =================
function toggleTurkishHints() {
  const hints = document.querySelectorAll('.bullet-item-tr');
  const btn = document.getElementById('btnToggleTr');
  let anyHidden = false;

  hints.forEach(h => {
    if (!h.classList.contains('visible')) anyHidden = true;
  });

  hints.forEach(h => {
    if (anyHidden) h.classList.add('visible');
    else h.classList.remove('visible');
  });

  if (btn) {
    btn.innerHTML = anyHidden ? '🇹🇷 Çevirileri Gizle' : '🇹🇷 Türkçe Çevirileri Göster';
  }
}

// ================= WORD SCRAMBLE ENGINE =================
class SentenceBuilder {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    if (!this.container) return;

    this.targetSentence = config.targetSentence.trim();
    this.words = config.words || this.targetSentence.split(/\s+/);
    this.qid = config.questionId || 'q_unknown';
    this.placedWords = [];

    this.render();
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  render() {
    this.container.innerHTML = `
      <div class="scramble-prompt">Cümleyi İngilizce olarak doğru kelime sırasıyla oluştur:</div>
      <div class="target-dropzone" id="dropzone_${this.qid}"></div>
      <div class="word-bank" id="bank_${this.qid}"></div>
      <div style="display: flex; gap: 10px; align-items: center; margin-top: 14px;">
        <button class="btn-primary" id="checkBtn_${this.qid}">✅ Kontrol Et</button>
        <button class="btn-secondary" id="resetBtn_${this.qid}">🔄 Sıfırla</button>
      </div>
      <div class="feedback-banner" id="fb_${this.qid}"></div>
    `;

    const bankEl = document.getElementById(`bank_${this.qid}`);
    const dropEl = document.getElementById(`dropzone_${this.qid}`);
    const checkBtn = document.getElementById(`checkBtn_${this.qid}`);
    const resetBtn = document.getElementById(`resetBtn_${this.qid}`);

    const shuffled = this.shuffle(this.words);

    shuffled.forEach((w, idx) => {
      const chip = document.createElement('div');
      chip.className = 'word-chip';
      chip.textContent = w;
      chip.dataset.idx = idx;
      chip.dataset.word = w;

      chip.onclick = () => {
        if (!chip.classList.contains('used')) {
          this.placeWord(w, chip, dropEl);
        }
      };

      bankEl.appendChild(chip);
    });

    checkBtn.onclick = () => this.checkAnswer();
    resetBtn.onclick = () => this.reset();
  }

  placeWord(word, bankChip, dropEl) {
    if (window.soundFX) window.soundFX.click();
    bankChip.classList.add('used');

    const placedChip = document.createElement('div');
    placedChip.className = 'word-chip placed';
    placedChip.textContent = word;

    const record = { word, bankChip, placedChip };
    this.placedWords.push(record);

    placedChip.onclick = () => {
      if (window.soundFX) window.soundFX.click();
      bankChip.classList.remove('used');
      dropEl.removeChild(placedChip);
      this.placedWords = this.placedWords.filter(r => r !== record);
      if (this.placedWords.length === 0) dropEl.classList.remove('has-items');
    };

    dropEl.appendChild(placedChip);
    dropEl.classList.add('has-items');
  }

  reset() {
    this.placedWords.forEach(r => {
      r.bankChip.classList.remove('used');
      if (r.placedChip.parentNode) r.placedChip.parentNode.removeChild(r.placedChip);
    });
    this.placedWords = [];
    const dropEl = document.getElementById(`dropzone_${this.qid}`);
    if (dropEl) dropEl.classList.remove('has-items');
    const fb = document.getElementById(`fb_${this.qid}`);
    if (fb) fb.style.display = 'none';
  }

  checkAnswer() {
    const formed = this.placedWords.map(r => r.word).join(' ');
    const fb = document.getElementById(`fb_${this.qid}`);

    // normalize strings for comparison
    const norm = str => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();

    if (norm(formed) === norm(this.targetSentence)) {
      fb.className = 'feedback-banner success';
      fb.innerHTML = `🎉 Harika! Cümleyi kusursuz kurdun. Tam sınavlık İngilizce ifade!`;
      fb.style.display = 'flex';
      FOIT_STATE.addXP(25, 'Cümle Kurma');
    } else {
      if (window.soundFX) window.soundFX.error();
      fb.className = 'feedback-banner warning';
      fb.innerHTML = `⚠️ Sıralamada küçük bir hata var. Tekrar dene veya kelimeleri gözden geçir!`;
      fb.style.display = 'flex';
    }
  }
}

// ================= ACTIVE RECALL & KEYWORD CHECKER =================
class ActiveRecallChecker {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    if (!this.container) return;

    this.requiredKeywords = config.requiredKeywords || [];
    this.idealAnswer = config.idealAnswer || '';
    this.qid = config.questionId || 'ar_unknown';

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 12px; font-weight: 600;">
        Soruya kendi cümlelerinle kısa İngilizce cevap yaz. Sistem kilit anahtar kelimeleri ve sınav puan kriterlerini anlık olarak ölçecektir:
      </div>
      <textarea class="typing-textarea" id="txt_${this.qid}" placeholder="Type your answer in English here... (e.g. Traditional IDE requires the developer to write code manually...)"></textarea>

      <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">
        Sınavda Puan Getiren Kilit İfadeler (Gereken Terimler):
      </div>
      <div class="keywords-tracker" id="kw_${this.qid}">
        ${this.requiredKeywords.map((k, i) => `
          <span class="kw-check-item" id="kw_${this.qid}_${i}">
            <span>⚪</span> ${k.label || k}
          </span>
        `).join('')}
      </div>

      <div style="display: flex; gap: 10px; align-items: center; margin-top: 14px; flex-wrap: wrap;">
        <button class="btn-primary" id="btnScore_${this.qid}">📊 Cevabımı Değerlendir</button>
        <button class="btn-secondary" id="btnReveal_${this.qid}">👁️ Model Cevabı Göster</button>
      </div>

      <div class="feedback-banner" id="fb_score_${this.qid}"></div>
      
      <div id="ideal_box_${this.qid}" style="display: none; margin-top: 16px; background: rgba(99, 102, 241, 0.1); border: 1px solid var(--accent-indigo); border-radius: 12px; padding: 16px;">
        <div style="font-size: 0.85rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 6px;">
          🎯 İDEAL KISA SINAV CEVABI (EXAM-READY MODEL):
        </div>
        <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text-main);">
          ${this.idealAnswer}
        </div>
      </div>
    `;

    const txt = document.getElementById(`txt_${this.qid}`);
    const scoreBtn = document.getElementById(`btnScore_${this.qid}`);
    const revealBtn = document.getElementById(`btnReveal_${this.qid}`);

    txt.addEventListener('input', () => this.trackLiveKeywords(txt.value));
    scoreBtn.onclick = () => this.evaluateScore(txt.value);
    revealBtn.onclick = () => {
      const ideal = document.getElementById(`ideal_box_${this.qid}`);
      if (ideal) ideal.style.display = ideal.style.display === 'none' ? 'block' : 'none';
      if (window.soundFX) window.soundFX.click();
    };
  }

  trackLiveKeywords(inputVal) {
    const lower = inputVal.toLowerCase();
    this.requiredKeywords.forEach((k, idx) => {
      const el = document.getElementById(`kw_${this.qid}_${idx}`);
      const pattern = k.regex ? new RegExp(k.regex, 'i') : new RegExp(k.label || k, 'i');
      if (pattern.test(lower)) {
        el.classList.add('matched');
        el.querySelector('span').textContent = '✅';
      } else {
        el.classList.remove('matched');
        el.querySelector('span').textContent = '⚪';
      }
    });
  }

  evaluateScore(inputVal) {
    const lower = inputVal.toLowerCase();
    let matches = 0;

    this.requiredKeywords.forEach(k => {
      const pattern = k.regex ? new RegExp(k.regex, 'i') : new RegExp(k.label || k, 'i');
      if (pattern.test(lower)) matches++;
    });

    const total = this.requiredKeywords.length;
    const ratio = total > 0 ? (matches / total) : 0;
    const fb = document.getElementById(`fb_score_${this.qid}`);

    if (inputVal.trim().length < 10) {
      if (window.soundFX) window.soundFX.error();
      fb.className = 'feedback-banner warning';
      fb.innerHTML = `⚠️ Lütfen değerlendirme için biraz daha kapsamlı bir İngilizce cevap yaz.`;
      fb.style.display = 'flex';
      return;
    }

    if (ratio >= 0.75) {
      fb.className = 'feedback-banner success';
      fb.innerHTML = `🌟 <strong>Mükemmel (${matches}/${total} Terim)!</strong> Sınavda tam puan alabilecek seviyede kilit kavramları İngilizce ifade ettin.`;
      fb.style.display = 'flex';
      FOIT_STATE.addXP(40, 'Aktif Geri Çağırma');
      FOIT_STATE.markCompleted(this.qid);
    } else if (ratio >= 0.4) {
      fb.className = 'feedback-banner warning';
      fb.innerHTML = `👍 <strong>İyi Başlangıç (${matches}/${total} Terim)!</strong> Temel fikri anladın ama gri yanan eksik kilit kelimeleri de cümlene eklemelisin.`;
      fb.style.display = 'flex';
      FOIT_STATE.addXP(15, 'Pratik');
    } else {
      if (window.soundFX) window.soundFX.error();
      fb.className = 'feedback-banner warning';
      fb.innerHTML = `💡 Henüz kilit terimlerin çoğu eksik (${matches}/${total}). "Model Cevabı Göster" butonuna tıklayıp incele ve tekrar dene.`;
      fb.style.display = 'flex';
    }
  }
}

// ================= MULTI-PART SENTENCE SCRAMBLE ENGINE =================
class MultiSentenceScramble {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    if (!this.container) return;

    this.qid = config.questionId || 'multi_scramble';
    this.parts = config.parts || [];
    this.currentIndex = 0;
    this.solvedParts = new Set();
    this.partStates = {};

    this.render();
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  render() {
    if (!this.parts.length) return;

    this.container.innerHTML = `
      <div class="scramble-stepper-wrap">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">
            🧩 Sınav Cevabı Parçalarını Sırayla Kur (Tüm Cevap Kapsamı)
          </div>
          <div class="stat-chip stat-progress" id="scramble_progress_${this.qid}" style="font-size: 0.8rem;">
            0 / ${this.parts.length} Tamamlandı
          </div>
        </div>

        <div class="scramble-parts-nav" id="scramble_nav_${this.qid}">
          ${this.parts.map((p, idx) => `
            <button class="scramble-part-tab ${idx === 0 ? 'active' : ''}" id="scramble_tab_${this.qid}_${idx}" onclick="window['${this.qid}_scramble'].switchPart(${idx})">
              <span>${idx + 1}.</span> ${p.title || ('Parça ' + (idx + 1))}
            </button>
          `).join('')}
        </div>

        <div id="scramble_boxes_${this.qid}"></div>
      </div>
    `;

    window[`${this.qid}_scramble`] = this;

    const boxesContainer = document.getElementById(`scramble_boxes_${this.qid}`);
    this.parts.forEach((p, idx) => {
      const box = document.createElement('div');
      box.className = `scramble-part-box ${idx === 0 ? 'active' : ''}`;
      box.id = `scramble_box_${this.qid}_${idx}`;

      const targetSentence = p.sentence.trim();
      const rawWords = p.words || targetSentence.split(/\s+/);
      const shuffled = this.shuffle(rawWords);

      box.innerHTML = `
        <div class="scramble-turkish-hint">
          <strong>🇹🇷 Türkçe Anlam / Hedef Cümle:</strong> "${p.turkishHint || ''}"
        </div>
        <div class="scramble-prompt">Aşağıdaki kelimelere tıklayarak cümleyi doğru İngilizce sırayla oluştur:</div>
        <div class="target-dropzone" id="dropzone_${this.qid}_${idx}"></div>
        <div class="word-bank" id="bank_${this.qid}_${idx}"></div>

        <div style="display: flex; gap: 10px; align-items: center; margin-top: 14px; flex-wrap: wrap;">
          <button class="btn-primary" id="checkBtn_${this.qid}_${idx}">✅ Kontrol Et</button>
          <button class="btn-secondary" id="hintBtn_${this.qid}_${idx}">💡 İlk Kelime İpucu</button>
          <button class="btn-secondary" id="resetBtn_${this.qid}_${idx}">🔄 Sıfırla</button>
          <button class="btn-speak" onclick="speakText('${targetSentence.replace(/'/g, "\\'")}', this)">🔊 Doğru Cümleyi Dinle</button>
        </div>

        <div class="feedback-banner" id="fb_${this.qid}_${idx}"></div>
      `;

      boxesContainer.appendChild(box);

      // State for this part
      this.partStates[idx] = {
        targetSentence,
        rawWords,
        placedWords: []
      };

      const bankEl = document.getElementById(`bank_${this.qid}_${idx}`);
      const dropEl = document.getElementById(`dropzone_${this.qid}_${idx}`);
      const checkBtn = document.getElementById(`checkBtn_${this.qid}_${idx}`);
      const resetBtn = document.getElementById(`resetBtn_${this.qid}_${idx}`);
      const hintBtn = document.getElementById(`hintBtn_${this.qid}_${idx}`);

      shuffled.forEach((w, wIdx) => {
        const chip = document.createElement('div');
        chip.className = 'word-chip';
        chip.textContent = w;
        chip.dataset.idx = wIdx;
        chip.dataset.word = w;

        chip.onclick = () => {
          if (!chip.classList.contains('used')) {
            this.placeWord(idx, w, chip, dropEl);
          }
        };

        bankEl.appendChild(chip);
      });

      checkBtn.onclick = () => this.checkPart(idx);
      resetBtn.onclick = () => this.resetPart(idx);
      hintBtn.onclick = () => this.giveHint(idx);
    });
  }

  switchPart(idx) {
    if (idx < 0 || idx >= this.parts.length) return;
    this.currentIndex = idx;

    document.querySelectorAll(`#scramble_nav_${this.qid} .scramble-part-tab`).forEach((t, i) => {
      if (i === idx) t.classList.add('active');
      else t.classList.remove('active');
    });

    this.parts.forEach((_, i) => {
      const box = document.getElementById(`scramble_box_${this.qid}_${i}`);
      if (box) {
        if (i === idx) box.classList.add('active');
        else box.classList.remove('active');
      }
    });

    if (window.soundFX) window.soundFX.click();
  }

  placeWord(partIdx, word, bankChip, dropEl) {
    if (window.soundFX) window.soundFX.click();
    bankChip.classList.add('used');

    const placedChip = document.createElement('div');
    placedChip.className = 'word-chip placed';
    placedChip.textContent = word;

    const record = { word, bankChip, placedChip };
    this.partStates[partIdx].placedWords.push(record);

    placedChip.onclick = () => {
      if (window.soundFX) window.soundFX.click();
      bankChip.classList.remove('used');
      dropEl.removeChild(placedChip);
      this.partStates[partIdx].placedWords = this.partStates[partIdx].placedWords.filter(r => r !== record);
      if (this.partStates[partIdx].placedWords.length === 0) dropEl.classList.remove('has-items');
    };

    dropEl.appendChild(placedChip);
    dropEl.classList.add('has-items');
  }

  resetPart(partIdx) {
    const state = this.partStates[partIdx];
    state.placedWords.forEach(r => {
      r.bankChip.classList.remove('used');
      if (r.placedChip.parentNode) r.placedChip.parentNode.removeChild(r.placedChip);
    });
    state.placedWords = [];

    const dropEl = document.getElementById(`dropzone_${this.qid}_${partIdx}`);
    if (dropEl) dropEl.classList.remove('has-items');

    const fb = document.getElementById(`fb_${this.qid}_${partIdx}`);
    if (fb) fb.style.display = 'none';
  }

  giveHint(partIdx) {
    const state = this.partStates[partIdx];
    const targetWords = state.rawWords;
    const currentPlaced = state.placedWords.length;

    if (currentPlaced < targetWords.length) {
      const nextWord = targetWords[currentPlaced];
      const bankEl = document.getElementById(`bank_${this.qid}_${partIdx}`);
      const dropEl = document.getElementById(`dropzone_${this.qid}_${partIdx}`);
      const unusedChips = Array.from(bankEl.querySelectorAll('.word-chip:not(.used)'));
      const matchingChip = unusedChips.find(c => c.dataset.word.toLowerCase().replace(/[.,]/g, '') === nextWord.toLowerCase().replace(/[.,]/g, ''));

      if (matchingChip) {
        this.placeWord(partIdx, matchingChip.dataset.word, matchingChip, dropEl);
        if (window.soundFX) window.soundFX.click();
      }
    }
  }

  checkPart(partIdx) {
    const state = this.partStates[partIdx];
    const formed = state.placedWords.map(r => r.word).join(' ');
    const fb = document.getElementById(`fb_${this.qid}_${partIdx}`);
    const norm = str => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();

    if (norm(formed) === norm(state.targetSentence)) {
      fb.className = 'feedback-banner success';
      fb.innerHTML = `🎉 Harika! Cümle kusursuz kuruldu (+20 XP)`;
      fb.style.display = 'flex';

      this.solvedParts.add(partIdx);
      const tab = document.getElementById(`scramble_tab_${this.qid}_${partIdx}`);
      if (tab) {
        tab.classList.add('solved');
        tab.innerHTML = `<span>✅</span> ${this.parts[partIdx].title || ('Parça ' + (partIdx + 1))}`;
      }

      const prog = document.getElementById(`scramble_progress_${this.qid}`);
      if (prog) prog.textContent = `${this.solvedParts.size} / ${this.parts.length} Tamamlandı`;

      FOIT_STATE.addXP(20, 'Parça Tamamlama');

      // Auto advance to next unsolved part after delay
      if (this.solvedParts.size === this.parts.length) {
        FOIT_STATE.addXP(50, 'Tüm Parçalar Başarıyla Kuruldu!');
        fb.innerHTML = `🏆 Tebrikler! Bu sorunun TÜM cevap cümlelerini İngilizce olarak eksiksiz kurdun! (+50 Bonus XP)`;
      } else {
        for (let i = 0; i < this.parts.length; i++) {
          if (!this.solvedParts.has(i)) {
            setTimeout(() => this.switchPart(i), 1200);
            break;
          }
        }
      }
    } else {
      if (window.soundFX) window.soundFX.error();
      fb.className = 'feedback-banner warning';
      fb.innerHTML = `⚠️ Sıralamada bir hata var. "İlk Kelime İpucu" butonunu kullanabilir veya sıfırlayıp tekrar deneyebilirsin!`;
      fb.style.display = 'flex';
    }
  }
}

// ================= FLASHCARD DECK (MULTI-CARD) ENGINE =================
class FlashcardDeck {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    if (!this.container) return;

    this.qid = config.questionId || 'deck_unknown';
    this.cards = config.cards || [];
    this.currentIndex = 0;
    this.viewMode = 'deck'; // 'deck' or 'grid'

    this.render();
  }

  render() {
    if (!this.cards.length) return;

    this.container.innerHTML = `
      <div class="deck-container">
        
        <!-- Header -->
        <div class="deck-header">
          <div class="deck-counter" id="deck_counter_${this.qid}">
            <span>🃏 Kart 1 / ${this.cards.length}</span>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn-speak" id="deck_audio_btn_${this.qid}" onclick="window['${this.qid}_deck'].speakCurrent()">
              🔊 Kartı Dinle
            </button>
            <button class="icon-btn" id="deck_view_toggle_${this.qid}" onclick="window['${this.qid}_deck'].toggleViewMode()">
              📑 Liste Görünümü
            </button>
          </div>
        </div>

        <!-- Single Deck View -->
        <div id="deck_single_view_${this.qid}">
          <div class="flashcard-wrapper" id="card_wrapper_${this.qid}" onclick="window['${this.qid}_deck'].flipCurrent()">
            <div class="flashcard-inner" id="card_inner_${this.qid}">
              <div class="flashcard-front" id="card_front_${this.qid}"></div>
              <div class="flashcard-back" id="card_back_${this.qid}"></div>
            </div>
          </div>

          <!-- Bottom Navigation Controls -->
          <div class="deck-nav-bar">
            <button class="btn-secondary" onclick="window['${this.qid}_deck'].prevCard()">
              ⬅️ Önceki
            </button>

            <div class="deck-dots" id="deck_dots_${this.qid}">
              ${this.cards.map((_, idx) => `
                <div class="deck-dot ${idx === 0 ? 'active' : ''}" onclick="window['${this.qid}_deck'].goToCard(${idx})"></div>
              `).join('')}
            </div>

            <button class="btn-primary" onclick="window['${this.qid}_deck'].nextCard()">
              Sonraki ➡️
            </button>
          </div>

          <div style="text-align: center; margin-top: 12px; font-size: 0.82rem; color: var(--text-muted);">
            💡 <em>İpucu: Kartı çevirmek için üzerine tıklayabilir veya <kbd>Boşluk</kbd> tuşuna basabilirsiniz. <kbd>←</kbd> / <kbd>→</kbd> tuşlarıyla kartlar arasında gezinebilirsiniz.</em>
          </div>
        </div>

        <!-- Grid View (All Cards) -->
        <div id="deck_grid_view_${this.qid}" class="cards-grid-view" style="display: none;">
          ${this.cards.map((c, idx) => `
            <div class="flashcard-wrapper" style="max-width: 100%; min-height: 280px;" onclick="toggleFlashcard(this)">
              <div class="flashcard-inner">
                <div class="flashcard-front" style="padding: 20px;">
                  <span class="pill-tag pill-topic" style="margin-bottom: 12px;">Kart ${idx + 1}: ${c.tag || ''}</span>
                  <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">
                    ${c.question}
                  </div>
                  <div class="card-hint-text">👆 Çevirmek için tıkla</div>
                </div>
                <div class="flashcard-back" style="padding: 20px; text-align: left;">
                  <div style="font-size: 0.85rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 6px;">
                    ${c.answerTitle || 'Cevap'}
                  </div>
                  <div style="font-size: 0.95rem; line-height: 1.5; color: #f8fafc; margin-bottom: 8px;">
                    ${c.answerEn}
                  </div>
                  <div style="font-size: 0.8rem; color: #94a3b8; border-top: 1px dashed var(--border-subtle); padding-top: 6px;">
                    🇹🇷 ${c.answerTr || ''}
                  </div>
                  <div class="card-hint-text" style="text-align: center;">👆 Geri dönmek için tıkla</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    window[`${this.qid}_deck`] = this;
    this.updateCardContent();

    // Attach keyboard listener for accessibility
    document.addEventListener('keydown', (e) => {
      // only if flashcard tab is visible
      const tabPane = document.getElementById('tabFlashcard');
      if (tabPane && tabPane.classList.contains('active')) {
        if (e.code === 'Space') {
          e.preventDefault();
          this.flipCurrent();
        } else if (e.code === 'ArrowRight') {
          this.nextCard();
        } else if (e.code === 'ArrowLeft') {
          this.prevCard();
        }
      }
    });
  }

  updateCardContent() {
    const c = this.cards[this.currentIndex];
    if (!c) return;

    const wrapper = document.getElementById(`card_wrapper_${this.qid}`);
    if (wrapper) wrapper.classList.remove('flipped');

    const front = document.getElementById(`card_front_${this.qid}`);
    const back = document.getElementById(`card_back_${this.qid}`);
    const counter = document.getElementById(`deck_counter_${this.qid}`);

    if (counter) {
      counter.innerHTML = `<span>🃏 Kart ${this.currentIndex + 1} / ${this.cards.length}</span> <span class="pill-tag pill-topic" style="padding: 2px 8px; font-size: 0.7rem;">${c.tag || ''}</span>`;
    }

    if (front) {
      front.innerHTML = `
        <span class="pill-tag pill-topic" style="margin-bottom: 14px;">${c.tag || 'Soru'}</span>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 12px; line-height: 1.4;">
          ${c.question}
        </h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); max-width: 480px;">
          ${c.promptTr || 'Sınavda sorulabilecek bu parçanın İngilizce ifadesini hatırla.'}
        </p>
        <div class="card-hint-text">👆 Cevabı görmek için tıkla (veya Boşluk tuşuna bas)</div>
      `;
    }

    if (back) {
      back.innerHTML = `
        <div style="font-size: 0.85rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 8px; text-transform: uppercase;">
          🎯 ${c.answerTitle || 'Sınav Cevabı'}
        </div>
        <p style="text-align: left; font-size: 1.05rem; line-height: 1.5; color: #ffffff; font-weight: 600; margin-bottom: 12px;">
          ${c.answerEn}
        </p>
        <div style="text-align: left; font-size: 0.85rem; color: #cbd5e1; border-top: 1px dashed var(--border-subtle); padding-top: 8px; line-height: 1.4;">
          🇹🇷 ${c.answerTr || ''}
        </div>
        <div class="card-hint-text">👆 Soruya dönmek için tıkla</div>
      `;
    }

    // Update dots
    const dots = document.querySelectorAll(`#deck_dots_${this.qid} .deck-dot`);
    dots.forEach((d, idx) => {
      if (idx === this.currentIndex) d.classList.add('active');
      else d.classList.remove('active');
    });
  }

  flipCurrent() {
    const wrapper = document.getElementById(`card_wrapper_${this.qid}`);
    if (wrapper) {
      wrapper.classList.toggle('flipped');
      if (window.soundFX) window.soundFX.click();
    }
  }

  nextCard() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.updateCardContent();
      if (window.soundFX) window.soundFX.click();
    } else {
      // Loop to first card or award completion
      this.currentIndex = 0;
      this.updateCardContent();
      FOIT_STATE.addXP(25, 'Tüm Kartları İnceleme');
    }
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCardContent();
      if (window.soundFX) window.soundFX.click();
    }
  }

  goToCard(idx) {
    if (idx >= 0 && idx < this.cards.length) {
      this.currentIndex = idx;
      this.updateCardContent();
      if (window.soundFX) window.soundFX.click();
    }
  }

  speakCurrent() {
    const c = this.cards[this.currentIndex];
    if (c) {
      const textToSpeak = c.audioText || c.answerEn;
      const btn = document.getElementById(`deck_audio_btn_${this.qid}`);
      speakText(textToSpeak, btn);
    }
  }

  toggleViewMode() {
    const single = document.getElementById(`deck_single_view_${this.qid}`);
    const grid = document.getElementById(`deck_grid_view_${this.qid}`);
    const btn = document.getElementById(`deck_view_toggle_${this.qid}`);

    if (this.viewMode === 'deck') {
      this.viewMode = 'grid';
      single.style.display = 'none';
      grid.style.display = 'grid';
      btn.innerHTML = '🎴 Tekli Kart Deste Modu';
    } else {
      this.viewMode = 'deck';
      single.style.display = 'block';
      grid.style.display = 'none';
      btn.innerHTML = '📑 Liste Görünümü';
    }
    if (window.soundFX) window.soundFX.click();
  }
}

// ================= FLASHCARD COMPONENT (LEGACY HELPER) =================
function toggleFlashcard(cardElement) {
  cardElement.classList.toggle('flipped');
  if (window.soundFX) window.soundFX.click();
}

// ================= GLOBAL INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  const s = FOIT_STATE.getStorage();
  FOIT_STATE.applyTheme(s.theme || 'dark');
  FOIT_STATE.updateHeaderUI();

  // Attach theme toggle button
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.onclick = () => FOIT_STATE.toggleTheme();
  }

  // Pre-load synth voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
});
