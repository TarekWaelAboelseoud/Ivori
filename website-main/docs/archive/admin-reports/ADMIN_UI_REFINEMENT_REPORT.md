# Admin UI Refinement Report

## Changed

- Added wider admin workspace width for denser operational tables.
- Added professional table styles, metric cards, sharper borders, and reduced empty placeholder space.
- Added dedicated dashboard surfaces for finance, receipts, clients, and overview.
- Converted hardcoded admin surfaces toward CSS variables so dark/off-white themes can share components.

## Theme

The admin shell now supports dark and off-white modes. Off-white uses warm paper, graphite text, muted gold, and subtle borders instead of pure white.

## Known Limitations

- Some older inquiry screens still use legacy utility colors; they remain functional and protected.
- Theme preference is stored in `localStorage`, not yet synced to `admin_settings`.
