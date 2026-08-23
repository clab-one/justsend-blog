<!-- diagram-design-profile
name: justsend
source: https://justsend.cloud (network unavailable); verified local web token source ../web/src/styles/tokens.css
captured_at: 2026-08-23
-->

# JustSend Diagram Style Guide

## Semantic colors

| Role | Value | Use |
| --- | --- | --- |
| background / paper | `#ffffff` | page and diagram background |
| surface / paper-2 | `#f8f8f8` | groups and secondary nodes |
| primary text / ink | `#121212` | text, primary stroke, emphasis |
| muted text | `#363636` | secondary labels |
| soft text | `#727272` | tertiary labels; minimum normal-text contrast boundary |
| rule | `#dfdfdf` | hairlines |
| rule-solid | `#c7c7c7` | strong dividers |
| accent | `#121212` | surface inversion, at most two focal elements |
| accent-tint | `#e4f7a1` | the single pigment/highlighter |
| on-accent | `#ffffff` | text on ink surface |
| on-highlight | `#17191c` | text on highlighter |

## Typography

- heading: `"Hanken Grotesk", "Pretendard Variable", Pretendard, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- body: same as heading
- code: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace`
- font binary: bundled none; system/user-installed fallback only

## Contrast

- `#121212` on `#ffffff`: high contrast, primary text.
- `#363636` on `#ffffff`: high contrast, secondary text.
- `#727272` on `#ffffff`: use at normal-text AA boundary or larger labels.
- `#17191c` on `#e4f7a1`: high contrast highlight label.

## Diagram rules

Use flat surfaces, 1px rules, no shadow, and 4–8px radius. Emphasis uses ink inversion or one highlighter surface rather than an unrelated hue. HTML stays self-contained except system font stacks.
