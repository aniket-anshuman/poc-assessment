import { MoveIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Component } from "./ContentPreview";

export const MediaComponent: React.FC<{
  component: Component;
  onUpdate: (id: string, content: string) => void;
  onStyleChange: (id: string, styles: Record<string, string>) => void;
  onMove: (dragId: string, hoverId: string) => void;
  onDelete: (id: string) => void;
  onFileUpload: (id: string, fileData: File) => void;
}> = ({
  component,
  onUpdate,
  onStyleChange,
  onMove,
  onDelete,
  onFileUpload,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(component.fileData || "");
  const [styles, setStyles] = useState({
    ...component.styles,
  });

  useEffect(() => {
    setMediaUrl(component.fileData || "");
  }, [component.fileData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(component.id, file);
      setIsEditing(false);
    }
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: { id: component.id, type: component.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "COMPONENT",
    hover: (item: { id: string; type: string }) => {
      if (item.id !== component.id) {
        onMove(item.id, component.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const defaultContent =
    {
      IMAGE: "Click to upload image",
      VIDEO: "Click to upload video",
    }[component.type] || "";

  return (
    <div
      ref={drop}
      className={`relative group p-2 my-2 min-h-[100px] rounded-md border border-gray-200 flex items-center justify-center ${
        isOver ? "bg-blue-100" : ""
      } ${isEditing ? "border-blue-300" : ""}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        ...styles,
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
          onClick={() => onDelete(component.id)}
          className="cursor-pointer bg-white rounded-full p-1 shadow-sm hover:bg-red-100 hover:text-red-500"
        >
          <Trash2Icon className="h-4 w-4 text-gray-500 hover:text-red-500" />
        </button>
      </div>

      {mediaUrl ? (
        component.type === "IMAGE" ? (
          <img
            src={mediaUrl}
            alt="Uploaded content"
            className="max-w-full max-h-[300px] object-contain"
            onClick={() => setIsEditing(true)}
          />
        ) : (
          <video
            src={mediaUrl}
            controls
            className="max-w-full max-h-[300px]"
            onClick={() => setIsEditing(true)}
          />
        )
      ) : (
        <div
          className="text-gray-400 cursor-pointer p-4 border-2 border-dashed border-gray-300 rounded text-center"
          onClick={() => setIsEditing(true)}
        >
          {defaultContent}
        </div>
      )}

      {isEditing && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center p-4 z-10">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Upload {component.type.toLowerCase()}
          </label>
          <input
            type="file"
            accept={component.type === "IMAGE" ? "image/*" : "video/*"}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <button
            onClick={() => setIsEditing(false)}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
