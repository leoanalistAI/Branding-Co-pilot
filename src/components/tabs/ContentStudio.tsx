import React, { useState, useEffect } from 'react';
import { generateContentIdeasService } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { ClipboardDocumentIcon } from '../icons/Icons';

const contentFormats = ["Post de Blog", "Roteiro de Vídeo", "Post de Instagram", "Thread no X (Twitter)", "Newsletter"];

const ContentStudio: React.FC = () => {
    const appContext = useAppContext();
    const { addToHistory, getHistoryForTab, activeBrandId } = appContext;

    const [topic, setTopic] = useState('');
    const [format, setFormat] = useState(contentFormats[0]);
    const [result, setResult] = useState<any[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    const history = getHistoryForTab('contentStudio');

    useEffect(() => {
        setResult([]);
        setError(null);
        setTopic('');
        setActiveHistoryId(null);
    }, [activeBrandId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult([]);
        setSources([]);
        setActiveHistoryId(null);

        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandDna: null };
            const { data, sources: apiSources } = await generateContentIdeasService(topic, format, contextForApi);
            setResult(data);
            setSources(apiSources);

            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Estúdio de Conteúdo',
                summary: `${format} sobre ${topic.substring(0, 20)}...`,
                inputs: { topic, format, useGlobalContext },
                result: { ideas: data, sources: apiSources },
            };
            addToHistory('contentStudio', newItem);
            setActiveHistoryId(newItem.id);
        } catch (err) {
            setError('Falha ao gerar ideias de conteúdo. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setTopic(item.inputs.topic);
        setFormat(item.inputs.format);
        setUseGlobalContext(item.inputs.useGlobalContext);
        setResult(item.result.ideas);
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
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Estúdio de Conteúdo</h2>
                    <p className="text-neutral-400 mt-1">Crie posts, roteiros de vídeo, carrosséis e mais, alinhados com sua marca.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerador de Ideias</CardTitle>
                                <CardDescription>Defina um tópico e formato para gerar ideias de conteúdo.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">Tópico Central</label>
                                        <input
                                            id="topic"
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                            placeholder="Ex: Como usar IA para marketing"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="format" className="block text-sm font-medium text-neutral-300 mb-1">Formato do Conteúdo</label>
                                        <select
                                            id="format"
                                            value={format}
                                            onChange={(e) => setFormat(e.target.value)}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        >
                                            {contentFormats.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="useGlobalContextContent"
                                            type="checkbox"
                                            checked={useGlobalContext}
                                            onChange={(e) => setUseGlobalContext(e.target.checked)}
                                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                        />
                                        <label htmlFor="useGlobalContextContent" className="ml-2 block text-sm text-neutral-300">
                                            Usar Contexto Global da Marca
                                        </label>
                                    </div>
                                    <Button type="submit" isLoading={isLoading} className="w-full">Gerar Ideias</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {result.length > 0 && (
                            <div className="space-y-4">
                                {result.map((idea, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <CardTitle className="flex justify-between items-start">
                                                <span>{idea.title}</span>
                                                <button
                                                    onClick={() => handleCopy(idea.description, index)}
                                                    className="text-neutral-400 hover:text-white transition-colors p-1"
                                                    title="Copiar descrição"
                                                >
                                                    <ClipboardDocumentIcon className="w-5 h-5" />
                                                </button>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-neutral-300 mb-3">{idea.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {idea.hashtags.map((tag: string, i: number) => (
                                                    <span key={i} className="bg-neutral-800 text-neutral-300 text-xs px-2 py-1 rounded-full">{tag}</span>
                                                ))}
                                            </div>
                                            {copiedIndex === index && <p className="text-green-400 text-xs mt-2">Copiado!</p>}
                                        </CardContent>
                                    </Card>
                                ))}
                                <Sources sources={sources} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <HistorySidebar
                history={history}
                onSelect={handleHistorySelect}
                onDelete={(id) => appContext.removeFromHistory('contentStudio', id)}
                onClear={() => appContext.clearHistory('contentStudio')}
                activeItemId={activeHistoryId}
            />
        </div>
    );
};

export default ContentStudio;