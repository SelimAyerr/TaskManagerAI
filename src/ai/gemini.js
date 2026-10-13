// LocalStorage Anahtarları
const API_KEY_STORAGE = "geminiApiKey";
const ACTIVE_MODEL_STORAGE = "geminiActiveModel";

// Yüksek kotalı öncelikli modeller (1,500 İstek/Gün Ücretsiz Kota)
// gemini-2.5-flash modellerinin ücretsiz kotası günlük sadece 20 istek olduğundan listenin sonuna konur
export const FALLBACK_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash-001",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-002",
  "gemini-1.5-flash-001",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-pro",
  "gemini-2.5-flash",
];

// Oturum boyunca kotası dolan modelleri hafızada tut
const quotaExhaustedModels = new Set();

/**
 * Kayıtlı Gemini API anahtarını döner
 */
export function getApiKey() {
  const local = localStorage.getItem(API_KEY_STORAGE) || "";
  if (local) return local;
  try {
    return (import.meta.env?.VITE_GEMINI_API_KEY || "").trim();
  } catch {
    return "";
  }
}

/**
 * Gemini API anahtarını kaydeder
 */
export function saveApiKey(key) {
  const trimmed = (key || "").trim();
  if (trimmed) {
    localStorage.setItem(API_KEY_STORAGE, trimmed);
    quotaExhaustedModels.clear(); // Yeni anahtar girildiğinde kota havuzunu sıfırla
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
    localStorage.removeItem(ACTIVE_MODEL_STORAGE);
    quotaExhaustedModels.clear();
  }
}

/**
 * API anahtarının mevcut olup olmadığını denetler
 */
export function hasApiKey() {
  return Boolean(getApiKey());
}

/**
 * Aktif çalışan modeli döner veya varsayılanı verir.
 * gemini-2.5 modelleri günlük 20 istek kotalı olduğundan otomatik olarak 2.0 veya 1.5'e yönlendirir.
 */
export function getActiveModel() {
  const current = localStorage.getItem(ACTIVE_MODEL_STORAGE);
  if (!current || current.includes("2.5") || quotaExhaustedModels.has(current)) {
    const safeModel = FALLBACK_MODELS.find(
      (m) => !m.includes("2.5") && !quotaExhaustedModels.has(m)
    ) || "gemini-2.0-flash";
    localStorage.setItem(ACTIVE_MODEL_STORAGE, safeModel);
    return safeModel;
  }
  return current;
}

/**
 * Çalışan modeli kaydeder
 */
export function saveActiveModel(modelName) {
  if (modelName) {
    localStorage.setItem(ACTIVE_MODEL_STORAGE, modelName);
  }
}

/**
 * Google AI Studio'dan kullanıcının API anahtarıyla erişebildiği
 * generateContent destekli en uygun yüksek kotalı modeli dinamik olarak bulur
 */
export async function findSupportedModel(apiKey) {
  const key = apiKey || getApiKey();
  if (!key) return "gemini-2.0-flash";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );

    if (res.ok) {
      const data = await res.json();
      const models = data?.models || [];
      const contentModels = models
        .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m) => m.name.replace(/^models\//, ""));

      // Öncelik sıramızdaki modellerden ilk eşleşeni bul (2.5 modellerini kota kısıtı nedeniyle es geç)
      for (const candidate of FALLBACK_MODELS) {
        if (candidate.includes("2.5")) continue;
        if (contentModels.includes(candidate)) {
          saveActiveModel(candidate);
          return candidate;
        }
      }

      // Eşleşen yoksa 2.5 dışındaki 'flash' içeren ilk modeli seç
      const anyFlash = contentModels.find(
        (n) => n.includes("flash") && !n.includes("2.5")
      );
      if (anyFlash) {
        saveActiveModel(anyFlash);
        return anyFlash;
      }

      // O da yoksa ilk modeli seç
      if (contentModels.length > 0) {
        saveActiveModel(contentModels[0]);
        return contentModels[0];
      }
    }
  } catch (err) {
    console.warn("Model listeleme hatası:", err);
  }

  return getActiveModel();
}

