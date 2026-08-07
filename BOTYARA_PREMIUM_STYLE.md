# BOTYARA PREMIUM STYLE GUIDE

Единый визуальный язык premium-разделов BOTYARA (Home Premium, Prompt Studio Premium, Chat Premium).
Документ описывает **уже существующую** дизайн-систему проекта, извлечённую из:

- `src/styles/tokens.css`, `reset.css`, `motion.css`, `responsive.css`
- `src/components/ui/*` (`GlassCard`, `PremiumButton`, `Badge`, `Avatar`, `AvatarFrame`, `Modal`, `Toast`, `ui.css`)
- `src/features/home/*`
- `src/features/prompts-premium/*`
- `src/features/chat-premium/*`
- `public/home/*`, `public/prompts/*`

Используй этот документ как источник истины при проектировании новых premium-разделов:
**Gallery Premium, Shop Premium, Profile Premium** и т.д. Цель — чтобы любой новый раздел
выглядел так, будто его сделала та же команда в тот же день, что и Home/Prompt Studio/Chat.

---

## 0. Базовые принципы

1. Тёмная космическая тема (`color-scheme: dark`), никаких light-вариантов.
2. Все значения — только через CSS-переменные `--bt-*` из `src/styles/tokens.css`. Хардкод цветов допустим лишь для точечных акцентных оттенков (см. раздел 1.3) — и то по образцу уже используемых.
3. Каждый новый premium-раздел — это **одна корневая обёртка** (`.gallery-premium`, `.shop-premium`, ...) с фоновым изображением/градиентом, обёрнутая в `<div className="bt-page"><div className="bt-container">...</div></div>` слоем выше (шаблон `HomeView` / `PromptStudioView` / `ChatPremiumView`).
4. Переиспользуй готовые UI-компоненты (`GlassCard`, `PremiumButton`, `Badge`, `Avatar`, `AvatarFrame`, `Modal`, `Toast`) вместо создания новых аналогов кнопок/карточек.
5. Плотность интерфейса — "premium SaaS", не "маркетинговый лендинг": сдержанные градиенты, много воздуха, чёткая иерархия, но не аскетичный минимализм — присутствуют свечения, орбы, ambient-фоны.

---

## 1. Цветовая система

Источник: `src/styles/tokens.css`. Всё определено в `:root`, есть compatibility-алиасы (`--bg-void`, `--violet` и т.д.) для старых экранов — **в новых разделах их не использовать**, писать напрямую через `--bt-*`.

### 1.1 Канвас (фон приложения)

| Токен | Значение | Назначение |
|---|---|---|
| `--bt-color-canvas` | `#050611` | базовый фон приложения |
| `--bt-color-canvas-deep` | `#02030b` | самый тёмный слой (низ градиентов, подложка hero) |
| `--bt-color-canvas-raised` | `#090b1a` | приподнятый канвас (обводки статусов аватара) |
| `--bt-color-canvas-ambient` | `#10132b` | амбиентный слой |
| `--bt-background-cosmic` | составной `radial-gradient` × 2 + `linear-gradient` | "космический" фон целой страницы — фиолетовые пятна на очень тёмном градиенте |

### 1.2 Стеклянные поверхности (glass surfaces)

| Токен | Значение | Назначение |
|---|---|---|
| `--bt-color-surface-1` | `rgb(14 16 34 / 0.78)` | базовая карточка |
| `--bt-color-surface-2` | `rgb(20 22 45 / 0.86)` | приподнятая карточка (`--elevated`) |
| `--bt-color-surface-3` | `rgb(28 29 57 / 0.92)` | вложенные элементы (бейджи, secondary-кнопки) |
| `--bt-color-surface-solid` | `#111329` | непрозрачные поверхности (модалки, тосты, select) |
| `--bt-color-surface-hover` | `rgb(34 32 67 / 0.94)` | hover-состояние поверхности |
| `--bt-color-overlay` | `rgb(2 3 11 / 0.76)` | подложка модальных окон |
| `--bt-color-highlight` | `rgb(255 255 255 / 0.08)` | лёгкая подсветка сверху |
| `--bt-color-border` | `rgb(208 202 255 / 0.1)` | базовая тонкая рамка (лиловый оттенок, не серый!) |
| `--bt-color-border-strong` | `rgb(218 210 255 / 0.2)` | акцентная/hover рамка |

