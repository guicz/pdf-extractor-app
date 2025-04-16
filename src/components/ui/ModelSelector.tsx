'use client';

import { useState } from 'react';
import { LLMModel } from '@/lib/types';
import { APP_CONFIG } from '@/lib/config/environment';

interface ModelSelectorProps {
  onSelect: (model: LLMModel) => void;
  selectedModel?: LLMModel;
  disabled?: boolean;
}

export function ModelSelector({ onSelect, selectedModel, disabled = false }: ModelSelectorProps) {
  const [selected, setSelected] = useState<LLMModel>(selectedModel || 'claude-3-7-sonnet-20250219');

  const handleChange = (model: LLMModel) => {
    setSelected(model);
    onSelect(model);
  };

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Select AI Model</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {APP_CONFIG.AVAILABLE_MODELS.filter(model => ['claude-3-7-sonnet-20250219', 'o3-mini'].includes(model.id)).map((model) => (
            <div key={model.id} className="flex items-center">
              <input
                type="radio"
                id={model.id}
                name="model"
                value={model.id}
                checked={selected === model.id}
                onChange={() => handleChange(model.id as LLMModel)}
                disabled={disabled}
                className="radio radio-primary mr-2"
              />
              <div>
                <label htmlFor={model.id} className="cursor-pointer">
                  <span className="font-medium">{model.name}</span>
                </label>
                <p className="text-xs mt-2 text-base-content/70">{model.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-base-content/70">
        <p>
          <span className="font-medium">Claude Sonnet 3.7:</span> Superior for detailed analysis, better at understanding complex documents
        </p>
        <p>
          <span className="font-medium">OpenAI o3-mini:</span> Faster processing speed, more economical for simple documents
        </p>
      </div>
    </div>
  );
} 