/**
 * Tek bir model için ping isteği gönderir
 */
async function pingModel(modelName, key) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "OK" }] }],
      generationConfig: { maxOutputTokens: 5 },
    }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/**
 * Hatanın kota aşımı veya rate limit olup olmadığını tespit eder
 */
function isQuotaOrRateLimitError(statusCode, errorObj) {
  const msg = (errorObj?.message || "").toLowerCase();
  const status = (errorObj?.status || "").toUpperCase();
  const code = errorObj?.code || statusCode;
  return (
    code === 429 ||
    status === "RESOURCE_EXHAUSTED" ||
    msg.includes("quota exceeded") ||
    msg.includes("rate limit") ||
    msg.includes("free_tier_requests") ||
    msg.includes("too many requests") ||
    msg.includes("limit: 20")
  );
}

/**
 * Modelin bulunamadığını (404/desteklenmiyor) tespit eder
 */
function isModelNotFoundError(statusCode, errorObj) {
  const msg = (errorObj?.message || "").toLowerCase();
  const code = errorObj?.code || statusCode;
  return code === 404 || msg.includes("not found") || msg.includes("is not supported");
}

/**
 * API anahtarını test eder ve çalışan modeli otomatik olarak belirler
 */
export async function testApiKey(apiKey) {
  const key = apiKey || getApiKey();
  if (!key) {
    return { success: false, error: "API anahtarı bulunamadı." };
  }

  try {
    // 1. Önce ListModels ile API anahtarının yetkili modellerini sorgula
    const autoModel = await findSupportedModel(key);
    const firstCheck = await pingModel(autoModel, key);

    if (firstCheck.ok) {
      saveActiveModel(autoModel);
      return { success: true, model: autoModel };
    }

    // 2. Eğer ilk model kota veya model hatası verdiyse diğer modelleri sırayla dene
    for (const candidate of FALLBACK_MODELS) {
      if (candidate === autoModel || candidate.includes("2.5")) continue;
      const check = await pingModel(candidate, key);
      if (check.ok) {
        saveActiveModel(candidate);
        return { success: true, model: candidate };
      }
    }

    const msg =
      firstCheck.data?.error?.message ||
      "Geçersiz API Anahtarı veya model desteklenmiyor.";
    return { success: false, error: msg };
  } catch (err) {
    return {
      success: false,
      error:
        err?.message ||
        "Bağlantı hatası oluştu. Lütfen internetinizi kontrol edin.",
    };
  }
}

export const DEFAULT_SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
];

/**
 * Güvenli ve dinamik generateContent çağrısı.
 * Kota dolması (429 / RESOURCE_EXHAUSTED) veya model bulunamadığında diğer modellere otomatik geçiş yapar.
 */
async function callGeminiGenerate(requestBody) {
  const key = getApiKey();
  if (!key) {
    throw new Error("Gemini API anahtarı ayarlanmamış.");
  }

  if (!requestBody.safetySettings) {
    requestBody.safetySettings = DEFAULT_SAFETY_SETTINGS;
  }

  let model = getActiveModel();
  if (quotaExhaustedModels.has(model)) {
    const nextAvail = FALLBACK_MODELS.find(
      (m) => !quotaExhaustedModels.has(m) && !m.includes("2.5")
    );
    if (nextAvail) {
      model = nextAvail;
      saveActiveModel(nextAvail);
    }
  }

  const makeRequest = async (targetModel) => {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${key}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const data = await res.json();
    return { res, data };
  };

  let { res, data } = await makeRequest(model);

  // Model bulunamadıysa VEYA kota tükendiyse alternatif modellere otomatik geçiş yap
  if (!res.ok) {
    const errObj = data?.error;
    if (
      isQuotaOrRateLimitError(res.status, errObj) ||
      isModelNotFoundError(res.status, errObj)
    ) {
      console.warn(
        `Model ${model} hatası: ${errObj?.message}. Yüksek kotalı yedek modellere geçiliyor...`
      );
      quotaExhaustedModels.add(model);

      for (const candidate of FALLBACK_MODELS) {
        if (candidate === model || quotaExhaustedModels.has(candidate)) continue;
        console.log(`Denenen yedek model: ${candidate}...`);
        const attempt = await makeRequest(candidate);
        if (attempt.res.ok) {
          saveActiveModel(candidate);
          res = attempt.res;
          data = attempt.data;
          break;
        } else if (
          isQuotaOrRateLimitError(attempt.res.status, attempt.data?.error) ||
          isModelNotFoundError(attempt.res.status, attempt.data?.error)
        ) {
          quotaExhaustedModels.add(candidate);
        }
      }
    }
  }

  if (!res.ok) {
    const errorMsg = data?.error?.message || "Gemini API yanıt vermedi.";
    const err = new Error(errorMsg);
    err.isQuotaExceeded = isQuotaOrRateLimitError(res.status, data?.error);
    throw err;
  }

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Yapay zeka boş yanıt döndürdü.");
  }

  return rawText;
}

