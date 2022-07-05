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
- [x] Fix: Grid Layout
- [x] Add views for empty/partial form input in grouping
- [x] Remove wizard from app
- [x] Update app cache code (localStorage)
- [x] Fix: missing trailing comma for groups in tree editor
- [x] Unquote keys in config (already implemented in copied config)
- [ ] Share URL
- [ ] Download theme
- [x] Improve `mergeState` -> `migrateState` (simplifiy existing algo)
- [x] Wire new color parser into app (formats: RGBA, HSLA, Keywords)
  - [ ] Update load example with newly supported formats
- [ ] Write a detailed README with screenshots
- [ ] Add integration tests for `App`
- [ ] Improve first time user experience
  - [ ] Show color value parse errors
  - [ ] Turn on edit mode for first grouped color
  - [ ] Use space in grouping UI column for usage instructions
