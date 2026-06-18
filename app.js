(function () {
  const WORDS_PATH = "cloudWords";
  const MAX_LENGTH = 30;
  const CLOUD_LIFETIME_MS = 45000;

  const badWords = [
    "ornek-kufur-1",
    "ornek-kufur-2"
  ];

  const emotionEmojiMap = {
    "kaygi": "😟",
    "kaygı": "😟",
    "umut": "🌱",
    "sukur": "🤲",
    "şükür": "🤲",
    "ozlem": "🌙",
    "özlem": "🌙",
    "sevinc": "✨",
    "sevinç": "✨",
    "huzur": "🕊️",
    "heyecan": "⚡",
    "mutluluk": "😊",
    "yalnizlik": "💙",
    "yalnızlık": "💙"
  };

  const cloudCounts = {};
  const activeClouds = new Set();

  const emotionWeatherMap = {
    "kaygi": "rain",
    "kaygı": "rain",
    "yalnizlik": "rain",
    "yalnızlık": "rain",
    "umut": "sun",
    "sukur": "warm",
    "şükür": "warm",
    "ozlem": "moon",
    "özlem": "moon",
    "sevinc": "spark",
    "sevinç": "spark",
    "mutluluk": "spark",
    "huzur": "calm",
    "heyecan": "flash"
  };

  const normalizeText = (value) =>
    value
      .toLocaleLowerCase("tr-TR")
      .normalize("NFKC")
      .trim();

  const sanitizeText = (value) =>
    value
      .normalize("NFKC")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_LENGTH);

  const containsBadWord = (value) => {
    const normalized = normalizeText(value);
    return badWords.some((word) => normalized.includes(normalizeText(word)));
  };

  const getEmojiForWord = (value) => {
    const key = normalizeText(value);
    return emotionEmojiMap[key] || "";
  };

  const getWeatherForWord = (value) => {
    const key = normalizeText(value);
    return emotionWeatherMap[key] || "calm";
  };

  const wordsRef = () => database.ref(WORDS_PATH);

  async function sendEmotion(text, emoji) {
    const cleanText = sanitizeText(text);
    if (!cleanText || containsBadWord(cleanText)) return false;

    await wordsRef().push({
      text: cleanText,
      emoji: emoji || getEmojiForWord(cleanText),
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });

    return true;
  }

  function initParticipantPage() {
    const grid = document.querySelector("#emotionGrid");
    const message = document.querySelector("#formMessage");

    if (!grid) return;

    const setMessage = (text) => {
      message.textContent = text;
      if (text) {
        window.setTimeout(() => {
          if (message.textContent === text) message.textContent = "";
        }, 1800);
      }
    };

    grid.addEventListener("click", async (event) => {
      const button = event.target.closest(".emotion-option");
      if (!button || button.disabled) return;

      button.disabled = true;

      try {
        const sent = await sendEmotion(button.dataset.emotion, button.dataset.emoji);
        setMessage(sent ? "Gönderildi." : "Başka bir duygu deneyelim.");
      } catch (error) {
        console.error(error);
        setMessage("Bağlantı hatası.");
      } finally {
        window.setTimeout(() => {
          button.disabled = false;
        }, 900);
      }
    });
  }

  function getCloudScale(key) {
    const entries = Object.entries(cloudCounts).sort((a, b) => b[1] - a[1]);
    const rank = entries.findIndex(([entryKey]) => entryKey === key);
    const count = cloudCounts[key] || 1;

    if (rank === 0) return Math.min(1.55, 1.18 + count * 0.05);
    if (rank === 1) return Math.min(1.34, 1.08 + count * 0.035);
    if (rank === 2) return Math.min(1.22, 1.02 + count * 0.025);
    return 0.96;
  }

  function refreshCloudSizes() {
    activeClouds.forEach((cloud) => {
      const key = cloud.dataset.key;
      cloud.style.setProperty("--scale", getCloudScale(key).toFixed(2));
    });
  }

  function clearWeatherAfter(element, delay = 5200) {
    window.setTimeout(() => element.remove(), delay);
  }

  function addRaindrops(layer) {
    const rain = document.createElement("div");
    rain.className = "weather-rain";

    for (let index = 0; index < 28; index += 1) {
      const drop = document.createElement("span");
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDelay = `${Math.random() * 1.6}s`;
      drop.style.animationDuration = `${1.9 + Math.random() * 1.1}s`;
      rain.appendChild(drop);
    }

    layer.appendChild(rain);
    clearWeatherAfter(rain, 5600);
  }

  function addSoftBurst(layer, className, pieces = 18) {
    const burst = document.createElement("div");
    burst.className = className;

    for (let index = 0; index < pieces; index += 1) {
      const piece = document.createElement("span");
      piece.style.left = `${12 + Math.random() * 76}%`;
      piece.style.top = `${12 + Math.random() * 56}%`;
      piece.style.animationDelay = `${Math.random() * 1.2}s`;
      burst.appendChild(piece);
    }

    layer.appendChild(burst);
    clearWeatherAfter(burst, 5200);
  }

  function triggerWeatherForEmotion(text) {
    const layer = document.querySelector("#weatherLayer");
    if (!layer) return;

    const weather = getWeatherForWord(text);

    if (weather === "rain") {
      addRaindrops(layer);
      return;
    }

    if (weather === "sun") {
      addSoftBurst(layer, "weather-sun", 14);
      return;
    }

    if (weather === "warm") {
      addSoftBurst(layer, "weather-warm", 12);
      return;
    }

    if (weather === "moon") {
      addSoftBurst(layer, "weather-moon", 10);
      return;
    }

    if (weather === "spark") {
      addSoftBurst(layer, "weather-spark", 24);
      return;
    }

    if (weather === "flash") {
      addSoftBurst(layer, "weather-flash", 8);
      return;
    }

    addSoftBurst(layer, "weather-calm", 10);
  }

  function createCloud(word) {
    const layer = document.querySelector("#cloudLayer");
    if (!layer) return;

    const cleanText = sanitizeText(word.text);
    const key = normalizeText(cleanText);
    const cloud = document.createElement("div");
    const text = document.createElement("span");
    const top = 8 + Math.random() * 68;
    const duration = 43000 + Math.random() * 8000;
    const emoji = word.emoji || getEmojiForWord(cleanText);

    cloudCounts[key] = (cloudCounts[key] || 0) + 1;
    triggerWeatherForEmotion(cleanText);

    cloud.className = "cloud";
    cloud.dataset.key = key;
    cloud.style.setProperty("--top", `${top}vh`);
    cloud.style.setProperty("--duration", `${duration}ms`);
    cloud.style.setProperty("--scale", getCloudScale(key).toFixed(2));

    text.className = "cloud-text";
    text.textContent = emoji ? `${emoji} ${cleanText}` : cleanText;
    cloud.appendChild(text);
    layer.appendChild(cloud);
    activeClouds.add(cloud);
    refreshCloudSizes();

    window.setTimeout(() => {
      activeClouds.delete(cloud);
      cloud.remove();
    }, CLOUD_LIFETIME_MS + 7000);
  }

  function initScreenPage() {
    const layer = document.querySelector("#cloudLayer");
    const fullscreenButton = document.querySelector("#fullscreenButton");
    if (!layer) return;

    const pageStartedAt = Date.now();

    fullscreenButton?.addEventListener("click", async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          fullscreenButton.textContent = "Çıkış";
        } else {
          await document.exitFullscreen();
          fullscreenButton.textContent = "Tam ekran";
        }
      } catch (error) {
        console.error(error);
      }
    });

    wordsRef()
      .orderByChild("createdAt")
      .startAt(pageStartedAt)
      .on("child_added", (snapshot) => {
        const word = snapshot.val();
        if (!word || !word.text) return;
        createCloud({
          text: word.text,
          emoji: word.emoji || ""
        });
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initParticipantPage();
    initScreenPage();
  });
})();
