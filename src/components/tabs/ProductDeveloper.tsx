import React, { useState, useEffect } from 'react';
import { generateProductConceptService } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { CubeIcon, UserGroupIcon, WrenchScrewdriverIcon, CheckCircleIcon } from '../icons/Icons';

const ProductDeveloper: React.FC = () => {
    const appContext = useAppContext();
    const { addToHistory, getHistoryForTab, activeBrandId } = appContext;

    const [idea, setIdea] = useState('');
    const [result, setResult] = useState<any>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    const history = getHistoryForTab('product');

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
            const { data, sources: apiSources } = await generateProductConceptService(idea, contextForApi);
            setResult(data);
            setSources(apiSources);

            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Desenvolvimento de Produtos',
                summary: `Conceito para ${data.productName}`,
                inputs: { idea, useGlobalContext },
                result: { concept: data, sources: apiSources },
            };
            addToHistory('product', newItem);
            setActiveHistoryId(newItem.id);
        } catch (err) {
            setError('Falha ao desenvolver o conceito. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setIdea(item.inputs.idea);
        setUseGlobalContext(item.inputs.useGlobalContext);
        setResult(item.result.concept);
        setSources(item.result.sources || []);
        setActiveHistoryId(item.id);
        setError(null);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Desenvolvimento de Produtos</h2>
                    <p className="text-neutral-400 mt-1">Transforme suas ideias em conceitos de produtos ou serviços digitais.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerador de Conceitos</CardTitle>
                                <CardDescription>Descreva sua ideia para um produto ou serviço digital.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="idea" className="block text-sm font-medium text-neutral-300 mb-1">Sua Ideia</label>
                                        <textarea
                                            id="idea"
                                            value={idea}
                                            onChange={(e) => setIdea(e.target.value)}
                                            rows={5}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                            placeholder="Ex: Um app que usa IA para criar planos de estudo personalizados"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="useGlobalContextProduct"
                                            type="checkbox"
                                            checked={useGlobalContext}
                                            onChange={(e) => setUseGlobalContext(e.target.checked)}
                                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                        />
                                        <label htmlFor="useGlobalContextProduct" className="ml-2 block text-sm text-neutral-300">
                                            Usar Contexto Global da Marca
                                        </label>
                                    </div>
                                    <Button type="submit" isLoading={isLoading} className="w-full">Desenvolver Conceito</Button>
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
                                    <CardTitle className="flex items-center gap-2"><CubeIcon className="w-6 h-6 text-blue-400" /> {result.productName}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><UserGroupIcon className="w-5 h-5" /> Público-Alvo</h4>
                                        <p className="mt-1 text-neutral-300">{result.targetAudience}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5" /> Problema Resolvido</h4>
                                        <p className="mt-1 text-neutral-300">{result.problemSolved}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><WrenchScrewdriverIcon className="w-5 h-5" /> Funcionalidades Principais</h4>
                                        <ul className="list-disc list-inside mt-2 text-neutral-300 space-y-1">
                                            {result.coreFeatures.map((feature: string, index: number) => <li key={index}>{feature}</li>)}
                                        </ul>
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
                onDelete={(id) => appContext.removeFromHistory('product', id)}
                onClear={() => appContext.clearHistory('product')}
                activeItemId={activeHistoryId}
            />
        </div>
    );
};

export default ProductDeveloper;