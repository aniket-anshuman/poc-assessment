import {
  MoveIcon,
  Trash2Icon,
  SettingsIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Component } from './ContentPreview';

type TextType = 'HEADLINE' | 'SUBHEADER' | 'BODY' | 'PARAGRAPH' | 'QUOTE';
type LinkType = 'none' | 'external' | 'internal';

interface TextSettings {
  type: TextType;
  linkType: LinkType;
  url?: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
}

export const TextComponent: React.FC<{
  component: Component;
  onUpdate: (id: string, content: string) => void;
  onStyleChange: (id: string, styles: Record<string, string>) => void;
  onMove: (dragId: string, hoverId: string) => void;
  onDelete: (id: string) => void;
}> = ({ component, onUpdate, onStyleChange, onMove, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(component.content || '');
  const [styles, setStyles] = useState<any>({
    color: '#000000',
    fontFamily: 'Arial',
    ...component.styles,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
  const [settings, setSettings] = useState<TextSettings>({
    type: (component.type as TextType) || 'BODY',
    linkType: 'none',
    fontFamily: 'Arial',
    isBold: false,
    isItalic: false,
    isUnderlined: false,
  });
  const elementRef = useRef<HTMLElement>(null);
  const lastSelection = useRef<{ start: number; end: number } | null>(null);

  // Sync content when component prop changes
  useEffect(() => {
    setContent(component.content || '');
  }, [component.content]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && elementRef.current) {
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(elementRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;
      lastSelection.current = {
        start,
        end: start + range.toString().length,
      };
    }
  };

  const restoreSelection = () => {
    if (!lastSelection.current || !elementRef.current) return;

    const { start, end } = lastSelection.current;
    const textNodes = getTextNodes(elementRef.current);
    let charCount = 0;
    let startNode: Node | null = null;
    let endNode: Node | null = null;
    let startOffset = 0;
    let endOffset = 0;

    for (const node of textNodes) {
      const length = node.textContent?.length || 0;

      if (!startNode && charCount + length >= start) {
        startNode = node;
        startOffset = start - charCount;
      }

      if (!endNode && charCount + length >= end) {
        endNode = node;
        endOffset = end - charCount;
        break;
      }

      charCount += length;
    }

    if (startNode && endNode) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const getTextNodes = (node: Node): Node[] => {
    const textNodes: Node[] = [];
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode);
      currentNode = walker.nextNode();
    }

    return textNodes;
  };

  const handleContentChange = (e: React.FormEvent<HTMLElement>) => {
    saveSelection();
    const newContent = e.currentTarget.textContent || '';
    setContent(newContent);
    setTimeout(restoreSelection, 0);
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(component.id, content);
    onStyleChange(component.id, styles);
  };

  useEffect(() => {
    if (isEditing && elementRef.current) {
      if (!lastSelection.current) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(elementRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [isEditing]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id, type: component.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    hover: (item: { id: string; type: string }) => {
      if (item.id !== component.id) {
        onMove(item.id, component.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleSettingsChange = (newSettings: Partial<TextSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));

    const newStyles = {
      ...styles,
      fontFamily: newSettings.fontFamily || styles.fontFamily,
      fontWeight: newSettings.isBold ? 'bold' : 'normal',
      fontStyle: newSettings.isItalic ? 'italic' : 'normal',
      textDecoration: newSettings.isUnderlined ? 'underline' : 'none',
    };

    setStyles(newStyles);
    onStyleChange(component.id, newStyles);
  };

  const handleTypeChange = (newType: TextType) => {
    handleSettingsChange({ type: newType });
  };

  const defaultContent =
    {
      HEADLINE: '',
      SUBHEADER: 'Subheader Text',
      BODY: 'Body text. Click to edit...',
      PARAGRAPH: 'Paragraph text. Click to edit...',
      QUOTE: 'Quote text. Click to edit...',
    }[settings.type] || '';

  const fontFamilies = [
    'Arial',
    'Verdana',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Palatino',
    'Garamond',
  ];

  const textTypes: TextType[] = [
    'HEADLINE',
    'SUBHEADER',
    'BODY',
    'PARAGRAPH',
    'QUOTE',
  ];
  const linkTypes: LinkType[] = ['none', 'external', 'internal'];

  const Tag =
    {
      HEADLINE: 'h1',
      SUBHEADER: 'h2',
      BODY: 'p',
      PARAGRAPH: 'p',
      QUOTE: 'blockquote',
    }[settings.type] || 'div';

  const tagStyles =
    {
      HEADLINE: 'text-3xl font-bold my-2',
      SUBHEADER: 'text-xl font-semibold my-2',
      BODY: 'text-base my-2',
      PARAGRAPH: 'text-base my-4 leading-relaxed',
      QUOTE: 'text-base italic border-l-4 border-gray-300 pl-4 my-4',
    }[settings.type] || '';

  return (
    <div
      ref={drop}
      className={`relative group p-2 my-2 min-h-[40px] rounded-md border border-gray-200 ${
        isOver ? 'bg-blue-100' : ''
      } ${isEditing ? 'border-blue-300' : ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          ref={drag}
          className="cursor-move bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
        >
          <MoveIcon className="h-4 w-4 text-gray-500" />
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="cursor-pointer bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
        >
          <SettingsIcon className="h-4 w-4 text-gray-500" />
        </button>
        <button
          onClick={() => onDelete(component.id)}
          className="cursor-pointer bg-white rounded-full p-1 shadow-sm hover:bg-red-100 hover:text-red-500"
        >
          <Trash2Icon className="h-4 w-4 text-gray-500 hover:text-red-500" />
        </button>
      </div>

      {React.createElement(
        Tag,
        {
          ref: elementRef,
          onClick: handleFocus,
          contentEditable: isEditing,
          onBlur: handleBlur,
          onInput: handleContentChange,
          suppressContentEditableWarning: true,
          className: `outline-none ${tagStyles}`,
          style: styles,
          dangerouslySetInnerHTML: { __html: content || defaultContent },
        },
        null
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex border-b mb-4 shadow-md">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'content'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'style'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('style')}
              >
                Style
              </button>
            </div>

            {activeTab === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={settings.type}
                    onChange={(e) => handleTypeChange(e.target.value as TextType)}
                    className="w-full p-2 border bg-white text-black border-gray-300 rounded"
                  >
                    {textTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link
                  </label>
                  <select
                    value={settings.linkType}
                    onChange={(e) =>
                      handleSettingsChange({
                        linkType: e.target.value as LinkType,
                      })
                    }
                    className="w-full p-2 border bg-white text-black border-gray-300 rounded mb-2"
                  >
                    {linkTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === 'none'
                          ? 'No link'
                          : type === 'external'
                          ? 'External link'
                          : 'Internal link'}
                      </option>
                    ))}
                  </select>
                  {settings.linkType !== 'none' && (
                    <input
                      type="text"
                      placeholder={
                        settings.linkType === 'external'
                          ? 'Enter URL'
                          : 'Enter internal path'
                      }
                      value={settings.url || ''}
                      onChange={(e) =>
                        handleSettingsChange({ url: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  )}
                </div>

                <div className="flex items-center space-x-4 pt-2">
                  <button
                    onClick={() =>
                      handleSettingsChange({ isBold: !settings.isBold })
                    }
                    className={`p-2 rounded ${
                      settings.isBold ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                    title="Bold"
                  >
                    <BoldIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleSettingsChange({ isItalic: !settings.isItalic })
                    }
                    className={`p-2 rounded ${
                      settings.isItalic ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                    title="Italic"
                  >
                    <ItalicIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleSettingsChange({
                        isUnderlined: !settings.isUnderlined,
                      })
                    }
                    className={`p-2 rounded ${
                      settings.isUnderlined
                        ? 'bg-gray-200'
                        : 'hover:bg-gray-100'
                    }`}
                    title="Underline"
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {}}
                    className="p-2 rounded hover:bg-gray-100"
                    title="Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Family
                  </label>
                  <select
                    value={styles.fontFamily}
                    onChange={(e) =>
                      handleSettingsChange({ fontFamily: e.target.value })
                    }
                    className="w-full p-2 border bg-white text-black border-gray-300 rounded"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={styles.color || '#000000'}
                    onChange={(e) =>
                      setStyles({ ...styles, color: e.target.value })
                    }
                    className="w-full h-10 bg-white text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={parseInt(styles.fontSize || '16')}
                    onChange={(e) =>
                      setStyles({ ...styles, fontSize: `${e.target.value}px` })
                    }
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-500">
                    {styles.fontSize || '16px'}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onStyleChange(component.id, styles);
                  setShowSettings(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};