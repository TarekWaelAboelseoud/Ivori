# Admin Theme System

## Modes

- Dark: premium black/graphite admin surface.
- Off-white: warm ivory paper background with graphite text and muted gold accents.

## Persistence

Theme preference is stored in `localStorage` under `ivori-admin-theme`.

## Flash Reduction

The admin layout injects a small pre-shell script that sets `document.documentElement.dataset.adminTheme` from local storage before the client shell hydrates.

## Future

Later, theme preference can move into `admin_settings` or per-user settings once email login replaces the shared password model.
