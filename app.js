(function () {
  const WORDS_PATH = "cloudWords";
  const MAX_LENGTH = 30;
  const CLOUD_LIFETIME_MS = 45000;

  const badWords = [
    "ornek-kufur-1",
    "ornek-kufur-2"
  ];

  const emotionEmojiMap = {
  "mutluluk":"😊",
  "üzüntü":"😢",
  "uzuntu":"😢",
  "öfke":"😡",
  "ofke":"😡",
  "kaygı":"😟",
  "kaygi":"😟",
  "umut":"🌱",
  "şükür":"🤲",
  "sukur":"🤲",
  "özlem":"🌙",
  "ozlem":"🌙",
  "huzur":"🕊️",
  "heyecan":"⚡",
  "yalnızlık":"💙",
  "yalnizlik":"💙",
  "sevgi":"❤️",
  "hayal kırıklığı":"💔",
  "hayal kirikligi":"💔",
  "yorgunluk":"😴",
  "kararsızlık":"🤔",
  "kararsizlik":"🤔",
  "minnettarlık":"🥹",
  "minnettarlik":"🥹"
};

  const cloudCounts = {};
  const activeClouds = new Set();

  const emotionWeatherMap = {

  "mutluluk":"sun",

  "üzüntü":"rain",
  "uzuntu":"rain",

  "öfke":"flash",
  "ofke":"flash",

  "kaygı":"anxiety",
  "kaygi":"anxiety",

  "umut":"sun",

  "şükür":"warm",
  "sukur":"warm",

  "özlem":"moon",
  "ozlem":"moon",

  "huzur":"calm",

  "heyecan":"spark",

  "yalnızlık":"rain",
  "yalnizlik":"rain",

  "sevgi":"warm",

  "hayal kırıklığı":"rain",
  "hayal kirikligi":"rain",

  "yorgunluk":"moon",

  "kararsızlık":"calm",
  "kararsizlik":"calm",

  "minnettarlık":"gratitude",
  "minnettarlik":"gratitude"

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
  const entries = Object.entries(cloudCounts)
    .sort((a, b) => b[1] - a[1]);

  const rank = entries.findIndex(([entryKey]) => entryKey === key);
  const count = cloudCounts[key] || 1;

  // En baskın duygu
  if (rank === 0) {
    return Math.min(2.3, 1 + count * 0.08);
}

  // İkinci
  if (rank === 1) {
    return Math.min(1.9, 0.95 + count * 0.06);
}
  // Üçüncü
  if (rank === 2) {
    return Math.min(1.6, 0.9 + count * 0.05);
}

  // Diğerleri
  return 0.9;
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

  for (let index = 0; index < 120; index += 1) {      const drop = document.createElement("span");
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDelay = `${Math.random() * 1.6}s`;
      drop.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;     
      rain.appendChild(drop);
    }

    layer.appendChild(rain);
    clearWeatherAfter(rain, 9000);
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
    const stage = document.querySelector(".sky-stage");
if (!stage) return;

stage.classList.remove(
  "rain-mode",
  "sun-mode",
  "flash-mode",
  "calm-mode",
  "moon-mode",
  "warm-mode",
  "spark-mode"
);    const layer = document.querySelector("#weatherLayer");
    if (!layer) return;

    const weather = getWeatherForWord(text);
if (normalizeText(text) === "hayal kırıklığı" || normalizeText(text) === "hayal kirikligi") {

    const stage = document.querySelector(".sky-stage");

    stage.classList.add("brokenSky");

    const crack = document.createElement("div");
    crack.className = "crack";

    stage.appendChild(crack);

    setTimeout(() => {
        crack.remove();
        stage.classList.remove("brokenSky");
    }, 5000);

    return;
}
if (normalizeText(text) === "yalnızlık" || normalizeText(text) === "yalnizlik") {

    const stage = document.querySelector(".sky-stage");

    stage.classList.add("lonelySky");

    const star = document.createElement("div");
    star.className = "lonelyStar";
    stage.appendChild(star);

    setTimeout(() => {
        star.remove();
        stage.classList.remove("lonelySky");
    }, 10000);

    return;
}
    if (weather === "anxiety") {

    const stage = document.querySelector(".sky-stage");

    stage.classList.add("anxietySky");

    for(let i=0;i<45;i++){

        const fog=document.createElement("div");

        fog.className="fogPatch";

        fog.style.left=(Math.random()*100)+"vw";
        fog.style.top=(Math.random()*70)+"vh";
        fog.style.animationDelay=(Math.random()*2)+"s";

        stage.appendChild(fog);

        setTimeout(()=>fog.remove(),9000);

    }

    setTimeout(()=>{
        stage.classList.remove("anxietySky");
    },8000);

    return;

}
 if (weather === "rain") {

  addRaindrops(layer);
  addRaindrops(layer);
  addRaindrops(layer);
  addRaindrops(layer);
  addRaindrops(layer);

  document.body.style.background = "#5d7388";

  setTimeout(() => {
    document.body.style.background = "";
  }, 7000);

  document.querySelector(".sky-stage").animate(
    [
      { filter: "brightness(1)" },
      { filter: "brightness(.6)" },
      { filter: "brightness(.8)" }
    ],
    {
      duration: 7000
    }
  );

  return;
}

    if (weather === "sun") {

    const stage = document.querySelector(".sky-stage");
    const sun = document.querySelector(".sun-glow");

    stage.classList.add("hopeSky");
    sun?.classList.add("hopeSun");

    addSoftBurst(layer,"weather-sun",220);

    for(let i=0;i<35;i++){

        const ray=document.createElement("div");

        ray.className="hopeRay";

        ray.style.left=(Math.random()*100)+"vw";
        ray.style.animationDelay=(Math.random()*2)+"s";

        stage.appendChild(ray);

        setTimeout(()=>ray.remove(),7000);

    }

    setTimeout(()=>{
        stage.classList.remove("hopeSky");
        sun?.classList.remove("hopeSun");
    },7000);

    return;
}
if (weather === "rain") {

  addRaindrops(layer);
  addRaindrops(layer);
  addRaindrops(layer);
  addRaindrops(layer);
  addRaindrops(layer);

  document.querySelector(".sky-stage").animate(
    [
      {filter:"brightness(1)"},
      {filter:"brightness(.6)"},
      {filter:"brightness(.8)"}
    ],
    {
      duration:7000
    }
  );

  return;
}
if (normalizeText(text) === "kararsızlık" || normalizeText(text) === "kararsizlik") {

    const stage = document.querySelector(".sky-stage");

    stage.classList.add("confusedSky");

    setTimeout(() => {
        stage.classList.remove("confusedSky");
    }, 7000);

    return;
}
if (weather === "calm") {

    addSoftBurst(layer,"weather-calm",120);

    const stage = document.querySelector(".sky-stage");

    stage.classList.add("peaceSky");

    for(let i=0;i<25;i++){

        const feather=document.createElement("div");

        feather.className="feather";

        feather.style.left=(Math.random()*100)+"vw";
        feather.style.animationDelay=(Math.random()*4)+"s";
        feather.style.animationDuration=(8+Math.random()*6)+"s";

        stage.appendChild(feather);

        setTimeout(()=>feather.remove(),12000);

    }

    setTimeout(()=>{
        stage.classList.remove("peaceSky");
    },10000);

    return;

}

    if (weather === "warm") {

    addSoftBurst(layer,"weather-warm",100);

    const stage=document.querySelector(".sky-stage");

    stage.classList.add("loveSky");

    for(let i=0;i<18;i++){

        const light=document.createElement("div");

        light.className="loveLight";

        light.style.left=(Math.random()*100)+"vw";
        light.style.bottom=(-20-Math.random()*80)+"px";
        light.style.animationDelay=(Math.random()*2)+"s";
        light.style.animationDuration=(8+Math.random()*4)+"s";

        stage.appendChild(light);

        setTimeout(()=>light.remove(),12000);

    }

    setTimeout(()=>{
        stage.classList.remove("loveSky");
    },10000);

    return;

}
if (normalizeText(text) === "yorgunluk") {

    const stage = document.querySelector(".sky-stage");

    stage.classList.add("sleepSky");

    for(let i=0;i<12;i++){

        const z=document.createElement("div");

        z.className="zzz";

        z.innerHTML="Z";

        z.style.left=(10+Math.random()*80)+"vw";
        z.style.bottom="-20px";
        z.style.fontSize=(20+Math.random()*40)+"px";
        z.style.animationDelay=(Math.random()*2)+"s";

        stage.appendChild(z);

        setTimeout(()=>z.remove(),6000);

    }

    setTimeout(()=>{
        stage.classList.remove("sleepSky");
    },6000);

    return;
}
    if (weather === "moon") {

    addSoftBurst(layer,"weather-moon",120);

    const stage=document.querySelector(".sky-stage");

    stage.classList.add("nostalgiaSky");

    for(let i=0;i<45;i++){

        const star=document.createElement("div");

        star.className="memoryStar";

        star.style.left=(Math.random()*100)+"vw";
        star.style.top=(Math.random()*60)+"vh";
        star.style.animationDelay=(Math.random()*3)+"s";

        stage.appendChild(star);

        setTimeout(()=>star.remove(),9000);

    }

    setTimeout(()=>{
        stage.classList.remove("nostalgiaSky");
    },9000);

    return;

}
if (weather === "gratitude") {

    const stage = document.querySelector(".sky-stage");

    stage.classList.add("gratitudeSky");

    for(let i=0;i<25;i++){

        const ray=document.createElement("div");

        ray.className="lightRay";

        ray.style.left=(Math.random()*100)+"vw";
        ray.style.animationDelay=(Math.random()*2)+"s";
        ray.style.animationDuration=(5+Math.random()*3)+"s";

        stage.appendChild(ray);

        setTimeout(()=>ray.remove(),8000);

    }

    setTimeout(()=>{
        stage.classList.remove("gratitudeSky");
    },7000);

    return;

}
    if (weather === "spark") {

    addSoftBurst(layer,"weather-spark",180);

    const stage=document.querySelector(".sky-stage");

    stage.classList.add("energySky");

    for(let i=0;i<45;i++){

        const spark=document.createElement("div");

        spark.className="energySpark";

        spark.style.left=(Math.random()*100)+"vw";
        spark.style.top=(Math.random()*100)+"vh";
        spark.style.animationDelay=(Math.random()*1.5)+"s";

        stage.appendChild(spark);

        setTimeout(()=>spark.remove(),4000);

    }

    setTimeout(()=>{
        stage.classList.remove("energySky");
    },4000);

    return;

}

    if (weather === "flash") {

  addSoftBurst(layer, "weather-flash", 80);

  const flash = document.createElement("div");
  flash.className = "lightning";
  document.querySelector(".sky-stage").appendChild(flash);

  document.querySelector(".sky-stage").classList.add("shake");

  setTimeout(() => {
    flash.remove();
    document.querySelector(".sky-stage").classList.remove("shake");
  }, 800);

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
    cloudCounts[key] = (cloudCounts[key] || 0) + 1;

    const scale = getCloudScale(key);
let top;

if (scale > 3.5) {
  top = 28 + Math.random() * 20;
} else {
  top = 5 + Math.random() * 75;
}
    const duration = 43000 + Math.random() * 8000;
    const emoji = word.emoji || getEmojiForWord(cleanText);
    triggerWeatherForEmotion(cleanText);

    const type = Math.floor(Math.random() * 3) + 1;
    cloud.className = `cloud cloud-${type}`;
    if (document.querySelector(".sky-stage")?.classList.contains("confusedSky")) {
    cloud.classList.add("confusedCloud");
}
    cloud.dataset.key = key;
    cloud.style.setProperty("--top", `${top}vh`);
    cloud.style.setProperty("--duration", `${duration}ms`);
    cloud.style.setProperty("--scale", scale.toFixed(2));
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