/**
 * JSON veya metin kalıntılarını ([, {, ", :, title vb.) temizleyip saf metne dönüştürür
 */
export function cleanField(val, fallback = "") {
  if (!val) return fallback;
  let s = String(val).trim();
  s = s.replace(/^[[{\s"':,\-*#]+/, "");
  s = s.replace(/[\]}\s"':,]+$/, "");
  s = s.replace(/^(?:title|baslik|gorev|task|description|aciklama|reason|neden|sebep|gerekce)["\s:]+/i, "");
  s = s.replace(/^["\s:]+/, "").replace(/["\s:]+$/, "");
  return s.trim() || fallback;
}

/**
 * Her türlü model çıktısını (JSON, Markdown içinde JSON, tekil nesne veya serbest metin)
 * hatasız ve güvenli biçimde görev önerilerine dönüştürür.
 */
export function parseAndNormalizeSuggestions(rawText, _userMemory = null) {
  if (!rawText || typeof rawText !== "string") {
    return [];
  }

  const text = rawText.trim();
  let parsed = null;

  try {
    parsed = JSON.parse(text);
  } catch {}

  if (!parsed) {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      const codeContent = codeBlockMatch[1].trim();
      try {
        parsed = JSON.parse(codeContent);
      } catch {
        try {
          const sanitized = codeContent.replace(/,\s*([}\]])/g, "$1");
          parsed = JSON.parse(sanitized);
        } catch {}
      }
    }
  }

  if (!parsed) {
    const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      const arrContent = arrayMatch[0];
      try {
        parsed = JSON.parse(arrContent);
      } catch {
        try {
          const sanitized = arrContent.replace(/,\s*([}\]])/g, "$1");
          parsed = JSON.parse(sanitized);
        } catch {}
      }
    }
  }

  let list = [];
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.suggestions)) {
      list = parsed.suggestions;
    } else if (Array.isArray(parsed.tasks)) {
      list = parsed.tasks;
    } else if (Array.isArray(parsed.items)) {
      list = parsed.items;
    } else if (parsed.title || parsed.baslik) {
      list = [parsed];
    }
  }

  if (list.length === 0) {
    const objectMatches = text.match(/\{[^{}]*?"(?:title|baslik|gorev)"\s*:[^{}]*?\}/gis);
    if (objectMatches && objectMatches.length > 0) {
      for (const objStr of objectMatches) {
        try {
          const singleObj = JSON.parse(objStr);
          if (singleObj && (singleObj.title || singleObj.baslik)) {
            list.push(singleObj);
          }
        } catch {
          try {
            const sanitized = objStr.replace(/,\s*([}\]])/g, "$1");
            const singleObj = JSON.parse(sanitized);
            if (singleObj && (singleObj.title || singleObj.baslik)) {
              list.push(singleObj);
            }
          } catch {}
        }
      }
    }
  }

  if (list.length === 0) {
    const titleMatches = [...text.matchAll(/"(?:title|baslik|gorev)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/gi)];
    if (titleMatches.length > 0) {
      for (const tm of titleMatches) {
        const titleStr = cleanField(tm[1]);
        if (!titleStr) continue;

        const sub = text.slice(tm.index);
        const descMatch = sub.match(/"(?:description|aciklama)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
        const prioMatch = sub.match(/"(?:priority|oncelik)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
        const reasonMatch = sub.match(/"(?:reason|neden|sebep|gerekce)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);

        list.push({
          title: titleStr,
          description: descMatch ? cleanField(descMatch[1]) : "",
          priority: prioMatch ? cleanField(prioMatch[1]) : "Orta",
          reason: reasonMatch ? cleanField(reasonMatch[1]) : "",
        });
      }
    }
  }

  if (list.length === 0) {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && l !== "[" && l !== "]" && l !== "{" && l !== "}");

    if (lines.length > 0) {
      const title = cleanField(lines[0], "Önerilen Odak Görevi");
      const description = lines.length > 1 ? cleanField(lines.slice(1, 3).join(" ")) : "";
      let priority = "Orta";
      if (text.includes("Yüksek")) priority = "Yüksek";
      else if (text.includes("Düşük")) priority = "Düşük";

      let reason = "";
      const reasonMatch = text.match(/(?:Neden|Sebep):\s*([^\n]+)/i);
      if (reasonMatch) reason = cleanField(reasonMatch[1]);

      list = [{ title, description, priority, reason }];
    }
  }

  return list.map((item, index) => {
    let priority = "Orta";
    const rawPriority = cleanField(item.priority || item.oncelik || "");
    if (rawPriority && ["Yüksek", "Orta", "Düşük"].includes(rawPriority)) {
      priority = rawPriority;
    } else if (typeof rawPriority === "string") {
      const pLower = rawPriority.toLowerCase();
      if (pLower.includes("yüksek") || pLower.includes("high")) priority = "Yüksek";
      else if (pLower.includes("düşük") || pLower.includes("low")) priority = "Düşük";
    }

    const title = cleanField(
      item.title || item.baslik || item.gorev || item.task,
      "Önerilen Odak Görevi"
    );

    const description = cleanField(
      item.description || item.aciklama || item.detay || item.details
    );

    let subtopics = [];
    const rawSub =
      item.subtopics ||
      item.altBasliklar ||
      item.alt_basliklar ||
      item.sub_topics ||
      item.topics;

    if (Array.isArray(rawSub)) {
      subtopics = rawSub
        .map((st, i) => {
          const rawTitle = typeof st === "string" ? st : st.title || st.name || "";
          const cleanStTitle = cleanField(rawTitle);
          return {
            id: `st-${Date.now()}-${index}-${i}`,
            title: cleanStTitle,
            notes: "",
            completed: false,
            evaluated: false,
            bonusXp: 0,
            feedback: "",
          };
        })
        .filter((st) => Boolean(st.title));
    }

    if (subtopics.length === 0) {
      subtopics = [
        {
          id: `st-${Date.now()}-${index}-0`,
          title: `${title} - Temel Kavramlar & Mimari Yapı`,
          notes: "",
          completed: false,
          evaluated: false,
          bonusXp: 0,
          feedback: "",
        },
        {
          id: `st-${Date.now()}-${index}-1`,
          title: `${title} - En İyi Pratikler & Optimizasyon`,
          notes: "",
          completed: false,
          evaluated: false,
          bonusXp: 0,
          feedback: "",
        },
      ];
    }

    return {
      id: `ai-sugg-${Date.now()}-${index}`,
      title,
      description,
      priority,
      subtopics,
    };
  });
}

/**
 * Kullanıcı hafızasına ve mesleğine göre akıllı yerel görev önerileri üretir (Kota dolduğunda kesintisiz akış için)
 */
export function generateOfflineSuggestions(userMemory = null) {
  const occ = (userMemory?.identity?.occupation || "").toLowerCase();
  const now = Date.now();

  let presets = [];
  if (
    occ.includes("yazılım") ||
    occ.includes("geliştirici") ||
    occ.includes("kod") ||
    occ.includes("dev") ||
    occ.includes("mühendis")
  ) {
    presets = [
      {
        title: "Modüler Mimari Refaktörü & Kod İyileştirmesi",
        description: "Bileşenler arasındaki bağımlılıkları azaltıp kod tekrarını temizleyerek performansı artır.",
        priority: "Yüksek",
        subtopics: [
          "Kod karmaşıklığı analizi ve fazlalıkların tespiti",
          "Birim testleri ve yeniden kullanılabilir yardımcı fonksiyonlar",
        ],
      },
      {
        title: "Kritik API Entegrasyonu & Hata İzolasyonu",
        description: "Uç noktaların yanıt sürelerini ölç, hata yönetimini güçlendir ve sınır durumları test et.",
        priority: "Yüksek",
        subtopics: [
          "Zaman aşımı ve arka plan hata yakalama senaryoları",
          "Önbellek katmanı ve optimizasyon kurgusu",
        ],
      },
      {
        title: "Performans Profili & Bellek Sızıntısı İncelemesi",
        description: "Gereksiz yeniden çizimleri ve bellek kullanımını inceleyerek akıcılığı maksimize et.",
        priority: "Orta",
        subtopics: [
          "Tarayıcı performans ölçümü ve ağır render analizi",
          "Asset ve bundle boyutu optimizasyonu",
        ],
      },
    ];
  } else if (
    occ.includes("tasarım") ||
    occ.includes("ui") ||
    occ.includes("ux") ||
    occ.includes("dizayn")
  ) {
    presets = [
      {
        title: "Tasarım Sistemi Tipografi & Renk Hiyerarşisi Revizyonu",
        description: "Kontrast oranlarını ve görsel ağırlıkları denetleyerek arayüz dengesini güçlendir.",
        priority: "Yüksek",
        subtopics: [
          "Tipografi ölçeği ve satır aralıkları denetimi",
          "Erişilebilirlik (WCAG) kontrast kontrolleri",
        ],
      },
      {
        title: "Kullanıcı Yolculuğu & Mikro-Etkileşim Tasarımı",
        description: "Kullanıcının ana akışındaki kritik buton ve geçişlere akıcı mikro-animasyonlar kazandır.",
        priority: "Orta",
        subtopics: [
          "Durum geçişleri (Hover, Active, Focus) animasyonları",
          "Geri bildirim ve başarı durum ekranları",
        ],
      },
      {
        title: "Bileşen Kütüphanesi Düzenleme & Varyant Sadeleştirme",
        description: "Gereksiz türetilmiş buton ve form varyantlarını tek çatı altında topla.",
        priority: "Orta",
        subtopics: [
          "Bileşen değişkenleri ve durum matrisi kontrolü",
          "Görsel tutarlılık ve token eşleştirmesi",
        ],
      },
    ];
  } else {
    presets = [
      {
        title: "Derin Odaklanma (Deep Work) Sprinti - 50 Dakika",
        description: "Tüm bildirimleri kapatıp günün en kritik hedefine kesintisiz odaklanarak ilerle.",
        priority: "Yüksek",
        subtopics: [
          "En yüksek öncelikli tek bir görevi belirle ve hazırla",
          "Çıktıları gözden geçirip sonraki aşamayı not al",
        ],
      },
      {
        title: "Stratejik Haftalık Öncelik Matrisi (Eisenhower)",
        description: "Acil ve önemli görevleri sınıflandırarak vakit kaybettiren işleri ele.",
        priority: "Yüksek",
        subtopics: [
          "Yapılacaklar listesini önem/aciliyet ekseninde filtrele",
          "Bugün bitmesi zorunlu 3 ana hedefi kilitle",
        ],
      },
      {
        title: "Dijital Çalışma Alanı & Bilgi Düzeni Temizliği",
        description: "Masaüstü, indirmeler ve açık sekmeleri organize ederek zihinsel berraklık kazan.",
        priority: "Orta",
        subtopics: [
          "Aktif olmayan dosyaları arşivle veya kaldır",
          "Günün notlarını tek bir dokümanda toparla",
        ],
      },
    ];
  }

  return presets.map((p, idx) => ({
    id: `ai-sugg-offline-${now}-${idx}`,
    title: p.title,
    description: p.description,
    priority: p.priority,
    subtopics: p.subtopics.map((stTitle, sidx) => ({
      id: `st-off-${now}-${idx}-${sidx}`,
      title: stTitle,
      notes: "",
      completed: false,
      evaluated: false,
      bonusXp: 0,
      feedback: "",
    })),
  }));
}

/**
 * Kota dolduğunda kullanıcıyı cevapsız bırakmayan akıllı yerel asistan yanıtı
 */
export function generateOfflineChatReply(messages, userMemory = null, playerStats = null) {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const lower = lastUserMsg.toLowerCase();
  const name = userMemory?.identity?.name || "Dostum";
  const level = playerStats?.level || 1;

  // Görev talep edildiyse [TASK: {...}] formatında doğrudan eklenebilir görev üret
  if (
    lower.includes("görev") ||
    lower.includes("task") ||
    lower.includes("plan") ||
    lower.includes("ekle") ||
    lower.includes("öner")
  ) {
    const rawClean = lastUserMsg.replace(/görev(i|ini|e| ver| ekle)?/gi, "").trim();
    const cleanTitle = cleanField(rawClean, "Stratejik Odaklanma Görevi").slice(0, 45);
    return `Harika bir hedef ${name}! Seviye ${level} üretkenlik hedeflerin için bu görevi hemen yapılandırdım:

[TASK: {"title": "${cleanTitle}", "description": "Öncelikli adımları tamamlayıp seviye atlamak için bu göreve odaklan.", "priority": "Yüksek", "subtopics": ["Gereksinimleri belirle ve hazırla", "Uygulamayı tamamla ve doğrula"]}]

Yukarıdaki butona tıklayarak doğrudan görev listenize ekleyebilirsiniz! ⚡

*(💡 Bilgi: Gemini 2.5 ücretsiz kotanız dolduğu için şu an Akıllı Çevrimdışı Koç olarak yardımcı oluyorum. Farklı bir API anahtarınız varsa profil ayarlarından değiştirebilirsiniz.)*`;
  }

  // Genel koçluk ve motivasyon yanıtı
  return `Harika bir soru ${name}! 🚀 

Şu an Seviye ${level} basamağındasın ve üretkenlik ritmin gayet iyi ilerliyor. En verimli çalışma için şu 3 kuralı uygulayabilirsin:
1. **Tek Bir Göreve Odaklan:** Bölünmeden 25-30 dakikalık kesintisiz bir odaklanma bloğu oluştur.
2. **Alt Başlıkları Kullan:** Büyük görevleri ufak adımlara bölüp araştırma notları yazarak bonus XP kazan.
3. **Öncelik Sıralaması:** Önce 'Yüksek' öncelikli en zor görevi bitirip günün geri kalanını hafiflet.

Bugün üzerinde çalışmak istediğin bir konu varsa yaz, hemen sana özel yapılandırılmış bir görev hazırlayayım!

*(💡 Bilgi: Gemini API kotası geçici olarak dolduğu için şu an Akıllı Çevrimdışı Koç modundayım.)*`;
}

/**
 * Gemini üzerinden kişiselleştirilmiş görev önerileri üretir (Kotada akıllı yedeğe düşer)
 */
export async function generateTaskSuggestions(promptText, userMemory = null) {
  const requestBody = {
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
            priority: { type: "STRING" },
            subtopics: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
          },
          required: ["title", "description", "priority", "subtopics"],
        },
      },
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  try {
    let rawText;
    try {
      rawText = await callGeminiGenerate(requestBody);
    } catch (err) {
      if (
        err.message?.includes("responseSchema") ||
        err.message?.includes("responseMimeType") ||
        err.message?.includes("Schema")
      ) {
        const fallbackBody = {
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        };
        try {
          rawText = await callGeminiGenerate(fallbackBody);
        } catch {
          const plainBody = {
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          };
          rawText = await callGeminiGenerate(plainBody);
        }
      } else {
        throw err;
      }
    }

    const results = parseAndNormalizeSuggestions(rawText, userMemory);
    if (results.length > 0) return results;
  } catch (err) {
    console.warn("Canlı API öneri hatası, akıllı yerel önerilere geçiliyor:", err);
    return generateOfflineSuggestions(userMemory);
  }

  return generateOfflineSuggestions(userMemory);
}

/**
 * Gemini ile sohbet mesajı gönderir (Asistan / Koç)
 */
export async function sendChatMessage(messages, systemInstruction, userMemory = null, playerStats = null) {
  const formattedContents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const requestBody = {
    contents: formattedContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  try {
    return await callGeminiGenerate(requestBody);
  } catch (err) {
    if (
      err.isQuotaExceeded ||
      err.message?.toLowerCase().includes("quota") ||
      err.message?.toLowerCase().includes("limit: 20")
    ) {
      console.warn("Gemini API kotası doldu, Akıllı Çevrimdışı Koç yanıt veriyor...");
      return generateOfflineChatReply(messages, userMemory, playerStats);
    }
    throw err;
  }
}

/**
 * Kullanıcının bir alt başlık için yazdığı araştırma notlarını yapay zeka ile değerlendirir
 */
export async function evaluateResearchNotes(taskTitle, subtopicTitle, userNotes) {
  const prompt = `
Sen TaskManagerAI uygulamasının araştırma ve derinleşme değerlendiricisisin.
Kullanıcı bir görevin alt başlığı üzerinde araştırma yaptı ve öğrendiği bilgileri girdi.

ANA GÖREV: "${taskTitle}"
ARAŞTIRILAN ALT BAŞLIK: "${subtopicTitle}"
KULLANICININ ARAŞTIRMA NOTLARI:
"""
${userNotes}
"""

DEĞERLENDİRME KRİTERLERİ:
1. Notlar bu alt başlıkla ve ana görevle doğrudan ilgili mi?
2. Kullanıcı gerçekten bir araştırma yapmış veya kendi cümleleriyle konuyu kavramış mı? (Sadece 1-2 kelimelik "tamam", "bitti", anlamsız rastgele harfler veya tamamen alakasız yazılar reddedilmelidir.)
3. Onay Durumu:
   - Eğer geçerliyse: "approved": true, "bonusXp": notun doyuruculuğuna göre 15 ile 30 arasında bir tam sayı (Örn: 20 veya 25 veya 30), "feedback": Kullanıcının öğrendiği kavramlara atıfta bulunan, motive edici 1-2 cümlelik samimi Türkçe tebrik mesajı.
   - Eğer yetersizse: "approved": false, "bonusXp": 0, "feedback": Neden onaylanmadığını ve bu başlıkta neleri araştırması gerektiğini belirten nazik 1-2 cümlelik Türkçe yönlendirme.

ÇIKTI FORMATI:
SADECE aşağıdaki geçerli JSON nesnesi formatında yanıt ver:
{
  "approved": true,
  "bonusXp": 25,
  "feedback": "Harika özet! Kavramları ve mimari detayları çok net kavramışsın."
}
`.trim();

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.5,
      maxOutputTokens: 512,
    },
  };

  try {
    const raw = await callGeminiGenerate(requestBody);
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw);

    return {
      approved: Boolean(parsed.approved),
      bonusXp: Number(parsed.bonusXp) || (parsed.approved ? 20 : 0),
      feedback: cleanField(
        parsed.feedback,
        parsed.approved
          ? "Tebrikler! Araştırma notların onaylandı ve bonus XP kazandın."
          : "Notların biraz daha detaylandırılması gerekiyor."
      ),
    };
  } catch (err) {
    console.error("Evaluation error:", err);
    // Güvenli yedek - kullanıcıyı bekletme ve XP kazanmasını sağla
    const isMeaningful = (userNotes || "").trim().length >= 15;
    return {
      approved: isMeaningful,
      bonusXp: isMeaningful ? 25 : 0,
      feedback: isMeaningful
        ? "Araştırma notların başarıyla onaylandı ve hesabına +25 Bonus XP eklendi! Harika derinleşme."
        : "Lütfen bu konu hakkında öğrendiğin en az 1-2 temel bilgiyi not olarak yaz.",
    };
  }
}
