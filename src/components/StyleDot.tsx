type Props = { color: string; icon: string; className?: string }

// 色塊加圖示：用形狀（圖示）而不只靠顏色區分主題與分類。
// icon 是 themeStyles／categories 裡預先轉好的靜態 SVG 字串，不含使用者輸入。
export default function StyleDot({ color, icon, className = '' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full [&>svg]:size-3 ${className}`}
      style={{ backgroundColor: color }}
      dangerouslySetInnerHTML={{ __html: icon }}
    />
  )
}
