// musik.js — musik latar yang langsung play begitu halaman disentuh.
// Cara pakai: taruh file ini di folder yang sama, lalu tambahkan sebelum </body>:
//   <script src="musik.js"></script>
(function () {
  // ====== PENGATURAN ======
  const MUSIK_URL = "lost soul 2.mp3"; // nama file audio atau link langsung ke file audio
  const VOLUME = 0.35;           // 0 (hening) sampai 1 (paling keras)
  const FADE_MS = 2000;          // lama masuk pelan-pelan
  // ========================

  const audio = new Audio(MUSIK_URL);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;

  let jalan = false;
  const pemicu = ["pointerup", "touchend", "click", "keydown"];

  function fadeIn() {
    const langkah = 20;
    let i = 0;
    const t = setInterval(() => {
      i++;
      audio.volume = Math.min(VOLUME, (VOLUME * i) / langkah);
      if (i >= langkah) clearInterval(t);
    }, FADE_MS / langkah);
  }

  function mulai() {
    if (jalan) return;
    audio.play()
      .then(() => {
        jalan = true;
        fadeIn();
        pemicu.forEach((ev) => document.removeEventListener(ev, mulai));
      })
      .catch(() => {}); // diblokir browser / file belum ada: coba lagi di sentuhan berikutnya
  }

  // Coba langsung, dan siapkan pemicu sentuhan pertama (aturan browser HP)
  mulai();
  pemicu.forEach((ev) => document.addEventListener(ev, mulai, { passive: true }));

  // Berhenti saat pindah aplikasi / layar mati, lanjut saat kembali
  document.addEventListener("visibilitychange", () => {
    if (!jalan) return;
    if (document.hidden) audio.pause();
    else audio.play().catch(() => {});
  });
})();