**Важно**: рамки в BOTYARA всегда чуть лиловые (`rgb(208 202 255 / …)`), не нейтрально-серые — это часть узнаваемости стиля.

### 1.3 Бренд и семантика

| Токен | Значение | Назначение |
|---|---|---|
| `--bt-color-accent` | `#8f5cf6` | основной фиолетовый бренда |
| `--bt-color-accent-hover` | `#a778ff` | hover/светлее |
| `--bt-color-accent-active` | `#7948df` | active/темнее |
| `--bt-color-accent-soft` | `rgb(143 92 246 / 0.15)` | заливка плашек/иконок на тёмном фоне |
| `--bt-color-accent-border` | `rgb(167 120 255 / 0.46)` | акцентная обводка (hover карточек, фокус) |
| `--bt-color-success` | `#48c9a0` | успех |
| `--bt-color-warning` | `#f3ae62` | предупреждение |
| `--bt-color-danger` | `#ef6685` | ошибка/опасность |
| `--bt-color-info` | `#74a7ed` | информация |

Дополнительные "ручные" акцентные оттенки текста, которые повторяются по всему коду (не токенизированы, но являются частью языка стиля — используй именно эти значения для консистентности):
`#c9affd`, `#d8c4ff`, `#dfd2ff`, `#dccdff`, `#cbb2ff`, `#bda0f4`, `#eadfff` — светло-лиловые оттенки для иконок/лейблов/kicker-текста на фиолетовой подложке.

### 1.4 Текст

| Токен | Значение | Назначение |
|---|---|---|
| `--bt-color-text-primary` | `#f4f2fb` | основной текст (почти белый, тёплый) |
| `--bt-color-text-secondary` | `#b7b4ca` | вторичный текст, описания |
| `--bt-color-text-muted` | `#817e98` | подписи, метаданные, timestamps |
| `--bt-color-text-disabled` | `#5f5c72` | неактивный текст |
| `--bt-color-text-on-accent` | `#ffffff` | текст на фиолетовой заливке |

**Правило**: заголовки — `text-primary`, подписи под ними — `text-secondary`, мелкие метаданные (даты, счётчики) — `text-muted`. Никогда не используй чистый `#fff`/`#000` напрямую, кроме `text-on-accent`.

---

## 2. Шрифты и размеры

### 2.1 Семейства

