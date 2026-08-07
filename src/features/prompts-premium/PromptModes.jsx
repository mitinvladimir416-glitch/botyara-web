import { ArrowRight, Clapperboard, Image as ImageIcon, Music4, Sparkles } from "lucide-react";

const MODES = [
  {
    id: "music",
    title: "Музыка",
    description: "Треки, вайб, структура, припевы и сценарии для Suno.",
    image: "/prompts/prompt-mode-icons/music.png",
    icon: Music4,
    eyebrow: "Audio tool",
  },
  {
    id: "image",
    title: "Изображение",
    description: "Визуальные сцены, постеры, арты и детальные image-prompts.",
    image: "/prompts/prompt-mode-icons/image.png",
    icon: ImageIcon,
    eyebrow: "Visual tool",
  },
  {
    id: "video",
    title: "Видео",
    description: "Клипы, движения камеры, раскадровка и динамичные сцены.",
    image: "/prompts/prompt-mode-icons/video.png",
    icon: Clapperboard,
    eyebrow: "Motion tool",
  },
  {
    id: "universal",
    title: "Универсальный",
    description: "Свободный AI-режим для любых сложных и креативных задач.",
    image: "/prompts/prompt-mode-icons/universal.png",
    icon: Sparkles,
    eyebrow: "General tool",
  },
];

export default function PromptModes({ value, onChange }) {
  return (
    <section className="prompt-studio-modes" aria-labelledby="prompt-modes-title">
      <div className="prompt-studio-section-heading">
        <h2 id="prompt-modes-title">Инструменты студии</h2>
        <p>Выбери, с каким типом промпта ты хочешь работать прямо сейчас.</p>
      </div>
      <div className="prompt-studio-modes__grid">
        {MODES.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              type="button"
              className={`prompt-mode ${value === mode.id ? "prompt-mode--active" : ""}`}
              onClick={() => onChange(mode.id)}
              aria-pressed={value === mode.id}
              style={{ "--mode-index": index }}
            >
              <img src={mode.image} alt="" />
              <span className="prompt-mode__overlay" aria-hidden="true" />
              <span className="prompt-mode__body">
                <small>{mode.eyebrow}</small>
                <strong><Icon size={18} strokeWidth={1.8} /> {mode.title}</strong>
                <em>{mode.description}</em>
                <span className="prompt-mode__cta">Открыть режим <ArrowRight size={15} /></span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
