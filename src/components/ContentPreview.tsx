import { useState } from 'react'
import { useDrop, useDrag } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import { MoveIcon, Trash2Icon } from 'lucide-react'
import React from 'react'

type Component = {
  id: string
  type: string
  content?: string
  styles?: Record<string, string>
  children?: Component[]
}

const TextComponent: React.FC<{
  component: Component
  onUpdate: (id: string, content: string) => void
  onStyleChange: (id: string, styles: Record<string, string>) => void
  onMove: (dragId: string, hoverId: string) => void
  onDelete: (id: string) => void
}> = ({ component, onUpdate, onStyleChange, onMove, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(component.content || '')
  const [styles, setStyles] = useState({
    color: '#000000',
    ...component.styles,
  })

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id, type: component.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    hover: (item: { id: string; type: string }) => {
      if (item.id !== component.id) {
        onMove(item.id, component.id)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const handleBlur = () => {
    setIsEditing(false)
    onUpdate(component.id, content)
    onStyleChange(component.id, styles)
  }

  const defaultContent =
    {
      HEADLINE: 'Headline Text',
      SUBHEADER: 'Subheader Text',
      BODY: 'Body text. Click to edit...',
    }[component.type] || ''

  const Tag =
    {
      HEADLINE: 'h1',
      SUBHEADER: 'h3',
      BODY: 'p',
    }[component.type] || 'div'

  const tagStyles =
    {
      HEADLINE: 'text-2xl font-bold my-2',
      SUBHEADER: 'text-xl font-semibold my-2',
      BODY: 'text-base my-2',
    }[component.type] || ''

  return (
    <div
      //@ts-ignore
      ref={drop}
      className={`relative group p-2 my-2 min-h-[40px] rounded-md border border-gray-200 ${
        isOver ? 'bg-blue-100' : ''
      } ${isEditing ? 'border-blue-300' : ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className='absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
        <div
          //@ts-ignore
          ref={drag}
          className='cursor-move bg-white rounded-full p-1 shadow-sm hover:bg-gray-100'
        >
          <MoveIcon className='h-4 w-4 text-gray-500' />
        </div>
        <button
          onClick={() => onDelete(component.id)}
          className='cursor-pointer bg-white rounded-full p-1 shadow-sm hover:bg-red-100 hover:text-red-500'
        >
          <Trash2Icon className='h-4 w-4 text-gray-500 hover:text-red-500' />
        </button>
      </div>

      {React.createElement(
        Tag,
        {
          onClick: () => setIsEditing(true),
          contentEditable: isEditing,
          onBlur: handleBlur,
          suppressContentEditableWarning: true,
          className: `outline-none ${tagStyles}`,
          style: styles,
        },
        content || defaultContent
      )}
    </div>
  )
}

const LayoutComponent: React.FC<{
  component: Component
  onDrop: (parentId: string, item: any) => void
  onUpdate: (id: string, content: string) => void
  onStyleChange: (id: string, styles: Record<string, string>) => void
  onMove: (dragId: string, hoverId: string) => void
  onDelete: (id: string) => void
  //@ts-ignore
  renderComponent: (comp: Component) => JSX.Element
}> = ({
  component,
  onDrop,
  onUpdate,
  onStyleChange,
  onMove,
  onDelete,
  renderComponent,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id, type: component.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: any) => {
      if (!['1COLUMN', '2COLUMN', 'CONTAINER'].includes(item.type)) {
        onDrop(component.id, item)
      }
    },
    hover: (item: { id: string; type: string }) => {
      if (
        item.id !== component.id &&
        !['1COLUMN', '2COLUMN', 'CONTAINER'].includes(item.type)
      ) {
        onMove(item.id, component.id)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const getLayoutClasses = () => {
    switch (component.type) {
      case '1COLUMN':
        return 'flex flex-col w-full bg-[#F5FAFF] p-4 rounded gap-2'
      case '2COLUMN':
        return 'grid grid-cols-2 w-full bg-[#F5FAFF] p-4 rounded gap-4'
      case 'CONTAINER':
        return 'border border-gray-300 p-4 rounded bg-[#F5FAFF] w-full'
      case 'DIVIDER':
        return 'border-t border-gray-300 my-4 w-full'
      default:
        return ''
    }
  }

  return (
    <div
      //@ts-ignore
      ref={drop}
      className={`relative group ${getLayoutClasses()} ${
        isOver ? 'bg-blue-100' : ''
      }`}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className='absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
        <div
          //@ts-ignore
          ref={drag}
          className='cursor-move bg-white rounded-full p-1 shadow-sm hover:bg-gray-100'
        >
          <MoveIcon className='h-4 w-4 text-gray-500' />
        </div>
        <button
          onClick={() => onDelete(component.id)}
          className='cursor-pointer bg-white rounded-full p-1 shadow-sm hover:bg-red-100 hover:text-red-500'
        >
          <Trash2Icon className='h-4 w-4 text-gray-500 hover:text-red-500' />
        </button>
      </div>

      {component.type === 'DIVIDER' ? (
        <hr className='border-t border-gray-300' />
      ) : component.type === '2COLUMN' ? (
        <>
          <div className='bg-yellow-100 min-h-[100px] flex items-center justify-center text-gray-500'>
            Empty column
          </div>
          <div className='bg-yellow-100 min-h-[100px] flex items-center justify-center text-gray-500'>
            Empty column
          </div>
          {component.children?.map(renderComponent)}
        </>
      ) : (
        <>
          {component.children?.map(renderComponent)}
          {(!component.children || component.children.length === 0) && (
            <div className='text-gray-400 p-2 text-center bg-yellow-100 min-h-[100px] flex items-center justify-center'>
              {isOver ? 'Drop here' : 'Empty ' + component.type.toLowerCase()}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export const ContentPreview: React.FC = () => {
  const [components, setComponents] = useState<Component[]>([])

  const handleDrop = (parentId: string | null, item: any) => {
    const newComponent: Component = {
      id: uuidv4(),
      type: item.type,
      content: ['HEADLINE', 'SUBHEADER', 'BODY'].includes(item.type)
        ? ''
        : undefined,
      children: ['1COLUMN', '2COLUMN', 'CONTAINER'].includes(item.type)
        ? []
        : undefined,
      styles: {
        color: '#000000',
      },
    }

    if (parentId) {
      setComponents((prev) =>
        prev.map((comp) =>
          comp.id === parentId
            ? { ...comp, children: [...(comp.children || []), newComponent] }
            : comp
        )
      )
    } else {
      setComponents((prev) => [...prev, newComponent])
    }
  }

  const handleUpdate = (id: string, content: string) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, content } : comp))
    )
  }

  const handleStyleChange = (id: string, styles: Record<string, string>) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, styles } : comp))
    )
  }

  const handleDelete = (id: string) => {
    const deleteComponent = (comps: Component[]): Component[] => {
      return comps
        .filter((comp) => comp.id !== id)
        .map((comp) => ({
          ...comp,
          children: comp.children ? deleteComponent(comp.children) : undefined,
        }))
    }
    setComponents((prev) => deleteComponent(prev))
  }

  const handleMove = (dragId: string, hoverId: string) => {
    if (dragId === hoverId) return

    const findIndex = (comps: Component[], id: string): number => {
      return comps.findIndex((comp) => {
        if (comp.id === id) return true
        if (comp.children) {
          return findIndex(comp.children, id) !== -1
        }
        return false
      })
    }

    const findParent = (comps: Component[], id: string): Component[] | null => {
      for (let i = 0; i < comps.length; i++) {
        if (comps[i].id === id) return comps
        if (comps[i].children) {
          const found = findParent(comps[i].children!, id)
          if (found) return found
        }
      }
      return null
    }

    const dragParent = findParent([...components], dragId)
    const hoverParent = findParent([...components], hoverId)

    if (!dragParent || !hoverParent) return

    const dragIndex = findIndex(dragParent, dragId)
    const hoverIndex = findIndex(hoverParent, hoverId)

    if (dragIndex === -1 || hoverIndex === -1) return

    // Don't replace items with themselves
    if (dragParent === hoverParent && dragIndex === hoverIndex) {
      return
    }

    // Remove from old position
    const [removed] = dragParent.splice(dragIndex, 1)

    // Insert at new position
    hoverParent.splice(hoverIndex, 0, removed)

    setComponents([...components])
  }

  const renderComponent = (component: Component) => {
    if (['HEADLINE', 'SUBHEADER', 'BODY'].includes(component.type)) {
      return (
        <TextComponent
          key={component.id}
          component={component}
          onUpdate={handleUpdate}
          onStyleChange={handleStyleChange}
          onMove={handleMove}
          onDelete={handleDelete}
        />
      )
    } else {
      return (
        <LayoutComponent
          key={component.id}
          component={component}
          onDrop={handleDrop}
          onUpdate={handleUpdate}
          onStyleChange={handleStyleChange}
          onMove={handleMove}
          onDelete={handleDelete}
          renderComponent={renderComponent}
        />
      )
    }
  }

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: any) => handleDrop(null, item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <main
      //@ts-ignore
      ref={drop}
      className={`px-5 pt-11 pb-56 mt-7 w-full bg-white rounded-lg border border-gray-200 border-solid max-md:pb-24 max-md:max-w-full min-h-[500px] ${
        isOver ? 'bg-blue-50' : ''
      }`}
    >
      {components.length === 0 ? (
        <div className='text-center text-gray-400 py-20'>
          Drag components here to start building your layout
        </div>
      ) : (
        components.map(renderComponent)
      )}
    </main>
  )
}
