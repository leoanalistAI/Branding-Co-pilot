import React, { useState, useEffect, FC, FormEvent } from 'react';
import { generateBrandDnaService, generateAudienceAvatarService } from '@/src/services/aiService';
import { AppContext, BrandDna, AudienceAvatar, GroundedResponse, HistoryItem } from '@/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Sources from '@/components/ui/Sources';
import HistorySidebar from '@/components/ui/HistorySidebar';

interface FoundationAndPersonasProps {
    appContext: AppContext;
}

const FoundationAndPersonas: FC<FoundationAndPersonasProps> = ({ appContext }) => {
    const [name, setName] = useState('');
    const [purpose, setPurpose] = useState('');
    const [expertise, setExpertise] = useState('');
    const [audience, setAudience] = useState('');
    const [transformation, setTransformation] = useState('');
    const [personality, setPersonality] = useState('');

    const [brandDna, setBrandDna] = useState<GroundedResponse<BrandDna> | null>(null);
    const [audienceAvatar, setAudienceAvatar] = useState<GroundedResponse<AudienceAvatar> | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (appContext.brandDna) {
            setBrandDna({ data: appContext.brandDna, sources: [] });
        } else {
            setBrandDna(null);
        }
    }, [appContext.brandDna]);

    const handleGenerateDna = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setBrandDna(null);
        setAudienceAvatar(null);

        try {
            const result = await generateBrandDnaService(name, purpose, expertise, audience, transformation, personality);
            setBrandDna(result);
            const historyItem: HistoryItem = {
                id: `dna-${Date.now()}`,
                timestamp: new Date().toISOString(),
                label: result.data.name,
                result: { dna: result.data },
                sources: result.sources,
            };
            appContext.addToHistory('dna', historyItem);
            appContext.setActiveBrand(historyItem);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao gerar o DNA da Marca.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAvatar = async () => {
        if (!brandDna) return;
        setLoading(true);
        setError(null);
        try {
            const result = await generateAudienceAvatarService(brandDna.data);
            setAudienceAvatar(result);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao gerar o Avatar da Audiência.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectHistory = (item: HistoryItem) => {
        appContext.setActiveBrand(item);
        setBrandDna({ data: item.result.dna, sources: item.sources || [] });
        setAudienceAvatar(null); // Clear avatar when switching brands
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-50 mb-6">DNA da Marca Pessoal</h1>
                    <p className="text-neutral-400 mb-8">
                        Defina a base da sua marca. Esta é a etapa mais importante e servirá de contexto para todas as outras ferramentas.
                    </p>

                    <form onSubmit={handleGenerateDna} className="space-y-6 bg-neutral-900 p-6 rounded-lg" autoComplete="off">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">Seu Nome ou Nome do Projeto</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div>
                                <label htmlFor="purpose" className="block text-sm font-medium text-neutral-300 mb-2">Missão/Propósito</label>
                                <input type="text" id="purpose" value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500" placeholder="Ex: Ajudar devs a se posicionarem no mercado" required />
                            </div>
                            <div>
                                <label htmlFor="expertise" className="block text-sm font-medium text-neutral-300 mb-2">Sua Expertise Principal</label>
                                <input type="text" id="expertise" value={expertise} onChange={e => setExpertise(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500" placeholder="Ex: Engenheiro de Software Sênior, especialista em React" required />
                            </div>
                            <div>
                                <label htmlFor="audience" className="block text-sm font-medium text-neutral-300 mb-2">Para Quem Você Fala?</label>
                                <input type="text" id="audience" value={audience} onChange={e => setAudience(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500" placeholder="Ex: Desenvolvedores júnior e pleno" required />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="transformation" className="block text-sm font-medium text-neutral-300 mb-2">Qual Transformação Você Oferece?</label>
                                <input type="text" id="transformation" value={transformation} onChange={e => setTransformation(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500" placeholder="Ex: De programador a autoridade técnica reconhecida" required />
                            </div>
                             <div className="md:col-span-2">
                                <label htmlFor="personality" className="block text-sm font-medium text-neutral-300 mb-2">Personalidade da Comunicação</label>
                                <input type="text" id="personality" value={personality} onChange={e => setPersonality(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500" placeholder="Ex: Didático, bem-humorado e direto ao ponto" required />
                            </div>
                        </div>
                        <div className="text-right">
                            <Button type="submit" disabled={loading}>
                                {loading ? <><Spinner /> Gerando DNA...</> : 'Gerar DNA da Marca'}
                            </Button>
                        </div>
                    </form>

                    {error && <div className="mt-6 text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}

                    {brandDna && (
                        <div className="mt-10">
                            <h2 className="text-2xl font-bold text-neutral-50 mb-4">Resultado: DNA da Marca</h2>
                            <div className="bg-neutral-900 p-6 rounded-lg space-y-4">
                                <h3 className="text-xl font-semibold text-blue-400">{brandDna.data.name}</h3>
                                <p><strong>Declaração de Marca:</strong> {brandDna.data.brandStatement}</p>
                                <p><strong>Missão:</strong> {brandDna.data.mission}</p>
                                <div>
                                    <strong>Pilares de Conteúdo:</strong>
                                    <ul className="list-disc list-inside ml-4">
                                        {brandDna.data.pillars.map((pillar, i) => <li key={i}>{pillar}</li>)}
                                    </ul>
                                </div>
                                <p><strong>Voz e Personalidade:</strong> {brandDna.data.voiceAndPersonality}</p>
                                <div>
                                    <strong>Palavras-chave:</strong>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {brandDna.data.keywords.map((kw, i) => <span key={i} className="bg-neutral-800 text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full">{kw}</span>)}
                                    </div>
                                </div>
                                <Sources sources={brandDna.sources} />
                            </div>

                            <div className="mt-8 text-center">
                                <Button onClick={handleGenerateAvatar} disabled={loading || !!audienceAvatar}>
                                    {loading && !audienceAvatar ? <><Spinner /> Gerando Avatar...</> : 'Criar Avatar da Audiência'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {audienceAvatar && (
                        <div className="mt-10">
                            <h2 className="text-2xl font-bold text-neutral-50 mb-4">Resultado: Avatar da Audiência</h2>
                            <div className="bg-neutral-900 p-6 rounded-lg space-y-4">
                                <h3 className="text-xl font-semibold text-teal-400">{audienceAvatar.data.name}</h3>
                                <p><strong>Descrição:</strong> {audienceAvatar.data.description}</p>
                                <div>
                                    <strong>Sonhos e Aspirações:</strong>
                                    <ul className="list-disc list-inside ml-4">
                                        {audienceAvatar.data.dreamsAndAspirations.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <strong>Medos e Frustrações:</strong>
                                    <ul className="list-disc list-inside ml-4">
                                        {audienceAvatar.data.fearsAndFrustrations.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <strong>Pensamentos Diários:</strong>
                                    <ul className="list-disc list-inside ml-4">
                                        {audienceAvatar.data.dailyThoughts.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <strong>Desejos Secretos:</strong>
                                    <ul className="list-disc list-inside ml-4">
                                        {audienceAvatar.data.secretWishes.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <Sources sources={audienceAvatar.sources} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <HistorySidebar
                title="Marcas Salvas"
                history={appContext.history.dna || []}
                onSelect={handleSelectHistory}
                onDelete={(itemId) => appContext.removeFromHistory('dna', itemId)}
                onClear={() => appContext.clearHistory('dna')}
                activeItemId={appContext.activeBrandId}
            />
        </div>
    );
};

export default FoundationAndPersonas;