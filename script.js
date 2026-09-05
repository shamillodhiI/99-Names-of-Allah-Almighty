/* ============================================================
   اسماء الحسنیٰ — data + narration engine (API audio + Urdu TTS)

   DATA SOURCE
   -----------
   Names, transliteration, English + Urdu meanings, aur har naam
   ki asal Arabic recitation audio (audio_url) ek public API se
   fetch ki jaati hai:
     https://asmaul-husna-api-coral.vercel.app/api/asmaul-husna
   Agar internet na ho ya API down ho, to FALLBACK_NAMES (yahan
   neeche maujood) use hoti hai taake page phir bhi kaam kare —
   albatta fallback mein real audio nahi hoti, sirf TTS.

   AUDIO PIPELINE (har naam ke liye)
   -----------------------------------
   1) Real Arabic recitation audio (API se) — HTMLAudioElement
   2) Urdu meaning — browser ki built-in Urdu TTS (SpeechSynthesis)

   Play/Pause/Continue/Stop teeno buttons dono audio types
   (HTMLAudio + SpeechSynthesis) ko ek saath control karte hain.
   ============================================================ */

const API = "https://asmaul-husna-api-coral.vercel.app/api/asmaul-husna";
const BISMILLAH_AUDIO_URL = "https://everyayah.com/data/Alafasy_128kbps/001001.mp3";

