import type { MenuOptionModel } from '@/types/menu'
import { Link } from '@modern-js/runtime/router'

export interface SidebarOptionProps {
  item?: MenuOptionModel
  selectedItem?: MenuOptionModel
  size?: string
  onSelected?: (item: MenuOptionModel) => void
}

export default function SidebarOption({
  item,
  selectedItem,
  size,
  onSelected,
}: SidebarOptionProps) {
  const formatIcon = (icon: string): string => 'clt icon clt-' + icon

  const selectOption = (item: MenuOptionModel) => {
    if (onSelected) {
      onSelected(item)
    }
  }

  if (!item) {
    return null
  }

  // Si no tiene hijos, renderizar como enlace
  if (!item.children) {
    return (
      <Link
        to={item.url || '#'}
        cl-option=""
        aria-selected={selectedItem?.url === item.url}
        data-size={size}
      >
        {item.icon && <span className={formatIcon(item.icon)}></span>}
        {item.name && <span className="label">{item.name}</span>}
      </Link>
    )
  }

  // Si tiene hijos, renderizar como botón
  return (
    <button
      type="button"
      cl-option=""
      onClick={() => selectOption(item)}
      aria-pressed={selectedItem?.url === item.url}
      data-size={size}
    >
      {item.icon && <span className={formatIcon(item.icon)}></span>}
      {item.name && <span className="label">{item.name}</span>}
      {item.children && <span className="clt clt-chevron-right icon"></span>}
    </button>
  )
}
