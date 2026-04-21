# Design tokens (v1.0)

Copy into global CSS or theme config. **Ratio guidance:** ~60% Cream Canvas, ~20% Deep Soil, ~10% Red Dirt, ~10% Denim/Green/Gold.

## Color

| Token | Value | Name |
|-------|--------|------|
| `--color-primary` | `#A3472A` | Red Dirt |
| `--color-text-primary` | `#2B1E1A` | Deep Soil |
| `--color-bg` | `#F5EFE6` | Cream Canvas |
| `--color-secondary` | `#5A6C7D` | Washed Denim |
| `--color-success` / support | `#6E7F5F` | Field Green |
| `--color-accent` | `#C8A45A` | Sunlight Gold |

**Rules:** avoid bright national partisan red/blue pairs; keep saturation muted; lean on Cream Canvas to soften.

## Typography

| Token | Value |
|-------|--------|
| `--font-heading` | `'Libre Baskerville', Georgia, serif` |
| `--font-body` | `'Inter', system-ui, sans-serif` |

**Scale (desktop reference — use fluid clamp in production)**

| Element | Size |
|---------|------|
| H1 | 48–64px |
| H2 | 32–40px |
| H3 | 24–28px |
| Body | 16–18px |
| Small | 14px |

**Roles:** headings = short, strong; body = plainspoken; UI/buttons = body weight 600–700.

## Radius & shadow

- Primary button radius: **8px**  
- Card radius: **12px**  
- Shadows: **soft**, not harsh / neon

## Motion

| Token | Value |
|-------|--------|
| `--transition-fast` | `150ms` |
| `--transition-normal` | `250ms` |
| `--transition-slow` | `400ms` |

**Style:** fade + slight lift; smooth transitions. **Avoid:** bounce, hype motion, flashy parallax.

## Layout (summary — see layout-requirements.md)

- Section wrappers: **100% width** (full-bleed bands).  
- Inner content: **max-width ~1200–1300px**, centered.  
- Grid: **12 columns**, responsive.