const FALLBACK_NAMES = [
  { n: 1, ar: "اللّٰہ", tr: "Allah", meaning: "ذاتِ اقدس، معبودِ برحق، تمام اسمائے حسنیٰ کا سرچشمہ" },
  { n: 2, ar: "الرَّحْمٰن", tr: "Ar-Rahman", meaning: "نہایت مہربان، دنیا میں ہر مخلوق پر رحم کرنے والا" },
  { n: 3, ar: "الرَّحِیْم", tr: "Ar-Raheem", meaning: "بار بار رحم فرمانے والا، خاص طور پر ایمان والوں پر" },
  { n: 4, ar: "الْمَلِک", tr: "Al-Malik", meaning: "حقیقی بادشاہ، کائنات کا اصل حکمران" },
  { n: 5, ar: "الْقُدُّوْس", tr: "Al-Quddus", meaning: "ہر عیب اور نقص سے پاک ذات" },
  { n: 6, ar: "السَّلَام", tr: "As-Salam", meaning: "سلامتی والا، ہر آفت سے محفوظ رکھنے والا" },
  { n: 7, ar: "الْمُؤْمِن", tr: "Al-Mu'min", meaning: "امن و امان بخشنے والا، اپنے وعدوں پر یقین دلانے والا" },
  { n: 8, ar: "الْمُھَیْمِن", tr: "Al-Muhaymin", meaning: "نگہبان اور محافظ، ہر چیز پر نگرانی رکھنے والا" },
  { n: 9, ar: "الْعَزِیْز", tr: "Al-Aziz", meaning: "غالب اور بےمثال عزت والا" },
  { n: 10, ar: "الْجَبَّار", tr: "Al-Jabbar", meaning: "زبردست، جس کے فیصلے کو کوئی ٹال نہ سکے" },
  { n: 11, ar: "الْمُتَکَبِّر", tr: "Al-Mutakabbir", meaning: "کبریائی اور بڑائی کا تنہا حقدار" },
  { n: 12, ar: "الْخَالِق", tr: "Al-Khaliq", meaning: "بغیر کسی نمونے کے تخلیق کرنے والا" },
  { n: 13, ar: "الْبَارِئ", tr: "Al-Bari'", meaning: "عدم سے وجود میں لانے والا، ہر چیز کو ہم آہنگی سے بنانے والا" },
  { n: 14, ar: "الْمُصَوِّر", tr: "Al-Musawwir", meaning: "ہر مخلوق کو الگ الگ صورت اور شکل دینے والا" },
  { n: 15, ar: "الْغَفَّار", tr: "Al-Ghaffar", meaning: "بار بار توبہ قبول کر کے گناہ بخشنے والا" },
  { n: 16, ar: "الْقَھَّار", tr: "Al-Qahhar", meaning: "ہر چیز پر مکمل غلبہ رکھنے والا" },
  { n: 17, ar: "الْوَھَّاب", tr: "Al-Wahhab", meaning: "بغیر عوض کے بےحساب عطا کرنے والا" },
  { n: 18, ar: "الرَّزَّاق", tr: "Ar-Razzaq", meaning: "ہر جاندار کو رزق پہنچانے والا" },
  { n: 19, ar: "الْفَتَّاح", tr: "Al-Fattah", meaning: "بند دروازے کھولنے والا، حق کے ساتھ فیصلہ کرنے والا" },
  { n: 20, ar: "الْعَلِیْم", tr: "Al-'Alim", meaning: "ظاہر و باطن، ہر چھوٹی بڑی بات کا مکمل علم رکھنے والا" },
  { n: 21, ar: "الْقَابِض", tr: "Al-Qabid", meaning: "اپنی حکمت سے رزق و روزی تنگ کرنے والا" },
  { n: 22, ar: "الْبَاسِط", tr: "Al-Basit", meaning: "اپنی مرضی سے رزق اور رحمت کشادہ کرنے والا" },
  { n: 23, ar: "الْخَافِض", tr: "Al-Khafid", meaning: "سرکشوں اور متکبروں کو پست کرنے والا" },
  { n: 24, ar: "الرَّافِع", tr: "Ar-Rafi'", meaning: "اپنے مخلص بندوں کا درجہ بلند کرنے والا" },
  { n: 25, ar: "الْمُعِزّ", tr: "Al-Mu'izz", meaning: "جسے چاہے عزت اور غلبہ عطا کرنے والا" },
  { n: 26, ar: "الْمُذِلّ", tr: "Al-Mudhill", meaning: "جسے چاہے ذلت اور پستی میں ڈالنے والا" },
  { n: 27, ar: "السَّمِیْع", tr: "As-Sami'", meaning: "ہر پکار اور ہر آواز کو سننے والا" },
  { n: 28, ar: "الْبَصِیْر", tr: "Al-Basir", meaning: "ہر باریک سے باریک چیز کو دیکھنے والا" },
  { n: 29, ar: "الْحَکَم", tr: "Al-Hakam", meaning: "حق کے مطابق حتمی فیصلہ کرنے والا حاکم" },
  { n: 30, ar: "الْعَدْل", tr: "Al-'Adl", meaning: "کامل انصاف کرنے والا، ظلم سے پاک" },
  { n: 31, ar: "اللَّطِیْف", tr: "Al-Latif", meaning: "باریک بین اور اپنے بندوں پر نہایت مہربان" },
  { n: 32, ar: "الْخَبِیْر", tr: "Al-Khabir", meaning: "ہر پوشیدہ حقیقت کی پوری خبر رکھنے والا" },
  { n: 33, ar: "الْحَلِیْم", tr: "Al-Halim", meaning: "بردبار، نافرمانی پر بھی جلدی سزا نہ دینے والا" },
  { n: 34, ar: "الْعَظِیْم", tr: "Al-'Azim", meaning: "عظمت و بزرگی میں سب سے بڑھ کر" },
  { n: 35, ar: "الْغَفُوْر", tr: "Al-Ghafur", meaning: "بہت زیادہ بخشنے والا اور درگزر کرنے والا" },
  { n: 36, ar: "الشَّکُوْر", tr: "Ash-Shakur", meaning: "تھوڑی نیکی کا بھی بھرپور اجر دینے والا" },
  { n: 37, ar: "الْعَلِیّ", tr: "Al-'Ali", meaning: "شان اور مرتبے میں سب سے بلند" },
  { n: 38, ar: "الْکَبِیْر", tr: "Al-Kabir", meaning: "ہر چیز سے بڑا اور برتر" },
  { n: 39, ar: "الْحَفِیْظ", tr: "Al-Hafiz", meaning: "ہر مخلوق کی حفاظت اور نگہداشت کرنے والا" },
  { n: 40, ar: "الْمُقِیْت", tr: "Al-Muqit", meaning: "ہر جاندار کو مناسب رزق پہنچانے والا" },
  { n: 41, ar: "الْحَسِیْب", tr: "Al-Hasib", meaning: "بندوں کے اعمال کا مکمل حساب رکھنے والا" },
  { n: 42, ar: "الْجَلِیْل", tr: "Al-Jalil", meaning: "جلال، شان اور بزرگی والا" },
  { n: 43, ar: "الْکَرِیْم", tr: "Al-Karim", meaning: "بےانتہا سخاوت اور کرم کرنے والا" },
  { n: 44, ar: "الرَّقِیْب", tr: "Ar-Raqib", meaning: "ہر حال میں نگرانی اور دیکھ بھال کرنے والا" },
  { n: 45, ar: "الْمُجِیْب", tr: "Al-Mujib", meaning: "دعائیں اور پکاریں قبول کرنے والا" },
  { n: 46, ar: "الْوَاسِع", tr: "Al-Wasi'", meaning: "علم و رحمت میں وسعت رکھنے والا" },
  { n: 47, ar: "الْحَکِیْم", tr: "Al-Hakim", meaning: "ہر کام حکمت اور مصلحت کے مطابق کرنے والا" },
  { n: 48, ar: "الْوَدُوْد", tr: "Al-Wadud", meaning: "اپنے نیک بندوں سے محبت کرنے والا" },
  { n: 49, ar: "الْمَجِیْد", tr: "Al-Majid", meaning: "بزرگی، عزت اور کرم میں کامل" },
  { n: 50, ar: "الْبَاعِث", tr: "Al-Ba'ith", meaning: "قیامت کے دن مُردوں کو دوبارہ زندہ کر کے اٹھانے والا" },
  { n: 51, ar: "الشَّھِیْد", tr: "Ash-Shahid", meaning: "ہر جگہ حاضر و ناظر، سب کچھ دیکھنے والا گواہ" },
  { n: 52, ar: "الْحَقّ", tr: "Al-Haqq", meaning: "حق اور سچائی جس کا وجود اٹل ہے" },
  { n: 53, ar: "الْوَکِیْل", tr: "Al-Wakil", meaning: "بندوں کے تمام معاملات کا بہترین کارساز" },
  { n: 54, ar: "الْقَوِیّ", tr: "Al-Qawiyy", meaning: "کامل اور بےپایاں طاقت رکھنے والا" },
  { n: 55, ar: "الْمَتِیْن", tr: "Al-Matin", meaning: "نہایت مضبوط، جس کی قوت کبھی کمزور نہیں ہوتی" },
  { n: 56, ar: "الْوَلِیّ", tr: "Al-Waliyy", meaning: "مومنوں کا حقیقی دوست اور مددگار" },
  { n: 57, ar: "الْحَمِیْد", tr: "Al-Hamid", meaning: "ہر حال میں قابلِ تعریف و ستائش" },
  { n: 58, ar: "الْمُحْصِیْ", tr: "Al-Muhsi", meaning: "ہر چیز کو شمار اور محفوظ رکھنے والا" },
  { n: 59, ar: "الْمُبْدِئ", tr: "Al-Mubdi'", meaning: "مخلوق کو پہلی بار وجود میں لانے والا" },
  { n: 60, ar: "الْمُعِیْد", tr: "Al-Mu'id", meaning: "فنا کے بعد دوبارہ پیدا کرنے والا" },
  { n: 61, ar: "الْمُحْیِیْ", tr: "Al-Muhyi", meaning: "مُردوں اور بےجان چیزوں کو زندگی دینے والا" },
  { n: 62, ar: "الْمُمِیْت", tr: "Al-Mumit", meaning: "ہر جاندار کو موت دینے والا" },
  { n: 63, ar: "الْحَیّ", tr: "Al-Hayy", meaning: "ازل سے ابد تک زندہ، جسے کبھی فنا نہیں" },
  { n: 64, ar: "الْقَیُّوْم", tr: "Al-Qayyum", meaning: "خود قائم اور تمام کائنات کو سنبھالنے والا" },
  { n: 65, ar: "الْوَاجِد", tr: "Al-Wajid", meaning: "بےنیاز اور ہر مطلوب چیز کو پانے والا" },
  { n: 66, ar: "الْمَاجِد", tr: "Al-Majid", meaning: "بزرگی اور شان و شوکت میں کامل" },
  { n: 67, ar: "الْوَاحِد", tr: "Al-Wahid", meaning: "اپنی ذات میں یکتا، جس کا کوئی شریک نہیں" },
  { n: 68, ar: "اَلْاَحَد", tr: "Al-Ahad", meaning: "ایک، بےمثل اور لاثانی" },
  { n: 69, ar: "الصَّمَد", tr: "As-Samad", meaning: "بےنیاز، جس کی طرف سب اپنی حاجت کے لیے رجوع کرتے ہیں" },
  { n: 70, ar: "الْقَادِر", tr: "Al-Qadir", meaning: "ہر چیز پر مکمل قدرت رکھنے والا" },
  { n: 71, ar: "الْمُقْتَدِر", tr: "Al-Muqtadir", meaning: "بھرپور اور غالب قوت کا مالک" },
  { n: 72, ar: "الْمُقَدِّم", tr: "Al-Muqaddim", meaning: "جسے چاہے آگے بڑھانے اور فوقیت دینے والا" },
  { n: 73, ar: "الْمُؤَخِّر", tr: "Al-Mu'akhkhir", meaning: "جسے چاہے پیچھے رکھنے اور مہلت دینے والا" },
  { n: 74, ar: "الْاَوَّل", tr: "Al-Awwal", meaning: "جس سے پہلے کچھ بھی نہیں تھا" },
  { n: 75, ar: "الْآخِر", tr: "Al-Akhir", meaning: "جس کے بعد کچھ باقی نہیں رہے گا" },
  { n: 76, ar: "الظَّاھِر", tr: "Az-Zahir", meaning: "اپنی نشانیوں کے ذریعے واضح اور نمایاں" },
  { n: 77, ar: "الْبَاطِن", tr: "Al-Batin", meaning: "اپنی حقیقت میں مخلوق کے ادراک سے پوشیدہ" },
  { n: 78, ar: "الْوَالِیْ", tr: "Al-Wali", meaning: "پوری کائنات کا انتظام سنبھالنے والا حاکمِ اعلیٰ" },
  { n: 79, ar: "الْمُتَعَالِیْ", tr: "Al-Muta'ali", meaning: "ہر نقص اور کمزوری سے بلند و برتر" },
  { n: 80, ar: "الْبَرّ", tr: "Al-Barr", meaning: "اپنے بندوں پر بےپایاں احسان کرنے والا" },
  { n: 81, ar: "التَّوَّاب", tr: "At-Tawwab", meaning: "بار بار توبہ کی توفیق دے کر قبول کرنے والا" },
  { n: 82, ar: "الْمُنْتَقِم", tr: "Al-Muntaqim", meaning: "سرکش اور ظالم سے حق کے مطابق بدلہ لینے والا" },
  { n: 83, ar: "الْعَفُوّ", tr: "Al-'Afuww", meaning: "گناہوں کا اثر تک مٹا کر معاف کرنے والا" },
  { n: 84, ar: "الرَّؤُوْف", tr: "Ar-Ra'uf", meaning: "نہایت شفیق اور نرمی برتنے والا" },
  { n: 85, ar: "مَالِکُ الْمُلْک", tr: "Malik-ul-Mulk", meaning: "ساری کائنات کی بادشاہی کا حقیقی مالک" },
  { n: 86, ar: "ذُوالْجَلَالِ وَالْاِکْرَام", tr: "Dhul-Jalali wal-Ikram", meaning: "جلال اور بزرگی و اکرام والی ذات" },
  { n: 87, ar: "الْمُقْسِط", tr: "Al-Muqsit", meaning: "کامل عدل کے ساتھ فیصلہ کرنے والا" },
  { n: 88, ar: "الْجَامِع", tr: "Al-Jami'", meaning: "قیامت کے دن سب مخلوق کو یکجا کرنے والا" },
  { n: 89, ar: "الْغَنِیّ", tr: "Al-Ghani", meaning: "کسی کا محتاج نہیں، مکمل طور پر بےنیاز" },
  { n: 90, ar: "الْمُغْنِیْ", tr: "Al-Mughni", meaning: "جسے چاہے مالدار اور بےنیاز کر دینے والا" },
  { n: 91, ar: "الْمَانِع", tr: "Al-Mani'", meaning: "اپنی حکمت سے نقصان یا نامناسب چیز روک لینے والا" },
  { n: 92, ar: "الضَّار", tr: "Ad-Darr", meaning: "اپنی مشیت سے تکلیف پہنچانے پر قادر" },
  { n: 93, ar: "النَّافِع", tr: "An-Nafi'", meaning: "اپنی مشیت سے نفع اور بھلائی پہنچانے والا" },
  { n: 94, ar: "النُّوْر", tr: "An-Nur", meaning: "آسمانوں اور زمین کو روشن کرنے والا نور" },
  { n: 95, ar: "الْھَادِیْ", tr: "Al-Hadi", meaning: "سیدھے راستے کی طرف ہدایت دینے والا" },
  { n: 96, ar: "الْبَدِیْع", tr: "Al-Badi'", meaning: "بغیر کسی سابقہ نمونے کے انوکھی چیزیں ایجاد کرنے والا" },
  { n: 97, ar: "الْبَاقِیْ", tr: "Al-Baqi", meaning: "ہمیشہ باقی رہنے والا، جسے فنا نہیں" },
  { n: 98, ar: "الْوَارِث", tr: "Al-Warith", meaning: "سب کے فنا ہو جانے کے بعد باقی رہنے والا حقیقی وارث" },
  { n: 99, ar: "الصَّبُوْر", tr: "As-Sabur", meaning: "نافرمانوں پر بھی جلدی گرفت نہ کرنے والا، نہایت صابر" },
];