```css
--bt-font-body: "Manrope", system-ui, sans-serif;
--bt-font-display: "Unbounded", "Manrope", system-ui, sans-serif;
--bt-font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

- **Manrope** — весь основной текст, UI, кнопки, параграфы.
- **Unbounded** — только заголовки `h1`/`h2` в hero-блоках и крупные секционные заголовки (`font-family: var(--bt-font-display)`). Даёт узнаваемый "геометричный" premium-акцент.
- Mono — не используется в premium-разделах (зарезервирован).

### 2.2 Шкала размеров

```css
--bt-font-size-2xs: 0.6875rem;  /* мета-текст, аплкейс-лейблы */
--bt-font-size-xs:  0.75rem;    /* подписи, бейджи, кнопки sm */
--bt-font-size-sm:  0.875rem;   /* вторичный текст, тело сообщений */
--bt-font-size-md:  1rem;       /* базовый текст, кнопки md */
--bt-font-size-lg:  1.125rem;   /* подзаголовки карточек */
--bt-font-size-xl:  1.375rem;   /* заголовки секций (h2) */
--bt-font-size-2xl: clamp(1.625rem, 1.35rem + 1vw, 2.125rem);
--bt-font-size-display: clamp(2rem, 1.55rem + 2vw, 3.25rem); /* hero h1 (базовый токен) */
```

Реальные hero-заголовки часто задают собственный `clamp()` крупнее токена (напр. `clamp(2.9rem, 5.4vw, 5.25rem)` в Prompt Studio, `clamp(2.35rem, 4.1vw, 4.25rem)` в Home) — это нормально для hero, но **вне hero используй только шкалу токенов**.

### 2.3 Line-height / letter-spacing / вес

```css
--bt-line-tight: 1.08;      /* hero h1 */
--bt-line-heading: 1.2;     /* h2/h3, модалки */
--bt-line-body: 1.55;       /* параграфы */
--bt-letter-tight: -0.025em; /* заголовки display */
--bt-letter-ui: -0.01em;     /* UI-текст по умолчанию */
--bt-letter-label: 0.04em;   /* uppercase-лейблы */
```

- Hero `h1`: `font-weight: 720–760`, `letter-spacing: -0.055…-0.06em`, `line-height: ~0.97–1.06` — плотный, "сжатый" крупный заголовок.
- Секционные `h2`: `font-weight: 680`, `letter-spacing: var(--bt-letter-tight)`.
- Kicker/eyebrow-лейблы (`.prompt-studio-hero__eyebrow`, `.chat-premium-panel__kicker`): `font-size: 2xs/xs`, `font-weight: 800`, `letter-spacing: 0.05–0.06em`, `text-transform: uppercase`.
- Обычный текст в карточках: `font-weight: 590–700` для акцентных `strong`, обычный для `p`.

---

## 3. Glassmorphism стиль

Стекло в BOTYARA — это **не** `backdrop-filter: blur()` на каждой карточке (дорого при большом количестве карточек). Основной приём — **полупрозрачный тёмный фон + тонкая лиловая обводка через `box-shadow` + мягкая внутренняя подсветка**. `backdrop-filter` применяется точечно (модалки, sticky-плашки поверх изображений).

### 3.1 Базовая "стеклянная" карточка (`bt-glass-card`, `GlassCard.jsx`)

```css
.bt-glass-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: var(--bt-radius-lg);
  background: var(--bt-color-surface-1);
  box-shadow:
    var(--bt-shadow-inset),                 /* верхний блик 1px */
    0 0 0 1px var(--bt-color-border),        /* "рамка" через shadow, не border */
    var(--bt-shadow-sm);
}
.bt-glass-card::before {
  content: "";
  position: absolute; inset: 0; z-index: -1;
  background: radial-gradient(circle at 16% 0%, rgb(255 255 255 / 0.065), transparent 42%);
}
```

Варианты тона: `--default` (surface-1), `--elevated` (surface-2 + shadow-md), `--accent` (фиолетовый градиент + accent-border + shadow-accent).
Паддинги: `--padding-none|sm|md|lg` → `0 / space-4 / space-6 / space-8`.
`--interactive` добавляет hover: `translate3d(0,-2px,0)` + усиление тени до `shadow-md`.

**Правило рамки**: обводка карточки почти всегда задаётся не через `border`, а через `box-shadow: 0 0 0 1px var(--bt-color-border)` — это позволяет комбинировать её с `--bt-shadow-inset` и внешней тенью в одном свойстве без наложения border-box. Придерживайся этого приёма в новых разделах.

### 3.2 Панели поверх фонового изображения

Крупные секции (`.prompt-creator`, `.prompt-assistant`, `.chat-premium-panel`) на фоне hero-картинки используют более тёмный полупрозрачный фон без blur:

```css
background: rgb(7 8 22 / 0.76);
box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.055), var(--bt-shadow-md);
border: 1px solid var(--bt-color-border);
```

### 3.3 Настоящий blur — только для плавающих поверх контента элементов

- `.bt-modal-layer` — `backdrop-filter: blur(12px) saturate(110%)` (с `@supports` фолбэком и `prefers-reduced-transparency` отключением).
- `.prompt-studio-hero__core-status` — статус-плашка поверх AI-орба: `backdrop-filter: blur(16px)`.

Правило: **blur используй только когда элемент реально плавает поверх насыщенного визуального контента** (фото, орб, модалка), не на плоском фоне канваса — иначе это просто лишняя стоимость рендера.

### 3.4 Root-переменные стекла

```css
--bt-glass-blur: 18px;
--bt-glass-saturation: 125%;
```
Заданы централизованно и переопределяются в `@media (prefers-reduced-transparency: reduce)` (blur → 0, saturation → 100%, поверхности становятся полностью непрозрачными). Любой новый glass-элемент должен корректно деградировать при этом медиа-запросе — проверяй, что твой компонент не завязан жёстко на прозрачность.

---

## 4. Свечение и эффекты

Свечение (glow) — ключевая часть "premium AI" ощущения. Три основных паттерна:

### 4.1 Ambient-пятна фона секции (page-level glow)

Большие радиальные градиенты, `position: absolute`, `blur(30–40px)`, низкая opacity, `pointer-events: none`, приклеены к `::before`/`::after` корневой обёртки раздела:

```css
.prompt-studio::before {
  width: 28rem; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle, rgb(125 87 233 / 0.34), transparent 66%);
  opacity: 0.7; filter: blur(40px);
}
```
Обычно одно фиолетовое пятно (accent) сверху/справа и одно более холодное синеватое снизу/слева — создаёт ощущение "света из угла", а не равномерной подсветки.

### 4.2 Акцентное свечение вокруг ключевого объекта (hero-объект / AI-орб)

Используется на "живом" AI-объекте (шар/ядро на Home и Prompt Studio):

```css
box-shadow:
  inset 0 1px 0 rgb(255 255 255 / 0.38),   /* блик сверху */
  0 0 28px rgb(143 92 246 / 0.35);          /* внешнее свечение */
