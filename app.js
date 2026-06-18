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

  const wordsRef = () => database.ref(WORDS_PATH);

  function initParticipantPage() {
    const form = document.querySelector("#wordForm");
    const input = document.querySelector("#wordInput");
    const message = document.querySelector("#formMessage");
    const counter = document.querySelector("#charCounter");

    if (!form || !input) return;

    const setMessage = (text) => {
      message.textContent = text;
      if (text) {
        window.setTimeout(() => {
          if (message.textContent === text) message.textContent = "";
        }, 2200);
      }
    };

    input.addEventListener("input", () => {
      counter.textContent = `${input.value.length}/${MAX_LENGTH}`;
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const text = sanitizeText(input.value);
      if (!text) {
        setMessage("Bir kelime yaz.");
        return;
      }

      if (containsBadWord(text)) {
        setMessage("Başka bir kelime deneyelim.");
        return;
      }

      try {
        await wordsRef().push({
          text,
          emoji: getEmojiForWord(text),
          createdAt: firebase.database.ServerValue.TIMESTAMP
        });

        input.value = "";
        counter.textContent = `0/${MAX_LENGTH}`;
        setMessage("Gönderildi.");
        input.focus();
      } catch (error) {
        console.error(error);
        setMessage("Bağlantı hatası.");
      }
    });
  }

  function createCloud(word) {
    const layer = document.querySelector("#cloudLayer");
    if (!layer) return;

    const cloud = document.createElement("div");
    const text = document.createElement("span");
    const top = 8 + Math.random() * 70;
    const duration = 42000 + Math.random() * 9000;
    const scale = 0.86 + Math.random() * 0.34;
    const emoji = word.emoji || getEmojiForWord(word.text);

    cloud.className = "cloud";
    cloud.style.setProperty("--top", `${top}vh`);
    cloud.style.setProperty("--duration", `${duration}ms`);
    cloud.style.setProperty("--scale", scale.toFixed(2));

    text.className = "cloud-text";
    text.textContent = emoji ? `${emoji} ${word.text}` : word.text;
    cloud.appendChild(text);
    layer.appendChild(cloud);

    window.setTimeout(() => cloud.remove(), CLOUD_LIFETIME_MS + 7000);
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
          text: sanitizeText(word.text),
          emoji: word.emoji || ""
        });
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initParticipantPage();
    initScreenPage();
  });
})();
