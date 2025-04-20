import { useState, useCallback } from 'react'
import { useDrop } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import React from 'react'
import { MediaComponent } from './MediaComponent'
import { LayoutComponent } from './LayoutComponent'
import { TextComponent } from './TextComponent'

export type Component = {
  id: string
  type: string
  content?: string
  styles?: Record<string, string>
  children?: Component[]
  fileData?: string // Base64 encoded file data for media
  fileName?: string // Original file name for media
}

interface ContentPreviewProps {
  components: Component[]
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({ 
  components, 
  setComponents 
}) => {
  const handleDrop = useCallback((parentId: string | null, item: any) => {
    const newComponent: Component = {
      id: uuidv4(),
      type: item.type,
      content: ['HEADLINE', 'SUBHEADER', 'BODY'].includes(item.type)
        ? 'Sample text - edit me'
        : undefined,
      children: ['1COLUMN', '2COLUMN', 'CONTAINER'].includes(item.type)
        ? []
        : undefined,
      styles: {
        color: '#000000',
        fontSize: item.type === 'HEADLINE' ? '2rem' : 
                item.type === 'SUBHEADER' ? '1.5rem' : '1rem',
        margin: '10px 0'
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
  }, [setComponents])

  const handleUpdate = useCallback((id: string, content: string) => {
    setComponents((prev) =>
      prev.map((comp) => 
        comp.id === id ? { ...comp, content } : comp
      )
    )
  }, [setComponents])

  const handleStyleChange = useCallback((id: string, styles: Record<string, string>) => {
    setComponents((prev) =>
      prev.map((comp) => 
        comp.id === id ? { ...comp, styles } : comp
      )
    )
  }, [setComponents])

  const handleFileUpload = useCallback((id: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setComponents((prev) =>
        prev.map((comp) =>
          comp.id === id
            ? { 
                ...comp, 
                fileData: e.target?.result as string,
                fileName: file.name,
                content: file.name
              }
            : comp
        )
      )
    }
    reader.readAsDataURL(file)
  }, [setComponents])

  const handleDelete = useCallback((id: string) => {
    const deleteComponent = (comps: Component[]): Component[] => {
      return comps
        .filter((comp) => comp.id !== id)
        .map((comp) => ({
          ...comp,
          children: comp.children ? deleteComponent(comp.children) : undefined,
        }))
    }
    setComponents((prev) => deleteComponent(prev))
  }, [setComponents])

  const handleMove = useCallback((dragId: string, hoverId: string) => {
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

    if (dragParent === hoverParent && dragIndex === hoverIndex) {
      return
    }

    const [removed] = dragParent.splice(dragIndex, 1)
    hoverParent.splice(hoverIndex, 0, removed)

    setComponents([...components])
  }, [components, setComponents])

  const renderComponent = useCallback((component: Component) => {
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
    } else if (['IMAGE', 'VIDEO'].includes(component.type)) {
      return (
        <MediaComponent
          key={component.id}
          component={component}
          onUpdate={handleUpdate}
          onStyleChange={handleStyleChange}
          onMove={handleMove}
          onDelete={handleDelete}
               //@ts-ignore
          onFileUpload={handleFileUpload}
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
  }, [handleDelete, handleDrop, handleMove, handleStyleChange, handleUpdate, handleFileUpload])

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