/* ---------------------------------------------------------
   State
--------------------------------------------------------- */
let ALL_NAMES = [];        // master list (from API or fallback)
let displayedNames = [];   // currently shown/played list (after search filter)
let boxes = [];

const grid = document.getElementById("namesGrid");
const searchInput = document.getElementById("searchInput");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const nowRecitingValue = document.getElementById("nowRecitingValue");
const voiceNote = document.getElementById("voiceNote");
const pauseIcon = pauseBtn.querySelector(".icon-pause");
const resumeIcon = pauseBtn.querySelector(".icon-resume");
const pauseLabel = pauseBtn.querySelector(".ctrl-label");

/* ---------------------------------------------------------
   Load data: try the API first, fall back to local data
--------------------------------------------------------- */
async function loadNames() {
  try {
    const [enRes, urRes] = await Promise.all([
      fetch(`${API}?lang=english`),
      fetch(`${API}?lang=urdu`),
    ]);
    if (!enRes.ok || !urRes.ok) throw new Error("API not ok");

    const enData = await enRes.json();
    const urData = await urRes.json();
    const enList = enData.results;
    const urList = urData.results;

    ALL_NAMES = enList.map((item, idx) => ({
      n: item.number,
      ar: item.name?.arabic || "",
      tr: item.name?.transliteration || "",
      meaningEn: item.name?.translated || "",
      meaning: urList[idx]?.name?.translated || "",
      audio: item.audio_url || "",
    }));

    voiceNote.textContent = "";
  } catch (err) {
    console.warn("API se data na mil saka, local (fallback) data use ho raha hai:", err);
    ALL_NAMES = FALLBACK_NAMES.map(item => ({ ...item, meaningEn: "", audio: "" }));
    voiceNote.textContent = "نوٹ: آن لائن ڈیٹا دستیاب نہیں — مقامی نام دکھائے جا رہے ہیں (بغیر اصل عربی آڈیو کے)۔";
  }

  displayedNames = ALL_NAMES;
  buildGrid(displayedNames);
}

