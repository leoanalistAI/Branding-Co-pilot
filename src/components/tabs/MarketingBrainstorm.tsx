import React, { useState, useEffect } from 'react';
import { generateMarketingAnglesService } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';

const MarketingBrainstorm: React.FC = () => {
    const appContext = useAppContext();
    const { addToHistory, getHistoryForTab, activeBrandId } = appContext;

    const [productInfo, setProductInfo] = useState('');
    const [result, setResult] = useState<any[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    const history = getHistoryForTab('brainstorm');

    useEffect(() => {
        setResult([]);
        setError(null);
        setProductInfo('');
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
            const { data, sources: apiSources } = await generateMarketingAnglesService(productInfo, contextForApi);
            setResult(data);
            setSources(apiSources);

            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Brainstorm de Marca',
                summary: `Ângulos para ${productInfo.substring(0, 25)}...`,
                inputs: { productInfo, useGlobalContext },
                result: { angles: data, sources: apiSources },
            };
            addToHistory('brainstorm', newItem);
            setActiveHistoryId(newItem.id);
        } catch (err) {
            setError('Falha ao gerar ângulos de marketing. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setProductInfo(item.inputs.productInfo);
        setUseGlobalContext(item.inputs.useGlobalContext);
        setResult(item.result.angles);
        setSources(item.result.sources || []);
        setActiveHistoryId(item.id);
        setError(null);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Brainstorm de Marca</h2>
                    <p className="text-neutral-400 mt-1">Gere ideias criativas e ângulos de marketing para o crescimento da sua marca.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerador de Ângulos</CardTitle>
                                <CardDescription>Descreva seu produto ou serviço para encontrar ângulos de marketing.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="productInfo" className="block text-sm font-medium text-neutral-300 mb-1">Produto/Serviço</label>
                                        <textarea
                                            id="productInfo"
                                            value={productInfo}
                                            onChange={(e) => setProductInfo(e.target.value)}
                                            rows={5}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                            placeholder="Ex: Um curso online sobre como investir em criptomoedas para iniciantes"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="useGlobalContextBrainstorm"
                                            type="checkbox"
                                            checked={useGlobalContext}
                                            onChange={(e) => setUseGlobalContext(e.target.checked)}
                                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                        />
                                        <label htmlFor="useGlobalContextBrainstorm" className="ml-2 block text-sm text-neutral-300">
                                            Usar Contexto Global da Marca
                                        </label>
                                    </div>
                                    <Button type="submit" isLoading={isLoading} className="w-full">Gerar Ângulos</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {result.length > 0 && (
                            <div className="space-y-4">
                                {result.map((angle, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <CardTitle>{angle.angleName}</CardTitle>
                                            <CardDescription>{angle.headline}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm"><span className="font-semibold text-blue-400">Público-Alvo:</span> {angle.targetAudience}</p>
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
                onDelete={(id) => appContext.removeFromHistory('brainstorm', id)}
                onClear={() => appContext.clearHistory('brainstorm')}
                activeItemId={activeHistoryId}
            />
        </div>
    );
};

export default MarketingBrainstorm;