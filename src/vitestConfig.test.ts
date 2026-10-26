import { describe, expect, it } from 'vitest'
import config from '../vite.config'

describe('vitest 設定', () => {
  it('不掃 .claude 底下的內容：.claude/worktrees/ 裡是其他分支的完整副本，在主資料夾跑 npm test 會把它們的測試一起跑', () => {
    expect(config.test?.exclude).toContain('**/.claude/**')
  })

  it('原本的預設排除（node_modules、.git）還在', () => {
    expect(config.test?.exclude).toContain('**/node_modules/**')
    expect(config.test?.exclude).toContain('**/.git/**')
  })
})
