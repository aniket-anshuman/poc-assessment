import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useCallback, useEffect, useState } from 'react'
import { Component } from './ContentPreview'

const DB_NAME = 'article_drafts'
const STORE_NAME = 'drafts'

interface Draft {
  id: string
  name: string
  date: string
  components: Component[]
}

class DraftStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }
    })
  }

  async saveDraft(components: Component[], name: string = 'Untitled Draft'): Promise<void> {
    if (!this.db) await this.init()

    const draft: Draft = {
      id: Date.now().toString(),
      name,
      date: new Date().toLocaleString(),
      components
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(draft, draft.id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAllDrafts(): Promise<Draft[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const drafts = request.result || []
        drafts.sort((a: Draft, b: Draft) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        resolve(drafts)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async loadDraft(id: string): Promise<Component[] | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result?.components || null)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteDraft(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

const draftStorage = new DraftStorage()

export const ArticleToolbar: React.FC<{ 
  components: Component[],
  onLoadDraft?: (components: Component[]) => void 
}> = ({
  components,
  onLoadDraft
}) => {
  const [hasDraft, setHasDraft] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [showDraftDialog, setShowDraftDialog] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const loadDrafts = async () => {
      try {
        await draftStorage.init()
        const loadedDrafts = await draftStorage.getAllDrafts()
        setDrafts(loadedDrafts)
        setHasDraft(loadedDrafts.length > 0)
      } catch (error) {
        console.error('Error loading drafts:', error)
        setError('Failed to load drafts. Please try refreshing the page.')
      }
    }
    loadDrafts()
  }, [])

  const handleSaveDraft = useCallback(async () => {
    try {
      if (!components || components.length === 0) {
        setError('Cannot save an empty draft')
        return
      }
      setShowDraftDialog(true)
      setError(null)
    } catch (error) {
      console.error('Error preparing to save draft:', error)
      setError('Failed to prepare draft for saving')
    }
  }, [components])

  const handleConfirmSaveDraft = useCallback(async () => {
    try {
      if (!components || components.length === 0) {
        setError('Cannot save an empty draft')
        return
      }

      const name = draftName.trim() || 'Untitled Draft'
      await draftStorage.saveDraft(components, name)
      
      const updatedDrafts = await draftStorage.getAllDrafts()
      setDrafts(updatedDrafts)
      setHasDraft(true)
      setShowDraftDialog(false)
      setDraftName('')
      setError(null)
      alert('Draft saved successfully!')
    } catch (error) {
      console.error('Error saving draft:', error)
      setError('Failed to save draft. Please try again.')
    }
  }, [components, draftName])

  const handleLoadDraft = useCallback(async (draftId: string) => {
    try {
      const draft = await draftStorage.loadDraft(draftId)
      if (!draft) {
        alert('No draft found')
        return
      }

      if (onLoadDraft) {
        onLoadDraft(draft)
        alert('Draft loaded successfully!')
      }
    } catch (error) {
      console.error('Error loading draft:', error)
      setError('Failed to load draft. Please try again.')
    }
  }, [onLoadDraft])

  const handleDeleteDraft = useCallback(async (draftId: string) => {
    try {
      await draftStorage.deleteDraft(draftId)
      const updatedDrafts = await draftStorage.getAllDrafts()
      setDrafts(updatedDrafts)
      setHasDraft(updatedDrafts.length > 0)
      alert('Draft deleted successfully!')
    } catch (error) {
      console.error('Error deleting draft:', error)
      setError('Failed to delete draft. Please try again.')
    }
  }, [])

  const handlePreview = useCallback(() => {
    setShowPreview(true)
  }, [])

  const handleClosePreview = useCallback(() => {
    setShowPreview(false)
  }, [])

  const handleDownloadHTML = useCallback(() => {
    const zip = new JSZip()
    const mediaFolder = zip.folder('media')

    const htmlContent = generateHTMLWithMediaPaths(components)

    zip.file('index.html', htmlContent)

    const mediaComponents = components.filter(
      (c) =>
        (c.type === 'IMAGE' || c.type === 'VIDEO') &&
        c.fileData?.startsWith('data:')
    )

    mediaComponents.forEach((comp) => {
      const base64 = comp.fileData!.split(',')[1];
      const fileExt =
        comp.fileName?.split('.').pop()?.toLowerCase() ||
        (comp.type === 'IMAGE' ? 'png' : 'mp4')
      const fileName = `media-${comp.id}.${fileExt}`

      const binary = atob(base64)
      const array = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i)
      }

      if (mediaFolder) {
        mediaFolder.file(fileName, array, { binary: true })
      }
    })

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'article.zip')
    })
  }, [components])

  return (
    <>
      <nav className='flex gap-10 px-8 py-3.5 text-sm font-semibold tracking-normal text-white bg-sky-700 rounded-none border border-solid border-neutral-200 max-md:px-5 max-md:max-w-full'>
        <button className='grow shrink w-[102px]'>Article Manager</button>
        <button className='grow shrink w-[108px]'>Article Navigator</button>
        <button className='grow shrink w-[105px]' onClick={handleDownloadHTML}>
          Download HTML
        </button>
        <button 
          className='grow shrink w-[105px]' 
          onClick={handlePreview}
          title="Preview the article"
        >
          Preview
        </button>
        <button 
          className='font-bold text-yellow-400' 
          onClick={handleSaveDraft}
          title="Save your current progress as a draft"
        >
          Save as Draft
        </button>
        {hasDraft && (
          <div className="relative">
            <select 
              className="font-bold text-green-400 bg-transparent border-none outline-none cursor-pointer"
              onChange={(e) => handleLoadDraft(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Load Draft</option>
              {drafts.map(draft => (
                <option key={draft.id} value={draft.id}>
                  {draft.name} ({draft.date})
                </option>
              ))}
            </select>
          </div>
        )}
      </nav>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Article Preview</h2>
              <button
                onClick={handleClosePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: generateHTMLWithMediaPaths(components) 
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        </div>
      )}

      {showDraftDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Save Draft</h2>
            <input
              type="text"
              placeholder="Enter draft name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDraftDialog(false)
                  setDraftName('')
                  setError(null)
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveDraft}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function generateHTMLWithMediaPaths(components: Component[]): string {
  const renderComponent = (comp: Component): string => {
    const style = comp.styles
      ? Object.entries(comp.styles)
          .map(([key, value]) => `${key}: ${value};`)
          .join(' ')
      : ''

    const content = comp.content || ''

    switch (comp.type) {
      case 'HEADLINE':
        return `<h1 style="${style}">${content}</h1>`
      case 'SUBHEADER':
        return `<h2 style="${style}">${content}</h2>`
      case 'BODY':
      case 'PARAGRAPH':
        return `<p style="${style}">${content}</p>`
      case 'QUOTE':
        return `<blockquote style="${style}">${content}</blockquote>`
      case 'IMAGE': {
        if (comp.fileData?.startsWith('data:')) {
          return `<img src="${comp.fileData}" style="${style}" alt="${content}" />`
        }
        const fileExt = comp.fileName?.split('.').pop()?.toLowerCase() || 'png'
        const fileName = `media-${comp.id}.${fileExt}`
        return `<img src="media/${fileName}" style="${style}" alt="${content}" />`
      }
      case 'VIDEO': {
        if (comp.fileData?.startsWith('data:')) {
          return `<video controls style="${style}">
                    <source src="${comp.fileData}" type="video/${comp.fileName?.split('.').pop()?.toLowerCase() || 'mp4'}" />
                    Your browser does not support the video tag.
                  </video>`
        }
        const fileExt = comp.fileName?.split('.').pop()?.toLowerCase() || 'mp4'
        const fileName = `media-${comp.id}.${fileExt}`
        return `<video controls style="${style}">
                  <source src="media/${fileName}" type="video/${fileExt}" />
                  Your browser does not support the video tag.
                </video>`
      }
      case '1COLUMN':
        return `<div class="column" style="${style}">
          ${comp.children?.map(renderComponent).join('') || ''}
        </div>`
      case '2COLUMN':
        return `<div class="row" style="${style}">
          ${comp.children?.map(renderComponent).join('') || ''}
        </div>`
      case 'CONTAINER':
        return `<div style="${style}">
          ${comp.children?.map(renderComponent).join('') || ''}
        </div>`
      default:
        return `<div style="${style}">${content}</div>`
    }
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Layout</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }
    .column {
      display: flex;
      flex-direction: column;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
    }
    img, video {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    ${components.map(renderComponent).join('')}
  </div>
</body>
</html>
`
}