/* ---------------------------------------------------------
   Build the grid
--------------------------------------------------------- */
function buildGrid(list) {
  grid.innerHTML = "";
  boxes = [];

  if (!list.length) {
    grid.innerHTML = `<div class="loading">کوئی نام نہیں ملا</div>`;
    return;
  }

  list.forEach((item, idx) => {
    const box = document.createElement("article");
    box.className = "name-box";
    box.setAttribute("role", "listitem");
    box.setAttribute("tabindex", "0");
    box.dataset.index = idx;
    box.innerHTML = `
      <span class="name-box__number">${item.n}</span>
      <span class="name-box__badge">تلاوت ہو رہی ہے</span>
      <h2 class="name-box__arabic">${item.ar}</h2>
      <p class="name-box__translit">${item.tr}</p>
      ${item.meaningEn ? `<p class="name-box__english">${item.meaningEn}</p>` : ""}
      <p class="name-box__meaning">${item.meaning}</p>
      <div class="name-box__waves"><span></span><span></span><span></span><span></span><span></span></div>
      <button type="button" class="name-box__recite">🔊 سنیں</button>
    `;
    box.addEventListener("click", () => jumpToIndex(idx));
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jumpToIndex(idx); }
    });
    box.querySelector(".name-box__recite").addEventListener("click", (e) => {
      e.stopPropagation();
      jumpToIndex(idx);
    });
    grid.appendChild(box);
    boxes.push(box);
  });
}

