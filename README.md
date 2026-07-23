# ui-design-vibe-concepts

Vibe-code screen concepts on the `@universe-forma/ui-pes` design system for **pdfguru**, **tbp**, and **pdfleader** — preview them in a gallery and hand off integration-ready code. Full guide below (Ukrainian).

The workflow is driven by the **`/vibe-concept`** skill, checked into this repo at `.claude/skills/vibe-concept/` — Claude Code loads it automatically when you work here, nothing to install. It turns a Figma node (or screenshot) + a prompt into a concept that passes the quality gates and an automated **fidelity** check (`npm run fidelity <product> <slug>`) that measures the rendered screen against a `design.json` contract (all frames · scenarios · regions) and reports each mismatch. Brand webfonts are self-hosted and generated from the brand tokens, so the sandbox renders the real typeface.

---

# Vibe Concepts — інструкція (для дизайнерів і продактів)

Цей репозиторій дозволяє «навайбкодити» екран чи сторінку для наших продуктів — **PDF Guru**, **TheBestPDF**, **PDFLeader** — на основі нашої дизайн-системи `@universe-forma/ui-pes`.

Ти даєш Claude посилання на Figma (або скріншот) + опис, обираєш продукт — і отримуєш готовий екран, який можна одразу подивитися в браузері. Код чистий, типізований, з мок-даними — інженер вставляє його в реальний продукт без переписування.

> Це **не** заміна розробки. На виході — концепт, готовий до інтеграції, а не змерджений продакшн-код.

---

## Що тобі знадобиться

