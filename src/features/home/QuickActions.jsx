import {
  ArrowUpRight,
  GalleryVerticalEnd,
  ImagePlus,
  MessageCircle,
  Users,
  WandSparkles,
} from "lucide-react";
import { GlassCard, PremiumButton } from "../../components/ui/index.js";

const ACTIONS = [
  {
    id: "prompts",
    title: "Создать",
    description: "Создавай идеи для музыки, изображений и видео",
    action: "Создать",
    icon: WandSparkles,
  },
  {
    id: "chat",
    title: "Обсудить",
    description: "Обсуждай идеи и получай помощь",
    action: "Обсудить",
    icon: MessageCircle,
  },
  {
    id: "rooms",
    title: "Вместе",
    description: "Создавай проекты вместе",
    action: "Присоединиться",
    icon: Users,
  },
  {
    id: "gallery",
    title: "Исследовать",
    description: "Показывай свои работы",
    action: "Смотреть",
    icon: GalleryVerticalEnd,
  },
  {
    id: "cover",
    title: "Создать визуал",
    description: "Создавай визуальный стиль проекта",
    action: "Создать",
    icon: ImagePlus,
  },
];

export default function QuickActions({ onNavigate }) {
  return (
    <section className="premium-home-section" aria-labelledby="premium-home-actions-title">
      <div className="premium-home-section__heading">
        <h2 id="premium-home-actions-title">AI-инструменты</h2>
      </div>
      <div className="premium-home-actions">
        {ACTIONS.map(({ id, title, description, action, icon: Icon }, index) => (
          <GlassCard
            key={id}
            as="article"
            className="premium-home-action"
            padding="none"
            interactive
            style={{ "--home-action-index": index }}
          >
            <span className="premium-home-action__icon">
              <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="premium-home-action__copy">
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
            <PremiumButton
              className="premium-home-action__button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(id)}
              trailingIcon={<ArrowUpRight size={16} strokeWidth={1.5} />}
              aria-label={`${action}: ${title}`}
            >
              {action}
            </PremiumButton>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
