import React from "react";

interface KanbanColumnHeaderProps {
  title: string;
  count: number;
}

export const KanbanColumnHeader = ({ title, count }: KanbanColumnHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-sm">{title}</h2>
      <span className="bg-background text-secondary text-sm px-2 py-1 rounded">
        {count}
      </span>
    </div>
  );
};