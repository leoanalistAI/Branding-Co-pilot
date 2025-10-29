import React, { useState, useEffect } from 'react';
import { analyzeVideoService } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { ChatBubbleBottomCenterTextIcon, UserGroupIcon, MegaphoneIcon } from '../icons/Icons';

const VideoAnalyzer: React.FC = () => {
    const appContext = useAppContext();
    const { addToHistory, getHistoryForTab, activeBrandId } = appContext;

    const [videoUrl, setVideoUrl] = useState('');
    const [result, setResult] = useState<any>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    const history = getHistoryForTab('video');

    useEffect(() => {
        setResult(null);
        setError(null);
        setVideoUrl('');
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
            const { data, sources: apiSources } = await analyzeVideoService(videoUrl, contextForApi);
            setResult(data);
            setSources(apiSources);

            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Analisador de Vídeo',
                summary: `Análise de ${videoUrl.substring(0, 30)}...`,
                inputs: { videoUrl, useGlobalContext },
                result: { analysis: data, sources: apiSources },
            };
            addToHistory('video', newItem);
            setActiveHistoryId(newItem.id);
        } catch (err) {
            setError('Falha ao analisar o vídeo. Verifique a URL e tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setVideoUrl(item.inputs.videoUrl);
        setUseGlobalContext(item.inputs.useGlobalContext);
        setResult(item.result.analysis);
        setSources(item.result.sources || []);
        setActiveHistoryId(item.id);
        setError(null);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Analisador de Vídeo</h2>
                    <p className="text-neutral-400 mt-1">Extraia insights de marketing a partir de vídeos do YouTube, TikTok, etc.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analisar Vídeo</CardTitle>
                                <CardDescription>Insira a URL do vídeo que deseja analisar.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="videoUrl" className="block text-sm font-medium text-neutral-300 mb-1">URL do Vídeo</label>
                                        <input
                                            id="videoUrl"
                                            type="url"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="useGlobalContextVideo"
                                            type="checkbox"
                                            checked={useGlobalContext}
                                            onChange={(e) => setUseGlobalContext(e.target.checked)}
                                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                        />
                                        <label htmlFor="useGlobalContextVideo" className="ml-2 block text-sm text-neutral-300">
                                            Usar Contexto Global da Marca
                                        </label>
                                    </div>
                                    <Button type="submit" isLoading={isLoading} className="w-full">Analisar Vídeo</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {result && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Insights do Vídeo</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><ChatBubbleBottomCenterTextIcon className="w-5 h-5" /> Mensagem Principal</h4>
                                        <p className="mt-1 text-neutral-300">{result.mainMessage}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><UserGroupIcon className="w-5 h-5" /> Público-Alvo</h4>
                                        <p className="mt-1 text-neutral-300">{result.targetAudience}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><MegaphoneIcon className="w-5 h-5" /> Chamada para Ação (CTA)</h4>
                                        <p className="mt-1 text-neutral-300">{result.mainCTA}</p>
                                    </div>
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
                onDelete={(id) => appContext.removeFromHistory('video', id)}
                onClear={() => appContext.clearHistory('video')}
                activeItemId={activeHistoryId}
            />
        </div>
    );
};

export default VideoAnalyzer;