/* ---------------------------------------------------------
   Search / filter
--------------------------------------------------------- */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  stopPlayback();
  displayedNames = !q
    ? ALL_NAMES
    : ALL_NAMES.filter(item =>
        item.ar.includes(q) ||
        item.tr.toLowerCase().includes(q) ||
        (item.meaningEn || "").toLowerCase().includes(q) ||
        item.meaning.includes(q)
      );
  buildGrid(displayedNames);
});

/* ---------------------------------------------------------
   Voices for Urdu meaning TTS
--------------------------------------------------------- */
const synth = window.speechSynthesis;
let urduVoice = null;

function pickUrduVoice() {
  if (!synth) return;
  const voices = synth.getVoices();
  if (!voices || voices.length === 0) return;
  urduVoice =
    voices.find(v => /ur[-_]PK/i.test(v.lang)) ||
    voices.find(v => /^ur/i.test(v.lang)) ||
    voices.find(v => /hi[-_]IN/i.test(v.lang)) ||
    null;
}
if (synth) {
  pickUrduVoice();
  synth.onvoiceschanged = pickUrduVoice;
} else {
  playBtn.disabled = true;
  voiceNote.textContent = "معذرت، آپ کا براؤزر صوتی تلاوت سپورٹ نہیں کرتا۔";
}