```
Для "точки-сигнала" (индикатор онлайн/статуса в Chat Premium):
```css
box-shadow: 0 0 0 0.6rem rgb(155 124 255 / 0.12), 0 0 2rem rgb(155 124 255 / 0.65);
```
Двойная тень: узкое плотное "гало" рядом + широкое размытое свечение — стандартный рецепт для любого светящегося маркера/точки в новых разделах.

### 4.3 XP / progress-бары со свечением

```css
.premium-home-xp span {
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.3), 0 0 1rem rgb(143 92 246 / 0.16);
}
```
Заполненная часть прогресс-бара всегда получает лёгкое фиолетовое свечение + верхний блик — не плоская заливка.

### 4.4 `--bt-shadow-accent` — переиспользуемый токен свечения

```css
--bt-shadow-accent: 0 12px 32px rgb(112 66 215 / 0.24);
```
Используется на primary-кнопках (`bt-button--primary`) и accent-карточках — фиолетовая "приподнятая" тень вместо чёрной, это и есть базовое ощущение "premium glow" на интерактивных элементах.

**Правило**: свечение всегда цветное (фиолетовое/лиловое `rgb(143 92 246 / …)` или `rgb(155 124 255 / …)`), никогда нейтрально-белое blur без цвета — это отличает glow BOTYARA от generic neumorphism.

---

## 5. Карточки

### 5.1 Базовая единица — `bt-glass-card` (см. раздел 3.1)

Используй `<GlassCard tone="default|elevated|accent" padding="none|sm|md|lg" interactive>` для любых карточек в новых разделах, если не требуется специфичная кастомная карточка с картинкой/фоном.

### 5.2 Кастомные "богатые" карточки на фичах (паттерн из home/prompts)

Когда карточка сложнее (с иконкой, картинкой-бэкграундом, hover-подсветкой) — она собирается вручную по этому рецепту:

```css
.premium-home-action {
  border-radius: var(--bt-radius-lg);
  padding: var(--bt-space-5);
  background: linear-gradient(145deg, rgb(255 255 255 / 0.035), transparent 42%), var(--bt-color-surface-1);
  box-shadow: var(--bt-shadow-inset), 0 0 0 1px var(--bt-color-border), var(--bt-shadow-sm);
  transition: background-color .., box-shadow .., transform ..;
}
.premium-home-action:hover {
  transform: translate3d(0, -3px, 0);
  background: linear-gradient(145deg, rgb(143 92 246 / 0.1), transparent 46%), var(--bt-color-surface-2);
  box-shadow: var(--bt-shadow-inset), 0 0 0 1px var(--bt-color-accent-border), var(--bt-shadow-md);
}
.premium-home-action:active { transform: translate3d(0, -1px, 0) scale(0.988); }
```

**Формула карточки-экшена**: тонкий диагональный блик-градиент сверху-слева поверх surface + рамка через shadow + hover поднимает карточку на 2–4px и подсвечивает рамку в accent-border + затемняет/усиливает фон.

### 5.3 Карточки-медиа (изображение как фон, например режимы промптов)

```css
.prompt-mode { border-radius: ~1.25rem; overflow: hidden; background: rgb(8 9 24 / 0.72); }
.prompt-mode img { position: absolute; inset: 0; object-fit: cover; opacity: .92; transition: transform 520ms; }
.prompt-mode__overlay { background: linear-gradient(180deg, rgb(4 5 15 / .06), rgb(4 5 16 / .76) 56%, rgb(4 5 17 / .96)); }
.prompt-mode:hover img { transform: scale(1.04); opacity: 1; }
.prompt-mode:hover { border-color: var(--bt-color-accent-border); transform: translate3d(0,-4px,0); }
```
Рецепт: полноразмерное фото → тёмный градиент-overlay снизу (для читаемого текста) → текст в `__body`, прижатый к низу (`justify-content: flex-end`) → hover слегка увеличивает фото (`scale(1.04)`) и поднимает карточку.

Это — правильный паттерн для будущей **Gallery Premium** (карточки арт-генераций) и карточек товаров в **Shop Premium**.

### 5.4 Список-карточка (row-item, напр. активность/история)

```css
display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--bt-space-4);
padding: var(--bt-space-3) var(--bt-space-5);
border-top: 1px solid var(--bt-color-border); /* между строками, не у первой */
```
Иконка слева в квадрате `--bt-radius-md` c `--bt-color-accent-soft` фоном + `#c9affd` цветом, заголовок/описание по центру, стрелка/действие справа, стрелка сдвигается на hover (`translate3d(2px, 0, 0)`).

