import { useStore } from '../store/useStore'
import { WindowCard } from './WindowCard'

export function Stage() {
  const multi = useStore((s) => s.multi)
  const layout = useStore((s) => s.layout)
  const selected = useStore((s) => s.selected)
  const active = useStore((s) => s.active)
  const removeSelected = useStore((s) => s.removeSelected)

  const list = multi ? selected : [active]
  const stageClass = ['stage', multi && 'multi-stage', multi && layout === 'vertical' && 'vertical']
    .filter(Boolean)
    .join(' ')

  return (
    <div id="stage" className={stageClass}>
      {list.map((city, i) => (
        <WindowCard
          key={city}
          city={city}
          multi={multi}
          showRemove={multi && list.length > 1}
          showDivider={i < list.length - 1}
          onRemove={() => removeSelected(city)}
        />
      ))}
    </div>
  )
}
