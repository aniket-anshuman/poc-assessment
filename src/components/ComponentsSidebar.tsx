import React from 'react';
import { useDrag } from 'react-dnd';

const componentTypes = [
  { type: 'HEADLINE', label: 'Headline' },
  { type: 'SUBHEADER', label: 'Sub-header' },
  { type: 'BODY', label: 'Body Text' },
  { type: '1COLUMN', label: '1 Column' },
  { type: '2COLUMN', label: '2 Column' },
  { type: 'CONTAINER', label: 'Container' },
  { type: 'DIVIDER', label: 'Divider' }
];

const DraggableComponent = ({ type, label }: { type: string, label: string }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const ref = React.useRef<HTMLDivElement>(null);
  drag(ref);

  return (
    <div 
      ref={ref} 
      className="p-2 my-2 border border-dashed border-gray-300 rounded cursor-move hover:bg-gray-50"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {label}
    </div>
  );
};

export const ComponentsSidebar: React.FC = () => {
  return (
    <nav className="grow pt-7 w-full text-sm font-medium tracking-normal bg-white border border-solid border-neutral-200 text-neutral-600 max-md:mt-10">
      <div className="flex flex-col px-6 whitespace-nowrap max-md:px-5">
        <h2 className="self-start ml-3 font-semibold text-neutral-900 max-md:ml-2.5">
          COMPONENTS
        </h2>
        <hr className="shrink-0 mt-2.5 h-px border border-gray-200 border-solid" />
        
        <span className="self-start mt-4 ml-3 font-medium text-neutral-900 max-md:ml-2.5">Text</span>
        {componentTypes.slice(0, 3).map((comp) => (
          <DraggableComponent key={comp.type} type={comp.type} label={comp.label} />
        ))}
        
        <hr className="shrink-0 mt-3.5 h-px border border-gray-200 border-solid" />
        <span className="self-start mt-4 ml-3 font-medium text-neutral-900 max-md:ml-2.5">Layouts</span>
        {componentTypes.slice(3).map((comp) => (
          <DraggableComponent key={comp.type} type={comp.type} label={comp.label} />
        ))}
        
        <hr className="shrink-0 mt-3.5 h-px border border-gray-200 border-solid" />
        <span className="self-start mt-4 ml-3 font-medium text-neutral-900 max-md:ml-2.5">Media</span>
        <div className="p-2 my-2 text-gray-400">Coming soon</div>
      </div>
    </nav>
  );
};