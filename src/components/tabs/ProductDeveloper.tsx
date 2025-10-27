import React, { useState, useEffect, FC, FormEvent } from 'react';
import { developProductService } from '@/src/services/aiService';
import { AppContext, ProductIdea, Source, HistoryItem } from '@/types';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import HistorySidebar from '@/components/ui/HistorySidebar';
import Sources from '@/components/ui/Sources';
import { downloadAsMarkdown } from '@/utils/fileUtils';
import { ArrowDownTrayIcon } from '@/components/icons/Icons';

interface ProductDeveloperProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const ProductDeveloper: FC<ProductDeveloperProps> = ({ appContext, history }) => {
    const [productIdea, setProductIdea] = useState('');
    const [useGlobalContext, setUseGlobalContext] = useState(true);
    const [result, setResult] = useState<ProductIdea | null>(null);
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Clear results when active brand changes
    useEffect(() => {
        setResult(null);
        setSources([]);
    }, [appContext.activeBrandId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        setSources([]);
        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandFoundation: null };
            const { data: developedIdea, sources: newSources } = await developProductService(productIdea, contextForApi);
            setResult(developedIdea);
            setSources(newSources);
            appContext.addToHistory('product', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Desenvolvimento de Produto',
                summary: developedIdea.name,
                inputs: { productIdea, useGlobalContext },
                result: { data: developedIdea, sources: newSources },
            });
        } catch (err) {
            setError('Falha ao desenvolver a ideia de produto. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleHistorySelect = (item: any) => {
        setProductIdea(item.inputs.productIdea);
        setUseGlobalContext(item.inputs.useGlobalContext ?? true);
        setResult(item.result.data);
        setSources(item.result.sources || []);
    };
    
    const handleDownload = () => {
        if (!result) return;

        let content = `# Conceito de Produto: ${result.name}\n\n`;
        content += `## Descrição\n${result.description}\n\n`;
        content += `## Público-alvo\n${result.targetAudience}\n\n`;
        content += `## Principais Recursos/Módulos\n- ${result.keyFeatures.join('\n- ')}\n\n`;

        downloadAsMarkdown(content, `produto-${result.name.replace(/\s+/g, '-').toLowerCase()}`);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Crie produtos e/ou serviços</h2>
                    <p className="text-neutral-400 mt-1">Transforme uma ideia em um conceito de produto digital ou serviço para sua marca pessoal.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="productIdea" className="block text-sm font-medium text-neutral-300 mb-1">
                                        Ideia de Produto ou Serviço
                                    </label>
                                    <textarea
                                        id="productIdea"
                                        value={productIdea}
                                        onChange={(e) => setProductIdea(e.target.value)}
                                        rows={5}
                                        className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        placeholder="Ex: Uma mentoria para freelancers iniciantes"
                                        required
                                    />
                                </div>
                                <div className="flex items-center pt-2">
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
                                <Button type="submit" isLoading={isLoading} className="w-full !mt-4">
                                    Desenvolver Ideia
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="h-full">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400">{error}</p>}
                        {result && (
                            <Card className="h-full flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Conceito: {result.name}</CardTitle>
                                        <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                                            Baixar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <h4 className="font-semibold text-blue-400 mb-1">Descrição</h4>
                                            <p className="text-neutral-300">{result.description}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-blue-400 mb-1">Público-alvo</h4>
                                            <p className="text-neutral-300">{result.targetAudience}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-blue-400 mb-1">Principais Recursos/Módulos</h4>
                                            <ul className="list-disc list-inside text-neutral-300 space-y-1">
                                                {result.keyFeatures.map((feature, i) => <li key={i}>{feature}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                                <Sources sources={sources} />
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
            />
        </div>
    );
};

export default ProductDeveloper;