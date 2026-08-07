import { useEffect, useMemo, useRef, useState } from "react";
import { Music4, Image as ImageIcon, Clapperboard, Sparkles } from "lucide-react";
import { api } from "../../api.js";
import PromptHero from "./PromptHero.jsx";
import PromptModes from "./PromptModes.jsx";
import PromptCreator from "./PromptCreator.jsx";
import PromptAssistant from "./PromptAssistant.jsx";
import PromptHistory from "./PromptHistory.jsx";
import "./prompts-premium.css";

const MODE_HINTS = {
  music: ["suno", "music", "музык"],
  image: ["image", "photo", "изображ"],
  video: ["video", "видео"],
  universal: ["other", "general", "общ"],
};

const MODE_META = {
  music: {
    badge: "Музыкальный режим",
    title: "Собери промпт, который звучит как трек",
    description: "От идеи и настроения до структуры, атмосферы и нужного вайба для Suno и музыкальных задач.",
    chips: ["Ночной synthwave трек", "Меланхоличный поп", "Энергичный рэп-хук", "Кинематографичный припев"],
    icon: Music4,
  },
  image: {
    badge: "Визуальный режим",
    title: "Преврати образ в сильную визуальную сцену",
    description: "Подходит для артов, фото-идей, стилизаций и детализированных визуальных запросов.",
    chips: ["Космический портрет", "Премиум превью интерфейса", "Атмосферная постер-сцена", "Неоновый продуктовый кадр"],
    icon: ImageIcon,
  },
  video: {
    badge: "Видео режим",
    title: "Собери клиповую сцену и движение кадра",
    description: "BOTYARA помогает расписать драматургию, монтажный ритм, кадры и динамику для видео.",
    chips: ["Клип 15 секунд", "Кинематографичный переход", "Ночной street-shot", "Атмосферный финальный кадр"],
    icon: Clapperboard,
  },
  universal: {
    badge: "Универсальный режим",
    title: "Собери универсальный AI-промпт под любую задачу",
    description: "Идеально для свободных идей: от промтов для чат-моделей до сложных креативных сценариев.",
    chips: ["Улучшить идею", "Структурировать запрос", "Разложить по шагам", "Сделать сильнее и подробнее"],
    icon: Sparkles,
  },
};

function resolveTopic(topics, mode) {
  const entries = Object.entries(topics || {});
  const hints = MODE_HINTS[mode] || [];

  return (
    entries.find(([key, cfg]) =>
      hints.some((hint) => `${key} ${cfg?.label || ""}`.toLowerCase().includes(hint))
    )?.[0] || entries[0]?.[0] || mode
  );
}

export default function PromptStudioView() {
  const creatorRef = useRef(null);
  const modesRef = useRef(null);
  const [topics, setTopics] = useState({});
  const [mode, setMode] = useState("music");
  const [target, setTarget] = useState("");
  const [draft, setDraft] = useState("");
  const [style, setStyle] = useState("Выразительный");
  const [format, setFormat] = useState("Структурированный");
  const [detail, setDetail] = useState("Высокая");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sessionHistory, setSessionHistory] = useState([]);

  const topic = useMemo(() => resolveTopic(topics, mode), [topics, mode]);
  const targets = topics[topic]?.targets || ["BOTYARA AI"];
  const activeMeta = MODE_META[mode] || MODE_META.music;
  const topicLabel = topics[topic]?.label || activeMeta.badge;

  useEffect(() => {
    Promise.allSettled([api.promptTopics(), api.listFavorites()]).then(([topicResult, favoritesResult]) => {
      if (topicResult.status === "fulfilled") {
        setTopics(topicResult.value || {});
      }
      if (favoritesResult.status === "fulfilled") {
        setFavorites(Array.isArray(favoritesResult.value) ? favoritesResult.value : []);
      }
      setHistoryLoading(false);
    });
  }, []);

  useEffect(() => {
    setTarget(targets[0] || "BOTYARA AI");
  }, [topic, targets]);

  async function createPrompt() {
    if (!draft.trim() || loading) return;
    setLoading(true);
    setError("");
    setSaved(false);

    const preparedDraft = `${draft.trim()}\n\nСтиль: ${style}. Формат: ${format}. Детализация: ${detail}.`;

    try {
      const response = await api.improvePrompt(topic, target, preparedDraft);
      const reply = response?.reply || "";
      setResult(reply);
      setSessionHistory((items) => [
        {
          id: `session-${Date.now()}`,
          title: topics[topic]?.label || activeMeta.badge,
          content: reply,
          mode,
        },
        ...items,
      ]);
    } catch (requestError) {
      setError(requestError?.message || "Не удалось создать промпт. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  async function saveResult() {
    if (!result || saved) return;
    try {
      const created = await api.addFavorite(result, topic);
      setSaved(true);
      setFavorites((items) => [created || { id: `favorite-${Date.now()}`, content: result, category: topic }, ...items]);
    } catch (requestError) {
      setError(requestError?.message || "Не удалось сохранить промпт.");
    }
  }

  const historyItems = [
    ...sessionHistory,
    ...favorites.map((item) => ({
      id: `favorite-${item.id}`,
      title: item.category || "Избранное",
      content: item.content,
      favorite: true,
      mode: item.category,
    })),
  ];

  const copyText = (text) => navigator.clipboard?.writeText(text);

  function scrollTo(ref) {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  function handleQuickInsert(value) {
    setDraft((current) => {
      const next = current.trim();
      return next ? `${next}\n• ${value}` : value;
    });
    scrollTo(creatorRef);
  }

  return (
    <div className="prompt-studio">
      <PromptHero
        meta={activeMeta}
        topicLabel={topicLabel}
        target={target}
        onStart={() => scrollTo(creatorRef)}
        onBrowseModes={() => scrollTo(modesRef)}
      />

      <div ref={modesRef}>
        <PromptModes value={mode} onChange={setMode} />
      </div>

      <div className="prompt-studio__workspace">
        <div className="prompt-studio__main-column">
          <PromptCreator
            creatorRef={creatorRef}
            draft={draft}
            onDraftChange={setDraft}
            target={target}
            targets={targets}
            onTargetChange={setTarget}
            style={style}
            onStyleChange={setStyle}
            format={format}
            onFormatChange={setFormat}
            detail={detail}
            onDetailChange={setDetail}
            loading={loading}
            onSubmit={createPrompt}
            modeMeta={activeMeta}
            onQuickInsert={handleQuickInsert}
          />

          <PromptHistory items={historyItems} loading={historyLoading} onCopy={copyText} />
        </div>

        <PromptAssistant
          result={result}
          error={error}
          loading={loading}
          saved={saved}
          onCopy={() => copyText(result)}
          onSave={saveResult}
          modeMeta={activeMeta}
        />
      </div>
    </div>
  );
}
