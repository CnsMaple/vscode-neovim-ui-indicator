import { defineConfigs } from 'reactive-vscode'

export const { normalColor, insertColor, visualColor, disableColor } = defineConfigs('neovim-ui-indicator', {
  normalColor: String,
  insertColor: String,
  visualColor: String,
  disableColor: String,
})