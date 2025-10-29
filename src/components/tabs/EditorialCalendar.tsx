import React, { useState, useEffect } from 'react';
import { generateEditorialCalendarService } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';

const EditorialCalendar: React.FC = () => {
    const appContext = useAppContext();
    const { addToHistory, getHistoryForTab, activeBrandId } = appContext;

    const [theme, setTheme] = useState('');
    const [result, setResult] = useState<any[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    const history = getHistoryForTab('calendar');

    useEffect(() => {
        setResult([]);
        setError(null);
        setTheme('');
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
            const { data, sources: apiSources } = await generateEditorialCalendarService(theme, contextForApi);
            setResult(data);
            setSources(apiSources);

            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Calendário Editorial',
                summary: `Calendário sobre ${theme.substring(0, 25)}...`,
                inputs: { theme, useGlobalContext },
                result: { calendar: data, sources: apiSources },
            };
            addToHistory('calendar', newItem);
            setActiveHistoryId(newItem.id);
        } catch (err) {
            setError('Falha ao gerar o calendário. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setTheme(item.inputs.theme);
        setUseGlobalContext(item.inputs.useGlobalContext);
        setResult(item.result.calendar);
        setSources(item.result.sources || []);
        setActiveHistoryId(item.id);
        setError(null);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Calendário Editorial</h2>
                    <p className="text-neutral-400 mt-1">Planeje seu conteúdo semanal com base em um tema central.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Planejador Semanal</CardTitle>
                                <CardDescription>Insira o tema central da sua semana.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="theme" className="block text-sm font-medium text-neutral-300 mb-1">Tema Central</label>
                                        <input
                                            id="theme"
                                            type="text"
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value)}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                            placeholder="Ex: Lançamento do meu novo e-book"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="useGlobalContextCalendar"
                                            type="checkbox"
                                            checked={useGlobalContext}
                                            onChange={(e) => setUseGlobalContext(e.target.checked)}
                                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                        />
                                        <label htmlFor="useGlobalContextCalendar" className="ml-2 block text-sm text-neutral-300">
                                            Usar Contexto Global da Marca
                                        </label>
                                    </div>
                                    <Button type="submit" isLoading={isLoading} className="w-full">Gerar Calendário</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {result.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sugestão de Calendário Semanal</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {result.map((item, index) => (
                                            <div key={index} className="p-3 bg-neutral-900 rounded-lg">
                                                <p className="font-bold text-blue-400">{item.day}</p>
                                                <p className="text-neutral-200 mt-1"><span className="font-semibold">Formato:</span> {item.format}</p>
                                                <p className="text-neutral-300"><span className="font-semibold">Tópico:</span> {item.topic}</p>
                                            </div>
                                        ))}
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
                onDelete={(id) => appContext.removeFromHistory('calendar', id)}
                onClear={() => appContext.clearHistory('calendar')}
                activeItemId={activeHistoryId}
            />
        </div>
    );
};

export default EditorialCalendar;