### 5.5 Радиусы карточек

| Токен | rem | Где |
|---|---|---|
| `--bt-radius-md` | 0.75rem | иконки-плашки, инпуты |
| `--bt-radius-lg` | 1rem | стандартная карточка |
| `--bt-radius-xl` | 1.375rem | крупные панели, hero, модалки |
| корневые premium-обёртки | `calc(var(--bt-radius-xl) + 0.25rem)` | сам `.prompt-studio` / `.chat-premium` контейнер |

---

## 6. Кнопки

Компонент: `PremiumButton.jsx` → класс `bt-button`.

### 6.1 Базовая механика

```css
.bt-button {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--bt-space-2);
  border: 0; border-radius: var(--bt-radius-md);
  font-weight: 700; letter-spacing: var(--bt-letter-ui);
  box-shadow: var(--bt-shadow-inset);
  transition: color, background-color, border-color (fast), box-shadow/transform (base, emphasized-ease);
}
.bt-button:hover:not(:disabled) { transform: translate3d(0, -1px, 0); }
.bt-button:active:not(:disabled) { transform: scale(0.98); }
.bt-button:disabled { cursor: not-allowed; opacity: 0.48; }
```

### 6.2 Варианты (`variant` prop)

| Вариант | Фон | Особенность |
|---|---|---|
| `primary` | `--bt-color-accent`, hover `-hover`, active `-active` | + `--bt-shadow-accent` (глоу) |
| `secondary` | `--bt-color-surface-3` | рамка через shadow `--bt-color-border`, на hover → `-strong` |
| `ghost` | прозрачный | текст `secondary`, hover-фон `--bt-color-accent-soft` |
| `danger` | `rgb(239 102 133 / .15)` | текст `#ffc3d0` |

### 6.3 Размеры (`size` prop)

| Размер | min-height | padding-inline | font-size |
|---|---|---|---|
| `sm` | `--bt-control-height-sm` (2.25rem) | space-4 | xs |
| `md` (default) | `--bt-control-height-md` (2.75rem) | space-5 | md |
| `lg` | `--bt-control-height-lg` (3.25rem) | space-6 | md |

### 6.4 Дополнительные слоты

- `leadingIcon` / `loading` (спиннер вместо иконки, `aria-busy`).
- `trailingIcon` — рендерится в кружке `bt-button__trailing` (1.75rem, `rgb(255 255 255 / .1)`), при hover кнопки сдвигается `translate3d(2px, -1px, 0) scale(1.04)` — паттерн "стрелка оживает при hover".

### 6.5 Кастомные CTA-кнопки в hero

Иногда primary-кнопка в hero получает собственный градиент вместо плоского accent:
```css
.premium-home-hero__cta {
  background: linear-gradient(110deg, var(--bt-color-accent-hover), var(--bt-color-accent-active));
}
```
Допустимо для одной "звёздной" CTA на странице (hero), но не для рядовых кнопок — там всегда `bt-button--primary` как есть.

**Правило**: никогда не пиши новый button-компонент/класс с нуля — расширяй `PremiumButton` через `className` при необходимости точечных исключений.

---

## 7. Анимации

Источник: `src/styles/motion.css` + локальные keyframes в каждой фиче.

### 7.1 Тайминги и easing (токены)

