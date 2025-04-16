'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface MarkdownEditorProps {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  readonly?: boolean;
}

export function MarkdownEditor({ initialContent, onSave, readonly = false }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (content === initialContent) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(content);
      toast.success('Analysis saved successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save analysis');
      console.error('Error saving analysis:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const insertMarkdown = (markdownSymbol: string, wrapSelection: boolean = true) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newContent = content;
    
    if (wrapSelection && selectedText) {
      // Wrap the selected text with markdown symbols
      newContent = 
        content.substring(0, start) + 
        markdownSymbol + 
        selectedText + 
        markdownSymbol + 
        content.substring(end);
      
      setContent(newContent);
    } else {
      // Just insert the markdown symbol
      newContent = 
        content.substring(0, start) + 
        markdownSymbol + 
        content.substring(end);
      
      setContent(newContent);
    }
    
    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus();
      if (wrapSelection && selectedText) {
        textarea.setSelectionRange(start + markdownSymbol.length, end + markdownSymbol.length);
      } else {
        const newCursorPos = start + markdownSymbol.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const insertLink = () => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const linkText = selectedText || 'link text';
    const newContent = 
      content.substring(0, start) + 
      `[${linkText}](url)` + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set focus and selection to the URL part
    setTimeout(() => {
      textarea.focus();
      const urlStart = start + linkText.length + 3;
      const urlEnd = urlStart + 3;
      textarea.setSelectionRange(urlStart, urlEnd);
    }, 0);
  };

  const insertCodeBlock = () => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      '```\n' + 
      (selectedText || 'code goes here') + 
      '\n```' + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set focus and position cursor appropriately
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        // Position after the code block
        const newPos = start + 4 + selectedText.length + 4;
        textarea.setSelectionRange(newPos, newPos);
      } else {
        // Position at 'code goes here' for easy replacement
        const codeStart = start + 4;
        const codeEnd = codeStart + 13;
        textarea.setSelectionRange(codeStart, codeEnd);
      }
    }, 0);
  };

  return (
    <div className="bg-base-100 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="bg-base-200 p-2 flex justify-between items-center border-b border-base-300">
        {isEditing ? (
          <>
            <div className="flex gap-2">
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => insertMarkdown('**', true)}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => insertMarkdown('*', true)}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => insertMarkdown('### ', false)}
                title="Heading"
              >
                H
              </button>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => insertMarkdown('- ', false)}
                title="List Item"
              >
                •
              </button>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={insertLink}
                title="Link"
              >
                🔗
              </button>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={insertCodeBlock}
                title="Code Block"
              >
                {'</>'}
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-sm btn-outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-sm btn-primary" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Saving...
                  </>
                ) : 'Save'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-medium">Analysis Content</div>
            {!readonly && (
              <button 
                className="btn btn-sm btn-outline" 
                onClick={handleEdit}
              >
                Edit
              </button>
            )}
          </>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <textarea
            id="markdown-editor"
            className="w-full h-full p-4 focus:outline-none font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ minHeight: '400px', resize: 'none' }}
          />
        ) : (
          <div className="prose max-w-none p-4 whitespace-pre-wrap">
            {content}
          </div>
        )}
      </div>
    </div>
  );
} 