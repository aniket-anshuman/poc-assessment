import { useState } from 'react';
import { EditorHeader } from "./EditorHeader";
import { ComponentsSidebar } from "./ComponentsSidebar";
import { ArticleToolbar } from "./ArticleToolbar";
import { Component, ContentPreview } from "./ContentPreview";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function LayoutCreateEmptyTemplate() {
  const [components, setComponents] = useState<Component[]>([]);

  const handleLoadDraft = (loadedComponents: Component[]) => {
    setComponents(loadedComponents);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white">
        <div className="py-px w-full border border-solid bg-neutral-100 border-neutral-200 max-md:max-w-full">
          <EditorHeader />
          <div className="z-10 w-full max-w-[1338px] max-md:max-w-full">
            <div className="flex gap-5 max-md:flex-col">
              <div className="w-[19%] max-md:ml-0 max-md:w-full">
                <ComponentsSidebar />
              </div>
              <div className="ml-5 w-[81%] max-md:ml-0 max-md:w-full">
                <div className="w-full max-md:mt-10 max-md:max-w-full">
                  <ArticleToolbar 
                    components={components} 
                    onLoadDraft={handleLoadDraft}
                  />
                  <ContentPreview components={components} setComponents={setComponents} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}