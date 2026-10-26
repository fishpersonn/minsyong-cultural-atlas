import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AboutDialog from './AboutDialog'

const show = (over: Partial<React.ComponentProps<typeof AboutDialog>> = {}) =>
  render(<AboutDialog open onOpenChange={() => {}} placeCount={638} themeCount={15} {...over} />)

describe('AboutDialog', () => {
  it('開著時是一個以站名為標題的對話框，副標是中文名', () => {
    show()
    const dialog = screen.getByRole('dialog', { name: 'Minsyong Cultural Atlas' })
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
    expect(screen.getByText('民雄文化地圖')).toBeTruthy()
    // 舊的開場問句已經拿掉
    expect(dialog.textContent).not.toContain('如果地圖標示的不只是地點')
  })

  it('內文：座標圖的說明、團隊的故事、橋與禮物、謝謝', () => {
    show()
    const text = screen.getByRole('dialog').textContent!
    expect(text).toContain('這不是一張告訴你該如何快速抵達的座標圖，而是一幅由無數在地生命交織成的記憶地圖。')
    expect(text).toContain('「重構大學路」團隊歷時無數個在田野間蹲下的午後')
    expect(text).toContain('我們常想，一座大學與它腳下的土地該如何彼此相認？')
    expect(text).toContain('它是一座橋')
    expect(text).toContain('謝謝每一位為民雄寫下、說出這些故事的人，也謝謝願意停下腳步、傾聽這片土地的你。')
  })

  it('地點數與主題數由資料帶入', () => {
    show({ placeCount: 700, themeCount: 18 })
    const text = screen.getByRole('dialog').textContent!
    expect(text).toContain('目前地圖上已有 700 個地點與 18 個主題')
    expect(text).not.toContain('638')
  })

  it('備註：關於錯漏；版權與開源；致謝', () => {
    show()
    const text = screen.getByRole('dialog').textContent!
    expect(text).toContain('備註')
    expect(text).toContain('關於錯漏：地圖上的地點與分類皆由夥伴們人工一一標註')
    expect(text).toContain('版權與開源：圖文與資料版權為重構大學路計畫團隊所有；網站程式碼採 MIT 授權。')
    expect(text).toContain('致謝：OpenStreetMap、CARTO、MapLibre、lucide，以及 Noto Serif TC 與 Geist 字體。')
  })

  it('中文句子沒有被 JSX 換行插進多餘的空白', () => {
    show()
    const text = screen.getByRole('dialog').textContent!
    expect(text).not.toMatch(/[一-鿿」] [一-鿿「]/)
  })

  it('三個連結（重構大學路、告訴我們、網站程式碼）都以新分頁開啟', () => {
    show()
    const links = Array.from(screen.getByRole('dialog').querySelectorAll('a'))
    expect(links.map((a) => a.textContent)).toEqual(['重構大學路', '告訴我們', '網站程式碼'])
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://dovoha.ccu.edu.tw/',
      'https://github.com/fishpersonn/minsyong-cultural-atlas/issues',
      'https://github.com/fishpersonn/minsyong-cultural-atlas',
    ])
    for (const a of links) {
      expect(a.getAttribute('target')).toBe('_blank')
      expect(a.getAttribute('rel')).toBe('noopener noreferrer')
    }
  })

  it('關閉時不顯示', () => {
    show({ open: false })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('關閉鈕與 Esc 都會通知關閉', () => {
    const onOpenChange = vi.fn()
    show({ onOpenChange })
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onOpenChange).toHaveBeenCalledTimes(2)
  })
})
