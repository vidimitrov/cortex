import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface KnowledgePieceProps {
  content: string;
  isUpdating: boolean;
}

export default function KnowledgePiece({
  content,
  isUpdating,
}: KnowledgePieceProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-white">Research Outcome</h2>
          <span
            className={`text-sm ${
              isUpdating ? "text-green-500" : "text-gray-400"
            } transition-colors`}
          >
            {isUpdating ? "Saving..." : "Up to date"}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isExpanded ? "max-h-[1000px]" : "max-h-20"
        }`}
      >
        <p className="text-gray-300 whitespace-pre-wrap">{content}</p>
      </div>
      {!isExpanded && content.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-dark-surface to-transparent pointer-events-none" />
      )}
    </div>
  );
}
