'use client';

import { useState, useEffect } from 'react';
import { Prompt } from '@/lib/types';
import { listPrompts } from '@/lib/api/promptApi';

interface PromptSelectorProps {
  onSelect: (prompt: Prompt) => void;
  selectedPromptId?: string;
}

export function PromptSelector({ onSelect, selectedPromptId }: PromptSelectorProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setIsLoading(true);
      const data = await listPrompts();
      setPrompts(data);
      
      // Select first prompt if none selected
      if (!selectedPromptId && data.length > 0) {
        onSelect(data[0]);
      } else if (selectedPromptId) {
        const selected = data.find(p => p.id === selectedPromptId);
        if (selected) {
          onSelect(selected);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading loading-spinner"></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (prompts.length === 0) {
    return (
      <div className="alert alert-warning">
        <p>No prompts available. Please create a prompt first.</p>
      </div>
    );
  }

  // Group prompts by preset vs user-created
  const presetPrompts = prompts.filter(p => p.isPreset);
  const userPrompts = prompts.filter(p => !p.isPreset);

  return (
    <div className="space-y-4">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium">Select Analysis Prompt</span>
        </label>
        
        <select 
          className="select select-bordered w-full"
          value={selectedPromptId || ''}
          onChange={(e) => {
            const selected = prompts.find(p => p.id === e.target.value);
            if (selected) onSelect(selected);
          }}
        >
          <optgroup label="Preset Prompts">
            {presetPrompts.map(prompt => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.name}
              </option>
            ))}
          </optgroup>
          
          {userPrompts.length > 0 && (
            <optgroup label="Your Prompts">
              {userPrompts.map(prompt => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
      
      {prompts.find(p => p.id === selectedPromptId)?.content && (
        <div className="bg-base-200 p-3 rounded-lg border border-base-300">
          <p className="text-sm font-mono whitespace-pre-wrap">
            {prompts.find(p => p.id === selectedPromptId)?.content}
          </p>
        </div>
      )}
    </div>
  );
} 