/* ---------------------------------------------------------
   Narration engine (real Arabic audio + Urdu TTS)
--------------------------------------------------------- */
let currentIndex = 0;
let isPlaying = false;
let isPaused = false;
let sessionId = 0;
let currentAudio = null; // HTMLAudioElement currently in use (bismillah / arabic)

function waitAudioEnd(audio) {
  return new Promise((resolve) => {
    audio.onended = resolve;
    audio.onerror = resolve;
  });
}
function waitSpeechEnd(utterance) {
  return new Promise((resolve) => {
    utterance.onend = resolve;
    utterance.onerror = resolve;
  });
}

function setActiveBox(idx) {
  boxes.forEach((b, i) => {
    b.classList.toggle("is-active", i === idx);
    if (i < idx) b.classList.add("is-done");
  });
  const box = boxes[idx];
  const item = displayedNames[idx];
  if (box && item) {
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    nowRecitingValue.textContent = `${item.n}. ${item.ar}  —  ${item.tr}`;
  }
}
function clearAllHighlights() {
  boxes.forEach(b => { b.classList.remove("is-active"); b.classList.remove("is-done"); });
}

async function playBismillah(mySession) {
  if (mySession !== sessionId || !isPlaying) return;
  nowRecitingValue.textContent = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
  const audio = new Audio(BISMILLAH_AUDIO_URL);
  currentAudio = audio;
  const endPromise = waitAudioEnd(audio);
  try { await audio.play(); } catch (e) { /* ignore, resolves via onerror/onended */ }
  await endPromise;
  currentAudio = null;
}

