import React, { useState, useEffect } from 'react';
import { generateProfileOptimizationSuggestionsService } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { UserCircleIcon, CheckBadgeIcon, ArrowPathIcon } from '../icons/Icons';

const platforms = ["LinkedIn", "Instagram", "X (Twitter)", "TikTok"];

const ProfileOptimizer: React.FC = () => {
    const appContext = useAppContext();
    const { addToHistory, getHistoryForTab, activeBrandId } = appContext;

    const [platform, setPlatform] = useState(platforms[0]);
    const [profileUrl, setProfileUrl] = useState('');
    const [result, setResult] = useState<any>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    const history = getHistoryForTab('profile');

    useEffect(() => {
        setResult(null);
        setError(null);
        setProfileUrl('');
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
            const { data, sources: apiSources } = await generateProfileOptimizationSuggestionsService(platform, profileUrl, contextForApi);
            setResult(data);
            setSources(apiSources);

            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Otimizador de Perfil',
                summary: `${platform} - ${profileUrl.substring(0, 25)}...`,
                inputs: { platform, profileUrl, useGlobalContext },
                result: { suggestions: data, sources: apiSources },
            };
            addToHistory('profile', newItem);
            setActiveHistoryId(newItem.id);
        } catch (err) {
            setError('Falha ao otimizar o perfil. Verifique a URL e tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setPlatform(item.inputs.platform);
        setProfileUrl(item.inputs.profileUrl);
        setUseGlobalContext(item.inputs.useGlobalContext);
        setResult(item.result.suggestions);
        setSources(item.result.sources || []);
        setActiveHistoryId(item.id);
        setError(null);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Otimizador de Perfil</h2>
                    <p className="text-neutral-400 mt-1">Receba análises e sugestões para otimizar seus perfis em redes sociais.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analisar Perfil</CardTitle>
                                <CardDescription>Selecione a plataforma e insira a URL do seu perfil.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="platform" className="block text-sm font-medium text-neutral-300 mb-1">Plataforma</label>
                                        <select
                                            id="platform"
                                            value={platform}
                                            onChange={(e) => setPlatform(e.target.value)}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        >
                                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="profileUrl" className="block text-sm font-medium text-neutral-300 mb-1">URL do Perfil</label>
                                        <input
                                            id="profileUrl"
                                            type="url"
                                            value={profileUrl}
                                            onChange={(e) => setProfileUrl(e.target.value)}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                            placeholder="https://www.linkedin.com/in/seu-perfil"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="useGlobalContextProfile"
                                            type="checkbox"
                                            checked={useGlobalContext}
                                            onChange={(e) => setUseGlobalContext(e.target.checked)}
                                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                        />
                                        <label htmlFor="useGlobalContextProfile" className="ml-2 block text-sm text-neutral-300">
                                            Usar Contexto Global da Marca
                                        </label>
                                    </div>
                                    <Button type="submit" isLoading={isLoading} className="w-full">Otimizar Perfil</Button>
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
                                    <CardTitle>Sugestões de Otimização</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><UserCircleIcon className="w-5 h-5" /> Foto de Perfil</h4>
                                        <p className="mt-1 text-neutral-300">{result.profilePicture}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><CheckBadgeIcon className="w-5 h-5" /> Nome de Usuário/Título</h4>
                                        <p className="mt-1 text-neutral-300">{result.usernameAndTitle}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><ArrowPathIcon className="w-5 h-5" /> Biografia</h4>
                                        <p className="mt-1 text-neutral-300">{result.bio}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2">Plano de Ação</h4>
                                        <ul className="list-decimal list-inside mt-2 text-neutral-300 space-y-1">
                                            {result.actionPlan.map((item: string, index: number) => <li key={index}>{item}</li>)}
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
                onDelete={(id) => appContext.removeFromHistory('profile', id)}
                onClear={() => appContext.clearHistory('profile')}
                activeItemId={activeHistoryId}
            />
        </div>
    );
};

export default ProfileOptimizer;