'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Prompt } from '@/lib/types';
import { listPrompts, createPrompt, updatePrompt, deletePrompt } from '@/lib/api/promptApi';
import toast from 'react-hot-toast';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setIsLoading(true);
    try {
      const promptsList = await listPrompts();
      setPrompts(promptsList);
    } catch (err) {
      toast.error('Erro ao carregar prompts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setNewPromptName(prompt.name);
    setNewPromptContent(prompt.content);
  };

  const handleCreatePrompt = async () => {
    if (!newPromptName || !newPromptContent) return;
    try {
      const newPrompt = await createPrompt(newPromptName, newPromptContent);
      toast.success('Prompt criado com sucesso!');
      setNewPromptName('');
      setNewPromptContent('');
      setSelectedPrompt(newPrompt);
      loadPrompts();
    } catch (err) {
      toast.error('Erro ao criar prompt.');
    }
  };

  const handleUpdatePrompt = async () => {
    if (!selectedPrompt || selectedPrompt.isPreset) return;
    try {
      await updatePrompt(selectedPrompt.id, newPromptName, newPromptContent);
      toast.success('Prompt atualizado!');
      loadPrompts();
    } catch (err) {
      toast.error('Erro ao atualizar prompt.');
    }
  };

  const handleDeletePrompt = async () => {
    if (!selectedPrompt || selectedPrompt.isPreset) return;
    try {
      await deletePrompt(selectedPrompt.id);
      toast.success('Prompt removido!');
      setSelectedPrompt(null);
      setNewPromptName('');
      setNewPromptContent('');
      loadPrompts();
    } catch (err) {
      toast.error('Erro ao remover prompt.');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gerenciador de Prompts</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-base-100 border border-base-300 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold">Prompts Disponíveis</h2>
              
              <div className="space-y-2">
                {isLoading ? (
                  <div>Carregando...</div>
                ) : prompts.length === 0 ? (
                  <div className="text-base-content/60">Nenhum prompt encontrado.</div>
                ) : (
                  prompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      className={`w-full text-left p-2 rounded border ${selectedPrompt?.id === prompt.id ? 'border-primary bg-primary/10' : 'border-base-200'} hover:bg-base-200`}
                      onClick={() => handleSelectPrompt(prompt)}
                    >
                      <div className="font-semibold">{prompt.name}</div>
                      <div className="text-xs text-base-content/60 line-clamp-2">{prompt.content.slice(0, 90)}{prompt.content.length > 90 ? '...' : ''}</div>
                      {prompt.isPreset && (
                        <span className="inline-block px-2 py-0.5 ml-2 text-xs rounded bg-base-200 text-base-content/60">Pré-definido</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-base-100 border border-base-300 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                {selectedPrompt ? 'Editar Prompt' : 'Criar Novo Prompt'}
              </h2>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Nome do Prompt</span>
                </label>
                <input
                  type="text"
                  placeholder="Digite o nome do prompt"
                  className="input input-bordered w-full"
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                  disabled={selectedPrompt?.isPreset}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Conteúdo do Prompt</span>
                </label>
                <textarea
                  placeholder="Digite as instruções do prompt..."
                  className="textarea textarea-bordered w-full h-40"
                  value={newPromptContent}
                  onChange={(e) => setNewPromptContent(e.target.value)}
                  disabled={selectedPrompt?.isPreset}
                />
              </div>

              <div className="flex justify-end gap-2">
                {selectedPrompt ? (
                  <>
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setSelectedPrompt(null);
                        setNewPromptName('');
                        setNewPromptContent('');
                      }}
                    >
                      Cancelar
                    </button>
                    {!selectedPrompt.isPreset && (
                      <>
                        <button className="btn btn-primary" onClick={handleUpdatePrompt}>Salvar Alterações</button>
                        <button className="btn btn-error" onClick={handleDeletePrompt}>Remover</button>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleCreatePrompt}
                    disabled={!newPromptName || !newPromptContent}
                  >
                    Criar Prompt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}