```css
--bt-duration-instant: 100ms;
--bt-duration-fast:    180ms;  /* цвет/фон/бордер hover */
--bt-duration-base:    280ms;  /* transform/box-shadow */
--bt-duration-slow:    520ms;  /* модалки, тосты */
--bt-duration-enter:   720ms;  /* появление крупных блоков */

--bt-ease-standard:    cubic-bezier(0.2, 0.8, 0.2, 1);
--bt-ease-emphasized:  cubic-bezier(0.16, 1, 0.3, 1);
--bt-ease-exit:        cubic-bezier(0.4, 0, 1, 1);
```
Правило выбора easing: цвета/фон/бордер — `standard` + `fast`; трансформации/тени (то, что должно чувствоваться "пружинисто") — `emphasized` + `base`/`slow`.

### 7.2 Общие keyframes (`.bt-motion-*`, переиспользуемые)

- `bt-ui-enter` — fade + `translate3d(0, 0.75rem, 0) scale(0.985)` → `0,0,0 / scale(1)`. Базовая "появление снизу" анимация для UI-компонентов (модалка использует `bt-duration-slow`).
- `bt-ui-overlay-enter` — просто fade, для подложки модалки.
- `bt-ui-toast-enter` — влёт сбоку + fade + scale, для тостов.
- `bt-ui-spin` — `rotate(1turn)`, спиннер кнопки (`700ms steps(12) infinite` — "тикающий", не гладкий spin).

### 7.3 Локальный паттерн входа секций (каждая фича переопределяет под себя)

Пример `Home`:
```css
.premium-home-hero { opacity: 0; transform: translate3d(0, 1rem, 0); animation: premium-home-enter var(--bt-duration-enter) var(--bt-ease-emphasized) forwards; }
@keyframes premium-home-enter { to { opacity: 1; transform: translate3d(0,0,0); } }
```
Каскадная задержка через CSS-переменную с индексом (для сеток карточек):
```css
animation: premium-home-enter var(--bt-duration-slow) calc(180ms + var(--home-action-index) * 55ms) var(--bt-ease-emphasized) forwards;
```
`--home-action-index` / `--mode-index` задаются инлайново в JSX (`style={{ '--home-action-index': i }}`) — это стандартный способ сделать stagger-анимацию сетки карточек без отдельного класса на каждый элемент.

### 7.4 Skeleton / loading pulse

```css
@keyframes premium-home-loading { 50% { opacity: 0.48; transform: scale(0.995); } }
/* или */
@keyframes chat-premium-pulse { 50% { opacity: 0.45; } }
```
Плейсхолдеры — плоские блоки `rgb(255 255 255 / 0.025–0.035)` с этой пульсацией, `1.4–1.5s infinite`.

### 7.5 XP-бар / прогресс

```css
transform: scaleX(0); transform-origin: left;
animation: premium-home-xp-fill 900ms 420ms var(--bt-ease-emphasized) forwards;
```
Прогресс всегда "доезжает" анимированно после появления карточки (задержка ~400ms после входа родителя), не мгновенно.

### 7.6 `prefers-reduced-motion`

Обязательно для **каждого** нового раздела — глобально через `motion.css` (`--bt-duration-*` схлопываются до `1ms`), но локальные keyframes-анимации (opacity/transform enter-эффекты) дополнительно нужно отключать явно:
```css
@media (prefers-reduced-motion: reduce) {
  .my-section-hero, .my-section-card {
    opacity: 1; transform: none; animation: none;
  }
}
```
Это повторяется в конце каждого фичевого CSS-файла — обязательный блок для новых страниц.

---

## 8. Правила создания новых страниц

Чек-лист при создании **Gallery Premium / Shop Premium / Profile Premium** и любого нового premium-раздела:

### 8.1 Структура файлов

```
src/features/<name>-premium/
  <Name>PremiumView.jsx   ← корневой компонент раздела (аналог HomeView/PromptStudioView/ChatPremiumView)
  <name>-premium.css      ← один CSS-файл на раздел, БЭМ-подобные классы с префиксом раздела
  <SubComponent>.jsx      ← дочерние секции (по образцу HomeHero/QuickActions/PromptModes)
public/<name>/
  <name>-background.png   ← фоновое изображение раздела (webp/png, оптимизировано)
  ...
```

### 8.2 Именование классов

Префикс = имя раздела в kebab-case, без общего `bt-` (тот префикс зарезервирован за `src/components/ui`):
`gallery-premium`, `gallery-premium-hero`, `gallery-premium-grid`, `gallery-card` и т.д. — по образцу `premium-home-*`, `prompt-studio-*`, `chat-premium-*`.

