import { useState } from 'react';
import { Card } from '../common/Card';

type LLMModel = 'claude-3-7-sonnet-20250219' | 'o3-mini';

interface ModelCardProps {
  model: LLMModel;
  name: string;
  description: string;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
}

function ModelCard({ 
  model, 
  name, 
  description, 
  features, 
  isSelected, 
  onSelect 
}: ModelCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-base-200 ${
        isSelected ? 'border-primary bg-primary/5' : 'border-base-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-lg">{name}</h3>
        <div className="form-control">
          <input 
            type="radio"
            className="radio radio-primary radio-sm"
            checked={isSelected}
            onChange={onSelect}
          />
        </div>
      </div>
      <p className="text-sm text-base-content/70 mb-3">{description}</p>
      <div className="space-y-1">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-success mr-2 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ModelSelectorProps {
  onSelect: (model: LLMModel) => void;
  selectedModel?: LLMModel;
  className?: string;
}

export function ModelSelector({
  onSelect,
  selectedModel = 'claude-3-7-sonnet-20250219',
  className = '',
}: ModelSelectorProps) {
  const models: Array<{
    id: LLMModel;
    name: string;
    description: string;
    features: string[];
  }> = [
    {
      id: 'claude-3-7-sonnet-20250219',
      name: 'Claude Sonnet 3.7',
      description: 'Melhor para análise complexa e raciocínio com contexto mais longo.',
      features: [
        'Maior precisão em tarefas complexas',
        'Melhor compreensão de contexto',
        'Respostas mais detalhadas',
        'Processamento um pouco mais lento'
      ]
    },
    {
      id: 'o3-mini',
      name: 'OpenAI o3-mini',
      description: 'Rápido e econômico para tarefas simples e documentos curtos.',
      features: [
        'Respostas mais concisas',
        'Ótimo para extrações simples',
        'Menor uso de tokens'
      ]
    }
  ];

  return (
    <Card title="Selecione o Modelo de IA" className={className}>
      <div className="grid gap-4">
        {models.map((model) => (
          <div key={model.id} className="flex items-center gap-3">
            <input
              type="radio"
              id={model.id}
              name="model"
              value={model.id}
              checked={selectedModel === model.id}
              onChange={() => onSelect(model.id)}
            />
            <div>
              <label htmlFor={model.id} className="font-medium cursor-pointer">
                {model.name}
              </label>
              <p className="text-xs text-base-content/70">{model.description}</p>
              <ul className="list-disc ml-4 text-xs text-base-content/60">
                {model.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}