async function playLoop(mySession) {
  while (isPlaying && mySession === sessionId && currentIndex < displayedNames.length) {
    const item = displayedNames[currentIndex];
    setActiveBox(currentIndex);

    // 1) real Arabic recitation audio
    if (item.audio) {
      const audio = new Audio(item.audio);
      currentAudio = audio;
      const endPromise = waitAudioEnd(audio);
      try { await audio.play(); } catch (e) { /* ignore */ }
      await endPromise;
      currentAudio = null;
    }
    if (!isPlaying || mySession !== sessionId) return;

    // 2) Urdu meaning via browser TTS
    const utterance = new SpeechSynthesisUtterance(`اس کا معنی ہے: ${item.meaning}`);
    if (urduVoice) utterance.voice = urduVoice;
    utterance.lang = urduVoice ? urduVoice.lang : "ur-PK";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const speechEnd = waitSpeechEnd(utterance);
    synth.speak(utterance);
    await speechEnd;
    if (!isPlaying || mySession !== sessionId) return;

    currentIndex += 1;
    await new Promise(r => setTimeout(r, 400));
  }

  if (isPlaying && mySession === sessionId && currentIndex >= displayedNames.length) {
    finishAll();
  }
}

function finishAll() {
  isPlaying = false;
  isPaused = false;
  currentIndex = 0;
  currentAudio = null;
  updateButtonStates();
  nowRecitingValue.textContent = "تمام نام مکمل ہو گئے — الحمدللہ";
  setTimeout(() => { clearAllHighlights(); }, 1500);
}

function updateButtonStates() {
  playBtn.disabled = isPlaying;
  pauseBtn.disabled = !isPlaying;
  stopBtn.disabled = !isPlaying && !isPaused && currentIndex === 0;

  if (isPaused) {
    pauseIcon.hidden = true;
    resumeIcon.hidden = false;
    pauseLabel.textContent = "جاری رکھیں";
  } else {
    pauseIcon.hidden = false;
    resumeIcon.hidden = true;
    pauseLabel.textContent = "ٹھہرائیں";
  }
}

function stopPlayback() {
  sessionId += 1; // invalidate any in-flight loop/callbacks
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (synth) synth.cancel();
  isPlaying = false;
  isPaused = false;
  currentIndex = 0;
  clearAllHighlights();
  updateButtonStates();
}

playBtn.addEventListener("click", async () => {
  if (isPlaying || !displayedNames.length) return;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (synth) synth.cancel();

  sessionId += 1;
  const mySession = sessionId;
  isPlaying = true;
  isPaused = false;
  updateButtonStates();

  if (currentIndex === 0) {
    await playBismillah(mySession);
  }
  playLoop(mySession);
});

pauseBtn.addEventListener("click", () => {
  if (!isPlaying) return;
  if (!isPaused) {
    if (currentAudio) currentAudio.pause();
    if (synth) synth.pause();
    isPaused = true;
    nowRecitingValue.textContent = "تلاوت رُکی ہوئی ہے — جاری رکھنے کے لیے دبائیں";
  } else {
    if (currentAudio) currentAudio.play().catch(() => {});
    if (synth) synth.resume();
    isPaused = false;
    setActiveBox(currentIndex);
  }
  updateButtonStates();
});

stopBtn.addEventListener("click", () => {
  stopPlayback();
  nowRecitingValue.textContent = 'تلاوت روک دی گئی — دوبارہ شروع کرنے کے لیے "شروع کریں" دبائیں';
});

function jumpToIndex(idx) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (synth) synth.cancel();
  sessionId += 1;
  const mySession = sessionId;
  currentIndex = idx;
  isPlaying = true;
  isPaused = false;
  clearAllHighlights();
  updateButtonStates();
  playLoop(mySession);
}

window.addEventListener("beforeunload", () => {
  if (currentAudio) currentAudio.pause();
  if (synth) synth.cancel();
});

updateButtonStates();
loadNames();
