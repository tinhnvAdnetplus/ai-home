# Design tokens

Single source of truth: `apps/api/resources/css/tokens.css` (checked by `shared/ui/Tokens.test.ts`: structure + WCAG AA contrast in light and dark).
Palette follows the customer design (`docs/design/*.jpg`, see `docs/design/README.md`): blue primary, pink accent for STEP 4-5, navy headings.
Change the look by editing that one file; never hard-code colours in components (use `bg-primary`, `text-foreground`, `bg-accent`, ...).

## Brand scale (blue) - defined once in `@theme`
| Token | Value | Use |
|---|---|---|
| `--color-brand-50` | `#eef5ff` | Very light tint, selected-card background |
| `--color-brand-100` | `#dbe9ff` | Light tint, chips |
| `--color-brand-200` | `#bcd6fe` | Soft borders / highlights |
| `--color-brand-300` | `#8dbbfc` | Decorative |
| `--color-brand-400` | `#5797f6` | Primary in dark mode |
| `--color-brand-500` | `#2d7ce8` | Interactive accents |
| `--color-brand-600` | `#0b6bdc` | **Primary** (buttons, links, focus ring) - sampled from the mockups |
| `--color-brand-700` | `#0a56b4` | Primary hover |
| `--color-brand-800` | `#0d4690` | Pressed / dark accents |
| `--color-brand-900` | `#10386f` | Deep surfaces |
| `--color-brand-950` | `#0c243c` | Navy headings / foreground |

## Accent scale (pink, STEP 4-5)
`--color-accent-50 #fff0f5`, `100 #ffdce8`, `200 #ffb8d0`, `500 #ec3064` (mockup pink, decorative / large graphics only),
`600 #d6275a` (**accent for buttons and text**: white on it is 4.89:1), `700 #b01d49`, `800 #8c1a3c`.
Why not `#ec3064` for buttons: white text on it is only 4.06:1, below WCAG AA (4.5:1).

## Semantic tokens (light in `:root`, dark in `.dark` and `prefers-color-scheme: dark`)
`background, foreground, card, card-foreground, muted, muted-foreground, border, ring, primary, primary-foreground, accent,
accent-foreground, destructive, destructive-foreground, success, success-foreground, warning, warning-foreground`.
Geometry: `--radius` 0.75rem (cards ~12-16px as in the mockups), `--spacing-touch` 44px minimum touch target.
Typography: `Noto Sans JP` first, then the system stack (the font `<link>` is in `resources/views/app.blade.php`).
