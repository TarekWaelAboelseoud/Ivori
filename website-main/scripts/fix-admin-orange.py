from pathlib import Path

root = Path(__file__).resolve().parents[1] / "app" / "admin"
subs = [
    ("orange-400", "[#dfc18a]"),
    ("orange-300/80", "[#a09890]"),
    ("orange-300", "[#c4bcb4]"),
    ("orange-500/10 text-orange-400 border-orange-500/20", "bg-[var(--admin-gold-glow)] [#dfc18a] border-[color-mix(in_srgb,var(--admin-gold)_22%,transparent)]"),
    ("orange-500/10 text-orange-400", "bg-[var(--admin-gold-glow)] [#dfc18a]"),
    ("orange-500/10", "bg-[var(--admin-gold-glow)]"),
    ("orange-500/20", "border-[color-mix(in_srgb,var(--admin-gold)_22%,transparent)]"),
    ("orange-500/15", "border-[color-mix(in_srgb,var(--admin-gold)_18%,transparent)]"),
    ("orange-500/5", "bg-[var(--admin-gold-glow)]"),
    ("orange-500/40", "border-[color-mix(in_srgb,var(--admin-gold)_40%,transparent)]"),
    ("orange-500/50", "border-[color-mix(in_srgb,var(--admin-gold)_50%,transparent)]"),
    ("hover:border-orange-500/40", "hover:border-[color-mix(in_srgb,var(--admin-gold)_40%,transparent)]"),
    ("focus:border-orange-500/40", "focus:border-[color-mix(in_srgb,var(--admin-gold)_40%,transparent)]"),
    ("focus:border-orange-500/50", "focus:border-[color-mix(in_srgb,var(--admin-gold)_50%,transparent)]"),
    ("hover:text-orange-400", "hover:text-[#dfc18a]"),
    ("hover:text-orange-300", "hover:text-[#f5f2ec]"),
    ("text-orange-400 hover:text-orange-300", "[#dfc18a] hover:text-[#f5f2ec]"),
    ("rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600", "admin-btn-primary px-4 py-2.5 text-sm"),
    ("rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600", "admin-btn-primary px-4 py-3 text-sm"),
    ("rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600", "admin-btn-primary py-3 text-sm w-full"),
    ("flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600", "admin-btn-primary flex-1 py-2.5 text-sm"),
    ("? 'bg-orange-500 text-white'", "? 'admin-tab-active'"),
    ("bg-orange-500 text-white", "admin-tab-active"),
    ("rounded-full bg-orange-500 mt-2", "rounded-full bg-[var(--admin-gold)] mt-2"),
    ("'orange' | 'green'", "'gold' | 'green'"),
    ("orange: 'bg-orange-500/10 text-orange-400'", "gold: 'bg-[var(--admin-gold-glow)] [#dfc18a]'"),
    ('color="orange"', 'color="gold"'),
    (": 'orange'", ": 'gold'"),
    ("meeting:       'text-orange-400'", "meeting:       'text-[#dfc18a]'"),
    ("high:   'text-orange-400'", "high:   'text-[#dfc18a]'"),
    ("high:   'bg-orange-500/10 text-orange-400'", "high:   'bg-[var(--admin-gold-glow)] [#dfc18a]'"),
    ("meeting:        'bg-orange-500/10 text-orange-400'", "meeting:        'bg-[var(--admin-gold-glow)] [#dfc18a]'"),
    ("report_ready: 'bg-orange-500/10 text-orange-400 border-orange-500/20'", "report_ready: 'bg-[var(--admin-gold-glow)] [#dfc18a] border-[color-mix(in_srgb,var(--admin-gold)_22%,transparent)]'"),
]
for p in root.rglob("*.tsx"):
    t = p.read_text(encoding="utf-8")
    orig = t
    for a, b in subs:
        t = t.replace(a, b)
    if "orange" in t:
        t = t.replace("orange", "gold-stale")
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print(p.relative_to(root.parent.parent))
