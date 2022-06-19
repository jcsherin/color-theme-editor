## Description

A UI component for creating a color theme. You can use it to group colors by name, and use the keyboard-friendly editor to quickly rename them.

[Demo](https://melted-powder.surge.sh/)

![How to edit a color theme?](assets/howto-edit-color-theme.gif)

## Todos

- [x] Deploy and link to online demo in README
- [x] Color parser - support other color formats
- [x] Be able to add/remove colors & group names
- [x] Split webpack for dev & prod
- [x] Rewrite `mergeState`
- [x] Add `onSubmit` handler for update form
- [x] Load example into form
- [x] Empty state for form
- [ ] Fix: Grid Layout
- [x] Add views for empty/partial form input in grouping
- [ ] Persist `viewMode` in `ThemeEditor` component across page reloads
- [ ] Wire new color parser into app
- [ ] Improve `mergeState` -> `migrateState` (simplifiy existing algo)
- [x] Remove wizard from app
- [x] Update app cache code (localStorage)
- [x] Fix: missing trailing comma for groups in tree editor
- [x] Unquote keys in config (already implemented in copied config)
- [ ] Add help copy inline within app
- [ ] Share URL
- [ ] Download theme
- [ ] Fully derived selectable color items in grouping
- [ ] Write a detailed README with screenshots
- [ ] Link to related blog posts
- [ ] Add integration tests for `App`
