import React, { useState, useEffect } from 'react';
import { generateBrandDnaService, generateAudienceAvatarService } from '../../services/geminiService';
import { AppContext, BrandDna, AudienceAvatar, Source, HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { downloadAsMarkdown } from '../../utils/fileUtils';
import { ArrowDownTrayIcon, UsersIcon } from '../icons/Icons';

interface FoundationAndPersonasProps {
    appContext: AppContext;
}

const FoundationAndPersonas: React.FC<FoundationAndPersonasProps> = ({ appContext }) => {
    const [name, setName] = useState('');
    const [purpose, setPurpose] = useState('');
    const [expertise, setExpertise] = useState('');
    const [audience, setAudience] = useState('');
    const [transformation, setTransformation] = useState('');
    const [personality, setPersonality] = useState('Profissional e Confiável');

    const [brandDnaResult, setBrandDnaResult] = useState<BrandDna | null>(null);
    const [avatarResult, setAvatarResult] = useState<AudienceAvatar | null>(null);
    const [dnaSources, setDnaSources] = useState<Source[]>([]);
    const [avatarSources, setAvatarSources] = useState<Source[]>([]);
    const [isLoadingDna, setIsLoadingDna] = useState(false);
    const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

    useEffect(() => {
        if (appContext.brandDna && appContext.activeBrandId) {
            setBrandDnaResult(appContext.brandDna);
            setActiveHistoryId(appContext.activeBrandId);
            const activeItem = appContext.history.dna.find(item => item.id === appContext.activeBrandId);
            if (activeItem) {
                setAvatarResult(activeItem.result.avatar || null);
            } else {
                 setAvatarResult(null);
            }
        } else {
            setBrandDnaResult(null);
            setAvatarResult(null);
            setActiveHistoryId(null);
        }
    }, [appContext.brandDna, appContext.activeBrandId, appContext.history.dna]);

    const handleDnaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingDna(true);
        setError(null);
        setBrandDnaResult(null);
        setAvatarResult(null);
        setDnaSources([]);
        
        try {
            const { data, sources } = await generateBrandDnaService(name, purpose, expertise, audience, transformation, personality);
            setBrandDnaResult(data);
            setDnaSources(sources);
            
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'DNA da Marca',
                summary: data.name,
                inputs: { name, purpose, expertise, audience, transformation, personality },
                result: { dna: data, sources, avatar: null },
            };
            appContext.addToHistory('dna', newItem);
            appContext.setActiveBrand(newItem);

        } catch (err) {
            setError('Falha ao gerar o DNA da Marca. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoadingDna(false);
        }
    };
    
    const handleAvatarSubmit = async () => {
        if (!brandDnaResult || !appContext.activeBrandId) return;
        setIsLoadingAvatar(true);
        setError(null);
        setAvatarResult(null);
        setAvatarSources([]);
        
        try {
            const { data, sources } = await generateAudienceAvatarService(brandDnaResult);
            setAvatarResult(data);
            setAvatarSources(sources);
            
            const currentItem = appContext.history.dna.find(item => item.id === appContext.activeBrandId);
            if (currentItem) {
                const updatedItem = {
                    ...currentItem,
                    result: {
                        ...currentItem.result,
                        avatar: data,
                        avatarSources: sources
                    }
                };
                appContext.addToHistory('dna', updatedItem);
            }

        } catch (err) {
            setError('Falha ao gerar o Avatar da Audiência. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoadingAvatar(false);
        }
    };

    const handleHistorySelect = (item: HistoryItem) => {
        const { inputs, result } = item;
        setName(inputs.name || '');
        setPurpose(inputs.purpose || '');
        setExpertise(inputs.expertise || '');
        setAudience(inputs.audience || '');
        setTransformation(inputs.transformation || '');
        setPersonality(inputs.personality || 'Profissional e Confiável');

        setBrandDnaResult(result.dna || null);
        setDnaSources(result.sources || []);
        setAvatarResult(result.avatar || null);
        setAvatarSources(result.avatarSources || []);
        
        appContext.setActiveBrand(item);
    };

    const handleDownload = () => {
        if (!brandDnaResult) return;

        let content = `# DNA da Marca: ${brandDnaResult.name}\n\n`;
        content += `## Declaração de Marca\n${brandDnaResult.brandStatement}\n\n`;
        content += `## Missão\n${brandDnaResult.mission}\n\n`;
        content += `## Pilares de Conteúdo\n- ${brandDnaResult.pillars.join('\n- ')}\n\n`;
        content += `## Voz e Personalidade\n${brandDnaResult.voiceAndPersonality}\n\n`;
        content += `## Palavras-chave\n- ${brandDnaResult.keywords.join('\n- ')}\n\n`;

        if (avatarResult) {
            content += `---\n\n`;
            content += `# Avatar da Audiência: ${avatarResult.name}\n\n`;
            content += `## Descrição\n${avatarResult.description}\n\n`;
            content += `## Sonhos e Aspirações\n- ${avatarResult.dreamsAndAspirations.join('\n- ')}\n\n`;
            content += `## Medos e Frustrações\n- ${avatarResult.fearsAndFrustrations.join('\n- ')}\n\n`;
            content += `## Pensamentos Diários\n- ${avatarResult.dailyThoughts.join('\n- ')}\n\n`;
            content += `## Desejos Secretos\n- ${avatarResult.secretWishes.join('\n- ')}\n\n`;
        }
        
        downloadAsMarkdown(content, `dna-marca-${brandDnaResult.name.replace(/\s+/g, '-').toLowerCase()}`);
    };

    const renderDnaForm = () => {
        const inputClasses = "w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors";
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Diagnóstico de Clareza</CardTitle>
                    <CardDescription>Preencha os campos abaixo para definir a base da sua marca.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleDnaSubmit} className="space-y-4">
                        <div><label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">Seu Nome / Nome do Projeto</label><input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required /></div>
                        <div><label htmlFor="purpose" className="block text-sm font-medium text-neutral-300 mb-1">Qual sua grande missão ou propósito?</label><textarea id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={3} className={inputClasses} required /></div>
                        <div><label htmlFor="expertise" className="block text-sm font-medium text-neutral-300 mb-1">Quais suas áreas de expertise?</label><textarea id="expertise" value={expertise} onChange={(e) => setExpertise(e.target.value)} rows={2} className={inputClasses} required /></div>
                        <div><label htmlFor="audience" className="block text-sm font-medium text-neutral-300 mb-1">Qual público você deseja impactar?</label><textarea id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} rows={2} className={inputClasses} required /></div>
                        <div><label htmlFor="transformation" className="block text-sm font-medium text-neutral-300 mb-1">Que transformação você oferece?</label><textarea id="transformation" value={transformation} onChange={(e) => setTransformation(e.target.value)} rows={3} className={inputClasses} required /></div>
                        <div>
                            <label htmlFor="personality" className="block text-sm font-medium text-neutral-300 mb-1">Qual a personalidade da sua comunicação?</label>
                            <select id="personality" value={personality} onChange={(e) => setPersonality(e.target.value)} className={inputClasses}>
                                <option>Profissional e Confiável</option><option>Amigável e Acessível</option><option>Divertido e Irreverente</option><option>Inspirador e Motivacional</option><option>Analítico e Direto</option>
                            </select>
                        </div>
                        <div className="flex gap-4 !mt-6">
                            <Button type="submit" isLoading={isLoadingDna} className="w-full">Gerar DNA da Marca</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        )
    };
    
    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">DNA da Marca Pessoal</h2>
                    <p className="text-neutral-400 mt-1">Defina a fundação da sua marca pessoal para guiar toda a sua comunicação.</p>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div>
                        {renderDnaForm()}
                    </div>

                    <div className="space-y-4">
                        {isLoadingDna && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        
                        {brandDnaResult && (
                            <Card className="flex flex-col">
                                <CardHeader>
                                     <div className="flex justify-between items-center">
                                        <CardTitle>{brandDnaResult.name}</CardTitle>
                                        <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                                            Baixar
                                        </Button>
                                    </div>
                                    <CardDescription>{brandDnaResult.brandStatement}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div><h4 className="font-semibold text-blue-400">Missão</h4><p>{brandDnaResult.mission}</p></div>
                                    <div><h4 className="font-semibold text-blue-400">Voz e Personalidade</h4><p>{brandDnaResult.voiceAndPersonality}</p></div>
                                    <div><h4 className="font-semibold text-blue-400">Pilares de Conteúdo</h4><ul className="list-disc list-inside">{brandDnaResult.pillars.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                                    <div><h4 className="font-semibold text-blue-400">Palavras-chave</h4><div className="flex flex-wrap gap-2 mt-1">{brandDnaResult.keywords.map((kw, i) => <span key={i} className="bg-neutral-800 text-neutral-300 text-xs px-2 py-1 rounded-full">{kw}</span>)}</div></div>
                                    <Sources sources={dnaSources} />
                                </CardContent>
                                <CardContent>
                                    <Button onClick={handleAvatarSubmit} isLoading={isLoadingAvatar} className="w-full" icon={<UsersIcon className="w-5 h-5"/>}>
                                        {avatarResult ? 'Gerar Outro Avatar' : 'Gerar Avatar da Audiência'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                        
                        {isLoadingAvatar && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {avatarResult && (
                             <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>Avatar: {avatarResult.name}</CardTitle>
                                    <CardDescription>{avatarResult.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div><h4 className="font-semibold text-blue-400">Sonhos e Aspirações</h4><ul className="list-disc list-inside">{avatarResult.dreamsAndAspirations.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                                    <div><h4 className="font-semibold text-blue-400">Medos e Frustrações</h4><ul className="list-disc list-inside">{avatarResult.fearsAndFrustrations.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                                    <div><h4 className="font-semibold text-blue-400">Pensamentos Diários</h4><ul className="list-disc list-inside">{avatarResult.dailyThoughts.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                                    <div><h4 className="font-semibold text-blue-400">Desejos Secretos</h4><ul className="list-disc list-inside">{avatarResult.secretWishes.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                                    <Sources sources={avatarSources} />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
             <HistorySidebar
                history={appContext.history.dna}
                onSelect={handleHistorySelect}
                onDelete={(id) => appContext.removeFromHistory('dna', id)}
                onClear={() => appContext.clearHistory('dna')}
                activeItemId={activeHistoryId}
            />
        </div>
    );
};

export default FoundationAndPersonas;
