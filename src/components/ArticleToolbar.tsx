import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useCallback } from 'react'
import { Component } from './ContentPreview'

export const ArticleToolbar: React.FC<{ components: Component[] }> = ({
  components,
}) => {
  const handleDownloadHTML = useCallback(() => {
    const zip = new JSZip()
    const mediaFolder = zip.folder('media')

    // Generate HTML with updated src for media components
    const htmlContent = generateHTMLWithMediaPaths(components)

    zip.file('index.html', htmlContent)

    // Add media files to media folder
    const mediaComponents = components.filter(
      (c) =>
        (c.type === 'IMAGE' || c.type === 'VIDEO') &&
        c.fileData?.startsWith('data:')
    )

    mediaComponents.forEach((comp) => {
      const base64 = comp.fileData!.split(',')[1] // strip data:mime;base64,
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
        console.log(`Added media file: ${fileName}`)
      }
    })

    // Generate and trigger download
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'article.zip')
    })
  }, [components])

  return (
    <nav className='flex gap-10 px-8 py-3.5 text-sm font-semibold tracking-normal text-white bg-sky-700 rounded-none border border-solid border-neutral-200 max-md:px-5 max-md:max-w-full'>
      <button className='grow shrink w-[102px]'>Article Manager</button>
      <button className='grow shrink w-[108px]'>Article Navigator</button>
      <button className='grow shrink w-[105px]' onClick={handleDownloadHTML}>
        Download HTML
      </button>
      <button className='font-bold text-yellow-400'>SAVE</button>
    </nav>
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
        const fileExt = comp.fileName?.split('.').pop()?.toLowerCase() || 'png'
        const fileName = `media-${comp.id}.${fileExt}`
        console.log(`Generating image path: ${fileName}`)
        return `<img src="media/${fileName}" style="${style}" alt="${content}" />`
      }
      case 'VIDEO': {
        const fileExt = comp.fileName?.split('.').pop()?.toLowerCase() || 'mp4'
        const fileName = `media-${comp.id}.${fileExt}`
        console.log(`Generating video path: ${fileName}`)
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
