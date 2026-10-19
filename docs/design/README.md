# Customer-facing design reference (source of truth: `design.pdf`)

Every END-USER screen (wizard, results, landing, etc.) MUST be built to match these mockups: layout, section order, card styles,
iconography, tone and copy structure. They are PNG/JPG renders of `design.pdf` (pages 1,3-7). Open the image before writing the UI.

| File | Screen |
|---|---|
| `00-system-overview.jpg` | Whole-system diagram (5 areas: user input, AI/design engine, building data model, drawings/3D, outputs) |
| `01-step1-basic-info.jpg` | STEP 1 基本情報 |
| `02-step2-land.jpg` | STEP 2 土地情報 |
| `03-step3-floorplan.jpg` | STEP 3 間取りの希望 |
| `04-step4-lifestyle.jpg` | STEP 4 暮らし方の希望 |
| `05-step5-design.jpg` | STEP 5 デザインの希望 |

## What to reproduce (from the mockups)
- Desktop: left brand/sidebar column (logo "AI HOME PLATFORM", the 5 steps with check state, a lifestyle photo with handwritten-style caption)
  + main card on the right with: step badge icon, "STEP n" label, large title, subtitle, top-right 5-dot stepper (done = check, current = filled,
  future = grey), numbered sections ("1. 建築の目的" ...) in rounded white cards, `必須` (required, red chip) / `任意` (optional, grey chip) labels,
  image/icon cards with a check badge when selected, radio lists, checkbox grids, free-text areas with a character counter (`0 / 200`),
  and a full-width primary button ("次へ進む >") plus a secondary "< 前へ戻る" on steps 2-5; the last step's button reads
  "この内容でプランを作成する >".
- Palette (sampled from the JPEGs, approximate - confirm visually): primary blue ~`#0b6bdc` (STEP 1-3 accents, primary buttons),
  pink accent ~`#ec3064` (STEP 4-5 current-step colour and buttons), navy headings ~`#0c243c`, very light blue-white page background,
  green for the "land" illustrations. The older green palette from `old-version` is SUPERSEDED for customer UI.
- Font: Noto Sans JP. Rounded corners (~12-16px), soft shadows, generous spacing, photographic option cards.
- The mockups are DESKTOP ONLY. Mobile layout is ours to design (single column, sticky bottom action bar, stepper collapses to "STEP n / 5"),
  keeping the same visual language. Touch targets >= 44px.

## Known flaws in the mockups - do NOT copy these
1. The same question appears in several steps (floors in STEP 1 and STEP 3, floor area in STEP 1 and STEP 3, parking in STEP 3 and STEP 4,
   house style in STEP 1 and STEP 5). Each field is asked ONCE; later steps may show/edit the stored value. (Field definitions come from the
   admin-managed wizard config, never from hard-coded JSX.)
2. STEP 3 shows "2 toilets (1F/2F)" while 平屋 (one storey) is selected: options must be hidden/disabled by the config's visibility rules.
3. STEP 4/5 cards show a check badge and an empty checkbox at the same time: use ONE selection state.
4. Mockup text is illustrative; real labels/options come from the config (ja/en/vi) and i18n files.

## Conformance rule for tasks
A task that builds customer-facing UI must (a) name the mockup(s) it follows, (b) list in its report which parts of the mockup it reproduced and
which it deliberately changed (and why), (c) keep all copy in i18n/config. The reviewer compares the running page with the mockup in a browser.
