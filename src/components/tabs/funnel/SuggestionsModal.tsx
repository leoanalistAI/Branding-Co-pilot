import React, { useState, useEffect, FC } from 'react';
import { AppContext, FunnelStage, FunnelStageSuggestions, Source } from '@/types';
import { generateFunnelStageSuggestionsService } from '@/src/services/aiService';
import Spinner from '@/components/ui/Spinner';
import { XMarkIcon, SparklesIcon } from '@/components/icons/Icons';
import Sources from '@/components/ui/Sources';
import Button from '@/components/ui/Button';

interface SuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    stage: FunnelStage;
    appContext: AppContext;
    onUpdateSuggestions: (stageId: string, suggestions: FunnelStageSuggestions, sources: Source[]) => void;
}

const SuggestionsModal: FC<SuggestionsModalProps> = ({ isOpen, onClose, stage, appContext, onUpdateSuggestions }) => {
    const [suggestions, setSuggestions] = useState<FunnelStageSuggestions | null>(null);
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions(null);
        setSources([]);
        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandDna: null };
            const { data: result, sources: newSources } = await generateFunnelStageSuggestionsService(stage.title, stage.description, contextForApi);
            setSuggestions(result);
            setSources(newSources);
            // Update the parent component's state with the new suggestions
            onUpdateSuggestions(stage.id, result, newSources);
        } catch (err) {
            setError('Falha ao obter sugestões. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // If suggestions already exist on the stage object, display them
            if (stage.suggestions) {
                setSuggestions(stage.suggestions);
                setSources(stage.sources || []);
            } else {
                // Otherwise, fetch them for the first time
                fetchSuggestions();
            }
        } else {
            // Reset state when closing, but don't clear the persistent data on the stage object
            setSuggestions(null);
            setSources([]);
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, stage]);

    
    const handleGenerateOrUpdate = () => {
        fetchSuggestions();
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b border-neutral-800 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-blue-400" />
                        <div>
                            <h2 className="text-lg font-bold text-neutral-100">Sugestões da IA para: {stage.title}</h2>
                            <p className="text-sm text-neutral-400">Otimize esta etapa do seu funil.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                             <input
                                id="useGlobalContextFunnel"
                                type="checkbox"
                                checked={useGlobalContext}
                                onChange={(e) => setUseGlobalContext(e.target.checked)}
                                className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                disabled={isLoading}
                            />
                            <label htmlFor="useGlobalContextFunnel" className="ml-2 block text-sm text-neutral-300">
                                Usar Contexto Global da Marca
                            </label>
                        </div>
                        <Button onClick={handleGenerateOrUpdate} size="sm" isLoading={isLoading}>
                            {suggestions ? 'Atualizar Sugestões' : 'Gerar Sugestões'}
                        </Button>
                    </div>

                    {isLoading && <Spinner />}
                    {error && <p className="text-red-400 text-center py-8">{error}</p>}
                    {!isLoading && !error && suggestions && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-blue-400 border-b-2 border-blue-500/30 pb-1">Táticas de Marketing</h3>
                                    <ul className="list-disc list-inside text-neutral-300 text-sm space-y-2">
                                        {suggestions.tactics.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lime-400 border-b-2 border-lime-500/30 pb-1">Ideias de Conteúdo</h3>
                                    <ul className="list-disc list-inside text-neutral-300 text-sm space-y-2">
                                        {suggestions.contentIdeas.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-amber-400 border-b-2 border-amber-500/30 pb-1">Ferramentas Úteis</h3>
                                    <ul className="list-disc list-inside text-neutral-300 text-sm space-y-2">
                                        {suggestions.tools.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>
                            <Sources sources={sources} />
                        </div>
                    )}
                </div>
                 <footer className="p-4 border-t border-neutral-800 text-right flex-shrink-0">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 rounded-md font-semibold bg-neutral-800 text-neutral-100 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-neutral-500 transition duration-150 ease-in-out">
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SuggestionsModal;