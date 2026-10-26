import { useState } from 'react'
import { Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = { id: string; title: string }

// 官網的 Podcast 文章頁嵌的是 Spotify 的單集播放器（open.spotify.com/embed），這裡同樣嵌它。
// 預設只放一顆按鈕：點了才載入 iframe，這樣只是瀏覽卡片時不會連到 Spotify。
export default function SpotifyPlayer({ id, title }: Props) {
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <iframe
        src={`https://open.spotify.com/embed/episode/${id}`}
        title={`${title}（Spotify 播放器）`}
        width="100%"
        height="152"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        className="rounded-xl border-0"
      />
    )
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        size="sm"
        onClick={() => setLoaded(true)}
        className="bg-atlas-amber text-atlas-ink hover:bg-atlas-focus"
      >
        <Headphones aria-hidden="true" />
        在這裡聽這一集
      </Button>
      <span className="text-xs text-atlas-muted">點了才會載入 Spotify 的播放器</span>
    </div>
  )
}
