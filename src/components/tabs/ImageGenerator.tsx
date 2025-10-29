import React, { useState, useEffect } from 'react';
import { generateImagePromptService } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { ClipboardDocumentIcon } from '../icons/Icons';

const styles = ["Fotorrealista", "Arte Digital", "Ilustração Vetorial", "Fantasia", "Cyberpunk", "Minimalista"];

const ImageGenerator: React.FC = () => {
    const appContext = useAppContext();
    const { addToHistory, getHistoryForTab, activeBrandId } = appContext;

    const [idea, setIdea] = useState('');
    const [style, setStyle] = useState(styles[0]);
    const [result, setResult] = useState<any>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    const history = getHistoryForTab('image');

    useEffect(() => {
        setResult(null);
        setError(null);
        setIdea('');
        setActiveHistoryId(null);
    }, [activeBrandId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        setSources([]);
        setActiveHistoryId(null);

        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandDna: null };
            const { data, sources: apiSources } = await generateImagePromptService(idea, style, contextForApi);
            setResult(data);
            setSources(apiSources);

            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Gerador de Imagens',
                summary: `Prompt para "${idea.substring(0, 20)}..."`,
                inputs: { idea, style, useGlobalContext },
                result: { prompts: data, sources: apiSources },
            };
            addToHistory('image', newItem);
            setActiveHistoryId(newItem.id);
        } catch (err) {
            setError('Falha ao gerar prompts. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setIdea(item.inputs.idea);
        setStyle(item.inputs.style);
        setUseGlobalContext(item.inputs.useGlobalContext);
        setResult(item.result.prompts);
        setSources(item.result.sources || []);
        setActiveHistoryId(item.id);
        setError(null);
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Gerador de Imagens</h2>
                    <p className="text-neutral-400 mt-1">Crie prompts para gerar imagens para seus posts e anúncios usando IA.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerador de Prompts</CardTitle>
                                <CardDescription>Descreva sua ideia e escolha um estilo para criar prompts detalhados.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="idea" className="block text-sm font-medium text-neutral-300 mb-1">Ideia da Imagem</label>
                                        <textarea
                                            id="idea"
                                            value={idea}
                                            onChange={(e) => setIdea(e.target.value)}
                                            rows={4}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                            placeholder="Ex: Um astronauta meditando em um jardim de bonsais em Marte"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="style" className="block text-sm font-medium text-neutral-300 mb-1">Estilo Visual</label>
                                        <select
                                            id="style"
                                            value={style}
                                            onChange={(e) => setStyle(e.target.value)}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        >
                                            {styles.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="useGlobalContextImage"
                                            type="checkbox"
                                            checked={useGlobalContext}
                                            onChange={(e) => setUseGlobalContext(e.target.checked)}
                                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                        />
                                        <label htmlFor="useGlobalContextImage" className="ml-2 block text-sm text-neutral-300">
                                            Usar Contexto Global da Marca
                                        </label>
                                    </div>
                                    <Button type="submit" isLoading={isLoading} className="w-full">Gerar Prompts</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {result && result.prompts && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Prompts Gerados</CardTitle>
                                    <CardDescription>Copie e cole estes prompts em seu gerador de imagens favorito.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {result.prompts.map((prompt: string, index: number) => (
                                        <div key={index} className="p-3 bg-neutral-900 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm text-neutral-300">{prompt}</p>
                                                <button
                                                    onClick={() => handleCopy(prompt, index)}
                                                    className="text-neutral-400 hover:text-white transition-colors p-1 flex-shrink-0 ml-2"
                                                    title="Copiar prompt"
                                                >
                                                    <ClipboardDocumentIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {copiedIndex === index && <p className="text-green-400 text-xs mt-2">Copiado!</p>}
                                        </div>
                                    ))}
                                    <Sources sources={sources} />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            <HistorySidebar
                history={history}
                onSelect={handleHistorySelect}
                onDelete={(id) => appContext.removeFromHistory('image', id)}
                onClear={() => appContext.clearHistory('image')}
                activeItemId={activeHistoryId}
            />
        </div>
    );
};

export default ImageGenerator;