1. **Node.js 20+** — перевір: `node -v`. Якщо немає — постав з [nodejs.org](https://nodejs.org) або через `nvm`.
2. **Доступ до нашого npm-реєстру** (GitHub Packages, `@universe-forma`). Якщо ти вже колись ставив наші фронтенд-проєкти (pdfguru-fe тощо) — доступ уже налаштований у твоєму глобальному `~/.npmrc`. Якщо ні — попроси в команди токен GitHub з правами `read:packages`. Цей репозиторій у своєму `.npmrc` лише вказує реєстр, токен у ньому не зберігається.
3. **Claude Code** — встановлений і залогінений.
4. **Git**.
5. **Google Chrome** — потрібен для перевірки відповідності макету (`npm run fidelity`): вона рендерить концепт у справжньому браузері й робить скріншоти. Якщо Chrome немає — інша частина роботи (галерея, `npm run gate`) працює без нього.

---

## Крок 1. Клонувати й встановити

```bash
git clone https://github.com/universe-forma/ui-design-vibe-concepts
cd ui-design-vibe-concepts
npm install
```

Якщо `npm install` лається на авторизацію `@universe-forma` — значить немає токена в `~/.npmrc`. Напиши в команду.

---

## Крок 2. Запустити пісочницю

```bash
npm run dev
```

Відкриється браузер із **галереєю** концептів (`http://localhost:5173`). Кожен концепт відкривається на весь екран за адресою `/c/<продукт>/<назва>`.

Залиш це вікно відкритим — воно саме оновлюється, коли Claude створює або змінює концепт.

---

## Крок 3. Створити концепт

У новому терміналі в цій же папці запусти Claude:

```bash
claude
```

Далі опиши, що хочеш. Формула проста:

> **«Зроби [який екран] для [продукт] за оцим Figma: [посилання]»**

> **Команда `/vibe-concept` (навичка).** Під капотом усе робить навичка (skill), яка живе **прямо в репозиторії** — `.claude/skills/vibe-concept/`. Її **не треба встановлювати**: Claude підхоплює її автоматично, коли ти працюєш у цій папці (тому вона активна лише тут, а не глобально). Можеш просто описати задачу словами — Claude сам увімкне навичку — **або** викликати її явно слешем:
>
> ```
> /vibe-concept зроби екран стиснення PDF для pdfguru за Figma: <посилання> — slug compress-modal
> ```
>
> Навичка задає весь конвеєр: розбір референсу → підбір компонентів `ui-pes` → генерація концепту → перевірки якості → **перевірка відповідності макету (fidelity)** → розмітка аналітики. Кроки й правила описані у `SKILL.md` та `references/` тієї ж папки — вони в git, тож у всіх однакові.

Приклади:
- `Зроби екран порожнього списку документів для pdfguru за оцим Figma: https://www.figma.com/design/...node-id=123-456`
- `Побудуй сторінку налаштувань підписки для tbp, ось скріншот` (перетягни картинку у вікно Claude)
- `Зроби картку результату стиснення PDF для pdfleader за макетом: <посилання>`

Що важливо вказати:
1. **Що за екран** — коротко опиши суть.
2. **Продукт** — `pdfguru`, `tbp` або `pdfleader` (від цього залежить брендинг і як лягає код). Якщо не вкажеш — Claude перепитає.
3. **Референс** — посилання на конкретний вузол (node) у Figma **або** скріншот. Посилання точніше: Claude витягне реальні відступи, кольори, тексти через Figma MCP. Якщо Figma недоступна — просто дай скріншот.

Claude сам:
- прочитає референс і розкладе його на блоки;
- підбере **реальні** компоненти з `ui-pes` (не вигадає свої);
- згенерує концепт у `src/concepts/<продукт>/<назва>/` (за потреби розкладе екран на `components/`, `lib/`, `hooks/` замість одного велетенського файлу);
- прожене перевірки якості;
- звірить результат із макетом автоматично — перевірка **fidelity** рендерить концепт і порівнює ширину, шрифти, розміри тексту, кольори й бейджі з референсом, називаючи кожне відхилення (детальніше — Крок 5);
- покаже результат у галереї.

> **Figma:** першого разу Claude попросить під'єднати Figma. Набери `/mcp`, обери **claude.ai Figma** і авторизуйся в браузері — це разова дія. Без цього просто дай скріншот.

---

## Крок 4. Подивитися й поітерувати

Онови галерею (або перейди на `/c/<продукт>/<назва>`) — екран уже там, у кольорах обраного продукту.

Щось не так? Просто скажи Claude людською мовою:
- `Зроби заголовок більшим і додай підзаголовок`
- `Кнопка має бути вторинною, не основною`
- `Додай стан завантаження`
- `Це має виглядати ближче до макета — відступи завеликі`

Claude переробить концепт і збереже; галерея оновиться сама.

---

## Крок 5. Перевірка якості

Claude автоматично проганяє перевірки, але можеш і сам:

```bash
npm run gate            # перевірити всі концепти
npm run gate <назва>    # перевірити один
```

Перевірки стежать, щоб код був чистий: жодних «захардкоджених» кольорів чи розмірів, лише токени дизайн-системи, опрацьовані стани елементів. Якщо щось червоне — попроси Claude полагодити.

### Перевірка відповідності макету (fidelity)

Окрема перевірка звіряє **як концепт справді виглядає** з референсом — не «на око», а числами:

```bash
npm run fidelity <продукт> <назва>   # напр. npm run fidelity pdfguru compress-modal
```

Вона відкриває концепт на ізольованому роуті `/preview/<продукт>/<назва>` (без шапки й галереї, щоб ніщо не заважало), чекає завантаження шрифтів, робить скріншоти кожного стану (scenario) × кожного фрейму (десктоп/мобільний) у `.fidelity/` і звіряє кожен регіон із файлом `design.json` — ширину, шрифт, розмір і насиченість тексту, радіус, регістр бейджа, навіть напрямок розкладки (`flex-direction` — стек vs горизонталь). Якщо щось не збігається, вона **називає конкретний елемент** (`title.fontSize: design=28 built=16`), а не просто «схоже/несхоже». Claude ганяє її й лагодить відхилення сам, поки не стане зелено.

> `design.json` — це «еталон» концепту: усі фрейми (десктоп/мобільний), стани (scenarios) і регіони зі значеннями, знятими з макета Figma. Claude створює його під час генерації й позначає елементи в коді атрибутом `data-ff="…"`. Стани концепту задаються як named-export у `mock.ts` — дивишся будь-який через `?scenario=<назва>`. Концепт без `design.json` перевіряється лише скріншотом.

---

## Крок 6. Віддати код інженеру

У кожному концепті є файл **`INTEGRATION.md`** — це інструкція для розробника: куди покласти файл у реальному продукті, як зареєструвати роут, як під'єднати справжні дані замість мок-даних, які ключі i18n завести.

Концепт живе в `src/concepts/<продукт>/<назва>/` — папка продукту (`pdfguru`/`tbp`/`pdfleader`) визначає бренд. Структура кожного концепту (див. `src/concepts/_template/` як скелет, і `pdfguru/documents-empty/`, `pdfleader/document-detail/` як приклади):

| Файл | Що це |
|---|---|
| `Screen.tsx` | сам екран — чистий компонент, лише пропси на вхід (композиційний корінь, якщо екран розкладено на частини) |
| `types.ts` | типи пропсів — це і є «шов» для інтеграції |
| `mock.ts` | тестові дані для перегляду в пісочниці |
| `meta.ts` | лише назва (`{ title }`) — бренд береться з папки продукту |
| `design.json` | контракт відповідності: фрейми · стани (scenarios) · регіони з еталонними значеннями з макета для `npm run fidelity`; елементи позначені `data-ff="…"` |
| `mock.ts` (scenarios) | стани екрана як named-export (`empty`, `loading`, …) поверх базового — переглядаються через `?scenario=<назва>` |
| `INTEGRATION.md` | інструкція для інженера |

Для нетривіальних екранів Claude додатково розкладає `Screen.tsx` на `components/` (окремі під-компоненти), `lib/` (чисті хелпери) і/або `hooks/` (view-логіка) — замість одного величезного файлу. Усі `.tsx`-файли концепту проходять перевірки якості.

Інженеру достатньо: скопіювати компонент(и), підставити реальні дані в ті самі пропси, видалити `mock.ts`.

---

## Multipage concepts & analytics tagging

Some concepts are more than one screen — a funnel or a wizard. Those live under `src/concepts/<product>/<slug>/` with a `flow.ts` (the page order) plus `pages/<page>/{Screen.tsx,types.ts,mock.ts}` instead of a single flat `Screen.tsx`. The gallery route drives navigation between pages and shows a flow bar; you don't need to do anything extra to preview it — `/c/<product>/<slug>` opens the flow's first page.

Every concept, single- or multi-page, also carries an analytics spec, tagged with the `@universe-forma/analytics-tagger` package's runtime overlay. Run `npm run dev`, open the concept with the `?tag=1` query param (e.g. `/c/<product>/<slug>?tag=1` — the overlay is opt-in and invisible without it), and use the drawer: **Inspect** to hover and tag elements, **Coverage** to spot untagged ones, **Events** to review what's tagged per page. It covers a broad event taxonomy — interaction, form, visibility, navigation, media, content, and custom — not just clicks and page loads. Changes auto-save `analytics.json` into the concept folder; **Export** also gives you the raw JSON, a ready-to-paste Amplitude call snippet, and a full tracking plan for handoff. Run `npm run gate:analytics` any time to see which pages are still missing a page-view event or have invalid event names.

**Багатосторінкові концепти й розмітка аналітики.** Деякі концепти — це не один екран, а послідовність (воронка, майстер). Вони лежать у `src/concepts/<продукт>/<назва>/` з файлом `flow.ts` (порядок сторінок) і папками `pages/<сторінка>/` замість одного `Screen.tsx` — переглядаються так само, за адресою `/c/<продукт>/<назва>`, галерея сама показує панель переходів між кроками. Розмітку аналітики робить пакет `@universe-forma/analytics-tagger`: у `npm run dev` відкрий концепт з параметром `?tag=1` (наприклад `/c/<продукт>/<назва>?tag=1` — без нього оверлей не з'являється), і в панелі познач елементи через **Inspect**, перевір прогалини через **Coverage**. Таксономія подій тепер широка — взаємодія, форми, видимість, навігація, медіа, контент, довільні — а не лише клік і завантаження сторінки. Зміни автоматично зберігаються в `analytics.json` у папці концепту; **Export** також дає готовий JSON, сніпет для Amplitude і повний tracking plan. Командою `npm run gate:analytics` можна будь-коли перевірити, яким сторінкам не вистачає події перегляду сторінки або де невалідні назви подій.

---

## Оновлення каталогів (робить розробник, зрідка)

Claude «знає» дизайн-систему й архітектуру продуктів завдяки згенерованим каталогам (`ds-catalog/`, `product-profiles/`, `brands/`). Коли `ui-pes` оновлюється або змінюється продукт — їх треба перегенерувати:

```bash
npm run reindex             # оновити все
npm run reindex:ds          # каталог дизайн-системи (з node_modules/@universe-forma/ui-pes) + сейфліст утиліт токенів
npm run reindex:products    # бренд-токени з локальних репозиторіїв продуктів + шрифти
```

> `product-profiles/*.md` підтримуються вручну. `reindex:ds` перезаписує `ds-catalog/*.md` і `src/styles/ds-safelist.css` (гарантує, що всі утиліти токенів `ui-pes` завжди генеруються, а не «мовчки» зникають). `reindex:products` перезаписує `brands/*.css` **і** `src/styles/fonts.css` — останній генерується з `--font-primary` кожного бренду, тож шрифти завжди відповідають брендам без ручного редагування. Обидва файли позначені `DO NOT EDIT` — не правити руками.

> **Шрифти самостійно захостовані** через `@fontsource` (не з CDN) — працюють офлайн і в CI. Якщо бренд використовує шрифт, якого ще немає, `reindex:products` попередить і підкаже поставити відповідний `@fontsource/<шрифт>` пакет.

`reindex:products` шукає репозиторії продуктів поруч (`../pdfguru-fe`, `../tbp-fe`, `../pdfleader-fe`). Якщо вони в іншому місці:

```bash
PDFGURU_FE=~/dev/pdfguru-fe TBP_FE=~/dev/tbp-fe PDFLEADER_FE=~/dev/pdfleader-fe npm run reindex
```

---

## Часті питання

**Claude вигадав компонент, якого немає в дизайн-системі?**
Не має. Правило зашите: якщо в `ui-pes` чогось бракує, Claude складає це з наявних примітивів + токенів і **позначає прогалину**, щоб команда дизайн-системи додала компонент. Якщо бачиш вигаданий компонент — скажи Claude, він виправить.

**Кольори не ті, що в продукті?**
Перевір, що в описі вказав правильний продукт. Кольори підтягуються з реального бренду через `brands/<продукт>.css`.

**Можна кілька екранів?**
Так — кожен стає окремою папкою в `src/concepts/` і окремою карткою в галереї.

**Нічого не запускається / помилка встановлення?**
Найчастіше — немає токена реєстру `@universe-forma`. Напиши розробникам.

---

## Коротко

```
git clone … && cd … && npm install
npm run dev                          # відкриється галерея
claude                               # → /vibe-concept «Зроби [екран] для [продукт] за Figma: [посилання]»
# дивишся на /c/<продукт>/<назва>, ітеруєш словами
npm run gate                         # перевірка якості (токени, стани)
npm run fidelity <продукт> <назва>   # звірка з макетом (ширина, шрифти, кольори)
# віддаєш концепт + INTEGRATION.md інженеру
```

## Інше (для розробників)

```bash
npm run build     # tsc -b && vite build
npm test          # vitest run
npm run preview   # перегляд продакшн-збірки
```

Атрибуція сторонніх напрацювань — `VENDOR.md`.
