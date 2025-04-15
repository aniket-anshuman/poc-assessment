import { useState } from 'react'
import { useDrop, useDrag } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import { MoveIcon } from 'lucide-react'

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
}> = ({ component, onUpdate, onStyleChange, onMove }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(component.content || '')
  const [styles, setStyles] = useState({
    color: '#000000',
    ...component.styles,
  })

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    hover: (item: { id: string }) => {
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

  return (
    <div
      //@ts-ignore
      ref={drop}
      className={`relative p-2 my-2 min-h-[40px] rounded-md ${
        isEditing ? 'border border-blue-300' : 'border border-gray-600'
      } ${isOver ? 'bg-blue-100' : ''}`}
      style={{
        ...styles,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div
        //@ts-ignore
        ref={drag}
        className='absolute -left-6 top-1/2 transform -translate-y-1/2 cursor-move opacity-0 hover:opacity-100'
      >
        <MoveIcon className='h-6 w-6 text-gray-900' />
      </div>
      <div
        onClick={() => setIsEditing(true)}
        contentEditable={isEditing}
        onBlur={handleBlur}
        suppressContentEditableWarning
      >
        {content || defaultContent}
      </div>
    </div>
  )
}

const LayoutComponent: React.FC<{
  component: Component
  onDrop: (parentId: string, item: any) => void
  onUpdate: (id: string, content: string) => void
  onStyleChange: (id: string, styles: Record<string, string>) => void
  onMove: (dragId: string, hoverId: string) => void
  //@ts-ignore

  renderComponent: (comp: Component) => JSX.Element
}> = ({
  component,
  onDrop,
  onUpdate,
  onStyleChange,
  onMove,
  renderComponent,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: any) => onDrop(component.id, item),
    hover: (item: { id: string }) => {
      if (item.id !== component.id) {
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
        return 'flex flex-col w-full bg-[#F5FAFF] p-4 rounded'
      case '2COLUMN':
        return 'flex flex-row gap-4 w-full bg-[#F5FAFF] p-4 rounded'
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
      className={`relative ${getLayoutClasses()} ${
        isOver ? 'bg-blue-100' : ''
      }`}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div
        //@ts-ignore

        ref={drag}
        className='absolute -left-6 top-1/2 transform -translate-y-1/2 cursor-move opacity-0 hover:opacity-100'
      >
        <MoveIcon className='h-4 w-4 text-gray-500' />
      </div>

      {component.type === 'DIVIDER' ? (
        <hr className='border-t border-gray-300' />
      ) : (
        <>
          {component.children?.map(renderComponent)}
          {(!component.children || component.children.length === 0) && (
            <div className='text-gray-400 p-2 text-center'>
              {isOver ? 'Drop here' : 'Empty ' + component.type?.toLowerCase()}
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
        color: '#000000', // Default black text color for text components
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

  const handleMove = (dragId: string, hoverId: string) => {
    setComponents((prev) => {
      const findComponent = (
        comps: Component[],
        id: string
      ): Component | null => {
        for (const comp of comps) {
          if (comp.id === id) return comp
          if (comp.children) {
            const found = findComponent(comp.children, id)
            if (found) return found
          }
        }
        return null
      }

      const dragComponent = findComponent(prev, dragId)
      const hoverComponent = findComponent(prev, hoverId)

      if (!dragComponent || !hoverComponent) return prev

      // Remove from old position
      const removeComponent = (comps: Component[], id: string): Component[] => {
        return comps.filter((comp) => {
          if (comp.id === id) return false
          if (comp.children) {
            comp.children = removeComponent(comp.children, id)
          }
          return true
        })
      }

      let newComponents = removeComponent([...prev], dragId)

      // Add to new position (after hover component)
      const insertAfter = (
        comps: Component[],
        afterId: string,
        newComp: Component
      ): Component[] => {
        return comps.reduce((acc, comp) => {
          if (comp.id === afterId) {
            return [...acc, comp, newComp]
          }
          if (comp.children) {
            comp.children = insertAfter(comp.children, afterId, newComp)
          }
          return [...acc, comp]
        }, [] as Component[])
      }

      newComponents = insertAfter(newComponents, hoverId, dragComponent)

      return newComponents
    })
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
