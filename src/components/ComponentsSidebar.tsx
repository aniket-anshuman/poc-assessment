import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ChevronDown, ChevronUp } from 'lucide-react';

const componentTypes = {
  text: [
    { type: 'HEADLINE', label: 'Headline' },
    { type: 'SUBHEADER', label: 'Sub-header' },
    { type: 'BODY', label: 'Body Text' }
  ],
  layouts: [
    { type: '1COLUMN', label: '1 Column' },
    { type: '2COLUMN', label: '2 Column' },
    { type: 'CONTAINER', label: 'Container' },
    { type: 'DIVIDER', label: 'Divider' }
  ],
  media: [
    { type: 'IMAGE', label: 'Image' },
    { type: 'VIDEO', label: 'Video' }
  ]
};

const DraggableComponent = ({ type, label }: { type: string, label: string }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div 
      //@ts-ignore
      ref={drag} 
      className="p-2 pl-6 my-1 border border-dashed border-gray-300 rounded cursor-move hover:bg-gray-50 transition-colors"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {label}
    </div>
  );
};

const DropdownSection = ({ title, items, isOpen, toggle }: {
  title: string;
  items: { type: string, label: string }[];
  isOpen: boolean;
  toggle: () => void;
}) => {
  return (
    <div className="mb-2">
      <button 
        onClick={toggle}
        className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 rounded"
      >
        <span className="font-medium text-neutral-900">{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="mt-1 pl-2">
          {items.map((comp) => (
            <DraggableComponent key={comp.type} type={comp.type} label={comp.label} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ComponentsSidebar: React.FC = () => {
  const [openSections, setOpenSections] = useState({
    text: true,
    layouts: true,
    media: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof openSections]
    }));
  };

  return (
    <nav className="grow pt-4 w-full text-sm font-medium tracking-normal bg-white border border-solid border-neutral-200 text-neutral-600 max-md:mt-10">
      <div className="flex flex-col px-4 max-md:px-2">
        <h2 className="self-start ml-2 mb-3 font-semibold text-neutral-900 text-lg">
          COMPONENTS
        </h2>
        
        <DropdownSection
          title="Text"
          items={componentTypes.text}
          isOpen={openSections.text}
          toggle={() => toggleSection('text')}
        />
        
        <hr className="my-2 border-gray-200" />
        
        <DropdownSection
          title="Layouts"
          items={componentTypes.layouts}
          isOpen={openSections.layouts}
          toggle={() => toggleSection('layouts')}
        />
        
        <hr className="my-2 border-gray-200" />
        
        <DropdownSection
          title="Media"
          items={componentTypes.media}
          isOpen={openSections.media}
          toggle={() => toggleSection('media')}
        />
      </div>
    </nav>
  );
};