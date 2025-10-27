import React from 'react';
import { generateBrandDnaService, generateAudienceAvatarService } from '../../services/geminiService';
import { AppContext, BrandDna, AudienceAvatar, Source, HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { downloadAsMarkdown } from '../../utils/fileUtils';
import { ArrowDownTrayIcon, UsersIcon, BriefcaseIcon, AcademicCapIcon, CheckIcon } from '../icons/Icons';

interface FoundationAndPersonasProps {
    appContext: AppContext;
}

type Archetype = 'expert' | 'rising' | 'freelancer';

const archetypes = {
    expert: {
        icon: BriefcaseIcon,
        title: "Especialista Estabelecido",
        description: "Para quem já tem carreira e quer se posicionar como autoridade.",
        prefill: {
            name: "Dr. Ana Oliveira",
            purpose: "Capacitar líderes de negócios a utilizarem a inteligência artificial de forma ética e estratégica para impulsionar o crescimento.",
            expertise: "Inteligência Artificial aplicada a negócios, ética em IA, liderança e transformação digital.",
            audience: "Executivos C-level, diretores de tecnologia e gerentes de inovação em médias e grandes empresas.",
            transformation: "De uma visão reativa sobre tecnologia para uma liderança proativa que integra a IA no core do negócio, gerando vantagem competitiva e inovação sustentável.",
            personality: "Profissional e Confiável"
        }
    },
    rising: {
        icon: AcademicCapIcon,
        title: "Talento em Ascensão",
        description: "Para estudantes ou freelancers no início de carreira.",
        prefill: {
            name: "Lucas Mendes",
            purpose: "Ajudar pequenas empresas e ONGs a contarem suas histórias de forma impactante através do design gráfico e storytelling visual.",
            expertise: "Design de identidade visual (branding), design para mídias sociais, ilustração digital.",
            audience: "Empreendedores de pequenos negócios, gestores de marketing de ONGs e startups em estágio inicial.",
            transformation: "Transformar uma comunicação visual genérica em uma marca forte e autêntica que gera conexão, engajamento e reconhecimento.",
            personality: "Amigável e Acessível"
        }
    },
    freelancer: {
        icon: CheckIcon,
        title: "Profissional Autônomo",
        description: "Para quem já atua de forma independente e quer escalar.",
        prefill: {
            name: "Sofia Costa",
            purpose: "Otimizar a saúde e o bem-estar de profissionais ocupados através de programas de nutrição personalizados e coaching de hábitos.",
            expertise: "Nutrição funcional, planejamento de dietas, coaching de saúde e bem-estar, culinária saudável.",
            audience: "Profissionais entre 30 e 50 anos que trabalham em ambientes corporativos e têm pouco tempo para cuidar da alimentação.",
            transformation: "Sair de um estado de cansaço e baixa energia para uma vida com mais vitalidade, foco e produtividade, através de uma relação mais saudável com a comida.",
            personality: "Inspirador e Motivacional"
        }
    }
};


const FoundationAndPersonas: React.FC<FoundationAndPersonasProps> = ({ appContext }) => {
    const [name, setName] = React.useState('');
    const [purpose, setPurpose] = React.useState('');
    const [expertise, setExpertise] = React.useState('');
    const [audience, setAudience] = React.useState('');
    const [transformation, setTransformation] = React.useState('');
    const [personality, setPersonality] = React.useState('Profissional e Confiável');
    
    const [selectedArchetype, setSelectedArchetype] = React.useState<Archetype | null>(null);

    const [brandDnaResult, setBrandDnaResult] = React.useState<BrandDna | null>(null);
    const [avatarResult, setAvatarResult] = React.useState<AudienceAvatar | null>(null);
    const [dnaSources, setDnaSources] = React.useState<Source[]>([]);
    const [avatarSources, setAvatarSources] = React.useState<Source[]>([]);
    const [isLoadingDna, setIsLoadingDna] = React.useState(false);
    const [isLoadingAvatar, setIsLoadingAvatar] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (appContext.brandDna && appContext.activeBrandId) {
            setBrandDnaResult(appContext.brandDna);
            setActiveHistoryId(appContext.activeBrandId);
            const activeItem = appContext.history.dna.find(item => item.id === appContext.activeBrandId);
            if (activeItem) {
                setAvatarResult(activeItem.result.avatar || null);
                // When loading from history, we don't have an archetype, but we can show the form
                setSelectedArchetype('expert'); // default to show the form
            } else {
                 setAvatarResult(null);
            }
        } else {
            setBrandDnaResult(null);
            setAvatarResult(null);
            setActiveHistoryId(null);
            setSelectedArchetype(null);
        }
    }, [appContext.brandDna, appContext.activeBrandId, appContext.history.dna]);
    
    const handleArchetypeSelect = (archetype: Archetype) => {
        setSelectedArchetype(archetype);
        const { prefill } = archetypes[archetype];
        setName(prefill.name);
        setPurpose(prefill.purpose);
        setExpertise(prefill.expertise);
        setAudience(prefill.audience);
        setTransformation(prefill.transformation);
        setPersonality(prefill.personality);
    };

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

    const renderArchetypeSelection = () => (
        <Card>
            <CardHeader>
                <CardTitle>Comece por aqui</CardTitle>
                <CardDescription>Selecione o arquétipo que melhor descreve seu momento atual para guiar a IA.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(archetypes).map(([key, { icon: Icon, title, description }]) => (
                    <button key={key} onClick={() => handleArchetypeSelect(key as Archetype)} className="p-4 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-left transition-colors flex flex-col items-center text-center">
                        <Icon className="w-8 h-8 mb-3 text-blue-400" />
                        <h4 className="font-semibold text-neutral-100">{title}</h4>
                        <p className="text-xs text-neutral-400 mt-1">{description}</p>
                    </button>
                ))}
            </CardContent>
        </Card>
    );
    
    const renderDnaForm = () => {
        const inputClasses = "w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors";
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Diagnóstico de Clareza</CardTitle>
                    <CardDescription>Personalize os exemplos abaixo para definir a base da sua marca.</CardDescription>
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
                            <Button type="button" variant="secondary" onClick={() => setSelectedArchetype(null)}>Voltar</Button>
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
                        {!selectedArchetype ? renderArchetypeSelection() : renderDnaForm()}
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