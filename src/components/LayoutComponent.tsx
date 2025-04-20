import { MoveIcon, Trash2Icon } from "lucide-react"
import { useDrag, useDrop } from "react-dnd"
import { Component } from "./ContentPreview"

export const LayoutComponent: React.FC<{
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