import { defineExtension, ref, useCommand, useCommands, useVscodeContext, useStatusBarItem, watchEffect } from 'reactive-vscode'
import { window, StatusBarAlignment, Range, TextEditorRevealType } from 'vscode'
import { normalColor, insertColor, visualColor, disableColor } from './configs'
import { logger } from './utils'

const modeStatusMap = {
  normal: 'normal',
  insert: 'insert',
  visual: 'visual',
  disable: 'disable',
}

const modeStatus = useVscodeContext('neovim-ui-indicator.mode', modeStatusMap.normal);

let lineHighlightDecoration = createLineHighlightDecoration();

function createLineHighlightDecoration() {
  return window.createTextEditorDecorationType({
    backgroundColor:
      modeStatus.value === modeStatusMap.normal ? normalColor.value :
        modeStatus.value === modeStatusMap.insert ? insertColor.value :
          modeStatus.value === modeStatusMap.visual ? visualColor.value :
            disableColor.value,
    isWholeLine: true
  });
}

function highlightCursorLine() {
  const editor = window.activeTextEditor;
  if (editor) {
    const cursorLine = editor.selection.active.line;
    const range = new Range(cursorLine, 0, cursorLine, 0);
    editor.setDecorations(lineHighlightDecoration, [range]);
  }
}

export = defineExtension(() => {

  useStatusBarItem({
    alignment: StatusBarAlignment.Right,
    priority: 1000,
    text: () => {
      return `${modeStatus.value}`
    },
    // color: () => {
    //   const tempColor = modeStatus.value === modeStatusMap.normal ? normalColor.value :
    //     modeStatus.value === modeStatusMap.insert ? insertColor.value :
    //       modeStatus.value === modeStatusMap.visual ? visualColor.value :
    //         disableColor.value
    //   return tempColor.slice(0, 7)
    // },
    command: 'neovim-ui-indicator.toggle'
  }).show()

  // 通过命令来设置模式
  useCommands({
    'neovim-ui-indicator.normal': () => {
      if (modeStatus.value != modeStatusMap.disable) {
        modeStatus.value = modeStatusMap.normal;
      }
    },
    'neovim-ui-indicator.insert': () => {
      if (modeStatus.value != modeStatusMap.disable) {
        modeStatus.value = modeStatusMap.insert;
      }
    },
    'neovim-ui-indicator.visual': () => {
      if (modeStatus.value != modeStatusMap.disable) {
        modeStatus.value = modeStatusMap.visual;
      }
    },
    'neovim-ui-indicator.toggle': () => {
      modeStatus.value = modeStatus.value === modeStatusMap.disable ? modeStatusMap.normal : modeStatusMap.disable
      if (modeStatus.value === modeStatusMap.disable) {
        window.showInformationMessage('Neovim Ui Indicator is disabled')
      }
    }
  })

  // 按键捕获模块
  useCommand('neovim-ui-indicator.cursorCenter', async () => {
    const editor = window.activeTextEditor;
    if (editor) {
      // 获取当前光标的位置
      const cursorPosition = editor.selection.active;

      // 通过设置视图来使光标位置居中
      editor.revealRange(new Range(cursorPosition, cursorPosition), TextEditorRevealType.InCenter);
    } else {
      window.showInformationMessage('没有活动编辑器')
    }
  })

  window.onDidChangeTextEditorSelection(highlightCursorLine);

  // 监听模式变化
  watchEffect(() => {
    // 重新创建装饰
    lineHighlightDecoration.dispose();
    lineHighlightDecoration = createLineHighlightDecoration();
    // 重新应用装饰
    highlightCursorLine();
  });

})