### 8.3 Обязательный skeleton корневой обёртки

```css
.<name>-premium {
  position: relative;
  width: min(100%, var(--bt-content-max));
  margin-inline: auto;
  overflow: hidden;
  border: 1px solid var(--bt-color-border);
  border-radius: calc(var(--bt-radius-xl) + 0.25rem);
  padding: clamp(var(--bt-space-5), 2.6vw, var(--bt-space-10));
  background:
    linear-gradient(180deg, rgb(5 6 17 / 0.86), rgb(3 4 13 / 0.97)),
    url("/<name>/<name>-background.png");
  background-position: center top;
  background-size: cover;
  color: var(--bt-color-text-primary);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05), 0 30px 80px rgb(1 2 14 / 0.3);
}
```
+ одно-два `::before/::after` ambient-пятна (раздел 4.1).
+ учитывай нижний фиксированный таб-бар на мобильном: `padding-bottom: calc(8rem + env(safe-area-inset-bottom))` и аналогичный `scroll-padding-bottom`, а на `.bt-app-shell--mobile` — через `var(--bt-shell-mobile-nav-height)` (см. `chat-premium.css`, финальные итерации).

### 8.4 Hero-блок

- `h1` через `var(--bt-font-display)`, `clamp()`, `letter-spacing: -0.055…-0.06em`, `line-height: ~1`.
- Eyebrow/kicker-плашка над заголовком: pill, uppercase, `--bt-color-accent-soft` фон.
- Параграф-описание: `text-secondary`, ограничен по ширине (`max-width: NNch`), не на всю ширину контейнера.
- Все элементы hero входят через `premium-*-enter`/`prompt-studio-enter`-паттерн (opacity+translate, `bt-ease-emphasized`).

### 8.5 Контент

- Карточки — только через `GlassCard` или кастомный паттерн из раздела 5.2/5.3, не изобретай новую тень/радиус с нуля.
- Кнопки — только `PremiumButton`.
- Бейджи/статусы — `Badge`.
- Аватары — `Avatar`/`AvatarFrame`.
- Модалки/тосты — `Modal`/`Toast`.
- Секционные заголовки: `h2` через `--bt-font-display`, `xl`, вспомогательный `<p>` под ним `text-muted`, `xs`.

### 8.6 Адаптивность (обязательные брейкпоинты, см. `responsive.css`)

| Брейкпоинт | Назначение |
|---|---|
| `max-width: 75–72rem` | планшет: 4-кол → 2-кол сетки, layout с сайдбаром схлопывается в 1 колонку |
| `max-width: 47.999rem` (мобильный) | `.bt-mobile-only`/`.bt-desktop-only` переключаются здесь; hero становится `flex-direction: column`; отступы контейнера уменьшаются |
| `max-width: 23–25rem` | самые маленькие экраны: сетки → 1 колонка |

Каждая сетка карточек должна иметь путь `repeat(N, 1fr)` → `repeat(2, 1fr)` → `1fr` при сужении.

### 8.7 Доступность и производительность

- Каждый интерактивный элемент — реальный `<button>`/`<a>`, фокус — `outline: 2px solid var(--bt-color-accent-hover); outline-offset: 3px` (уже глобально в `reset.css` через `:focus-visible`, не переопределять без необходимости).
- Обязательный блок `@media (prefers-reduced-motion: reduce)` в конце файла раздела (раздел 7.6).
- Обязательный учёт `@media (prefers-reduced-transparency: reduce)` если используется `backdrop-filter`.
- Не использовать `backdrop-filter` на элементах, которых на экране может быть много одновременно (списки, сетки карточек) — только на одиночных плавающих поверхностях (модалки, sticky-статус-плашки).

### 8.8 Не делать

- Не вводить новые оттенки серого/чёрного для рамок — только `--bt-color-border[-strong]` (лиловый оттенок).
- Не использовать чистые прямоугольные углы — минимальный радиус в системе `--bt-radius-xs` (0.5rem).
- Не делать glow белым/бесцветным — всегда `rgb(143 92 246 / …)` / `rgb(155 124 255 / …)` или близкие лиловые.
- Не писать новые CSS custom properties дублирующие уже существующие токены (проверяй `tokens.css` перед тем как ввести своё значение отступа/радиуса/тени).
- Не создавать новый button/card/badge компонент — расширять существующие из `src/components/ui`.
