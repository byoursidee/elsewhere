import { useStore } from '../store/useStore'
import type { LandscapeStyle } from '../store/useStore'
import { PHOTO_CREDIT } from '../domain/photoBackgrounds'
import { VIDEO_CREDIT } from '../domain/videoBackgrounds'

const CREDITS: Partial<Record<LandscapeStyle, { name: string; url: string }>> = {
  photo: PHOTO_CREDIT,
  video: VIDEO_CREDIT,
}

/** Credits whichever external media source the current landscape style actually pulls from —
 * nothing shown for 'vector', since that's the app's own hand-drawn art. */
export function Attribution() {
  const landscapeStyle = useStore((s) => s.landscapeStyle)
  const credit = CREDITS[landscapeStyle]

  if (!credit) return null

  return (
    <div className="attribution">
      Thanks to{' '}
      <a href={credit.url} target="_blank" rel="noopener noreferrer">
        {credit.name}
      </a>
    </div>
  )
}
