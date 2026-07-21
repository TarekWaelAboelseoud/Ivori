# UI noise reduction report

---

## Noise sources removed

| Element | Action |
|---------|--------|
| Fixed ambient orbs (global + hero) | Removed |
| `studio-ambient::before` gradient box | Removed |
| Cursor follow glow | Removed component |
| Glass nav (`backdrop-blur` + translucent surface) | Solid `background/96` |
| Mobile menu blur | Solid background |
| WhatsApp strip blur | Solid background |
| Service page gap-px bordered grid | Editorial list |
| Chapter bridge opacity pulse | Disabled |
| Extra hero gradient stack | Single wash + image gradient |
| Purple `ambient-orb-c` | Removed with orb system |

---

## Intentional borders retained

- Work media frames (editorial photography containers)  
- KVL flagship card border (single hero work block)  
- Section `border-t` dividers (rhythm, not cards)  
- Inquiry flow controls (functional)

---

## Template patterns reduced

- No glassmorphism panels  
- No bento “capability cells” on CRO / Shopify / Media pages  
- No decorative UI chrome behind headlines

---

## UX impact

- Lower visual entropy → higher perceived price point  
- Faster scan path on service pages  
- Hero typography no longer fights overlay rectangles

---

## Performance notes

- Fewer fixed layers → less compositor work on mobile  
- Removed client-side cursor listener → less main-thread work on desktop

---

## Future recommendations

- If adding motion, prefer CSS opacity on content only — not new full-screen layers  
- Audit `/ar` for duplicate atmosphere if Arabic pages gain custom hero
