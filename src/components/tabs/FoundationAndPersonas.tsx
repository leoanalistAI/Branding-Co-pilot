import React from 'react';
import { AppContext, HistoryItem } from '@/types';
import { useBrandFoundation } from '@/hooks/useBrandFoundation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import HistorySidebar from '@/components/ui/HistorySidebar';
import { downloadAsMarkdown } from '@/utils/fileUtils';
import { ArrowDownTrayIcon, BriefcaseIcon, AcademicCapIcon, CheckIcon, UsersIcon } from '@/components/icons';
import Sources from '@/components/ui/Sources';

interface FoundationAndPersonasProps {
    appContext: AppContext;
}

const archetypesConfig = {
    expert: { icon: BriefcaseIcon, title: "Especialista Estabelecido", description: "Para quem já tem carreira e quer se posicionar como autoridade." },
    rising: { icon: AcademicCapIcon, title: "Talento em Ascensão", description: "Para estudantes ou freelancers no início de carreira." },
    freelancer: { icon: CheckIcon, title: "Profissional Autônomo", description: "Para quem já atua de forma independente e quer escalar." }
};

const ArchetypeSelection: React.FC<{ onSelect: (archetype: 'expert' | 'rising' | 'freelancer') => void }> = ({ onSelect }) => (
    <Card>
        <CardHeader>
            <CardTitle>Comece por aqui</CardTitle>
            <CardDescription>Selecione o arquétipo que melhor descreve seu momento atual para guiar a IA.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(archetypesConfig).map(([key, { icon: Icon, title, description }]) => (
                <button key={key} onClick={() => onSelect(key as 'expert' | 'rising' | 'freelancer')} className="p-4 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-left transition-colors flex flex-col items-center text-center">
                    <Icon className="w-8 h-8 mb-3 text-blue-400" />
                    <h4 className="font-semibold text-neutral-100">{title}</h4>
                    <p className="text-xs text-neutral-400 mt-1">{description}</p>
                </button>
            ))}
        </CardContent>
    </Card>
);

const BrandDnaForm: React.FC<{
    formState: any;
    handleInputChange: (field: string, value: string) => void;
    handleSubmit: () => void;
    handleBack: () => void;
    isLoading: boolean;
}> = ({ formState, handleInputChange, handleSubmit, handleBack, isLoading }) => {
    const inputClasses = "w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors";
    
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Diagnóstico de Clareza</CardTitle>
                <CardDescription>Personalize os exemplos abaixo para definir a base da sua marca.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div><label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">Seu Nome / Nome do Projeto</label><input id="name" type="text" value={formState.name} onChange={(e) => handleInputChange('name', e.target.value)} className={inputClasses} required /></div>
                    <div><label htmlFor="purpose" className="block text-sm font-medium text-neutral-300 mb-1">Qual sua grande missão ou propósito?</label><textarea id="purpose" value={formState.purpose} onChange={(e) => handleInputChange('purpose', e.target.value)} rows={3} className={inputClasses} required /></div>
                    <div><label htmlFor="expertise" className="block text-sm font-medium text-neutral-300 mb-1">Quais suas áreas de expertise?</label><textarea id="expertise" value={formState.expertise} onChange={(e) => handleInputChange('expertise', e.target.value)} rows={2} className={inputClasses} required /></div>
                    <div><label htmlFor="audience" className="block text-sm font-medium text-neutral-300 mb-1">Qual público você deseja impactar?</label><textarea id="audience" value={formState.audience} onChange={(e) => handleInputChange('audience', e.target.value)} rows={2} className={inputClasses} required /></div>
                    <div><label htmlFor="transformation" className="block text-sm font-medium text-neutral-300 mb-1">Que transformação você oferece?</label><textarea id="transformation" value={formState.transformation} onChange={(e) => handleInputChange('transformation', e.target.value)} rows={3} className={inputClasses} required /></div>
                    <div>
                        <label htmlFor="personality" className="block text-sm font-medium text-neutral-300 mb-1">Qual a personalidade da sua comunicação?</label>
                        <select id="personality" value={formState.personality} onChange={(e) => handleInputChange('personality', e.target.value)} className={inputClasses}>
                            <option>Profissional e Confiável</option><option>Amigável e Acessível</option><option>Divertido e Irreverente</option><option>Inspirador e Motivacional</option><option>Analítico e Direto</option>
                        </select>
                    </div>
                    <div className="flex gap-4 !mt-6">
                        <Button type="button" variant="secondary" onClick={handleBack}>Voltar</Button>
                        <Button type="submit" isLoading={isLoading} className="w-full">Gerar DNA da Marca</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

const FoundationAndPersonas: React.FC<FoundationAndPersonasProps> = ({ appContext }) => {
    const {
        formState, handleInputChange, selectedArchetype, setSelectedArchetype, handleArchetypeSelect,
        brandDnaResult, avatarResult, dnaSources, avatarSources,
        isLoadingDna, isLoadingAvatar, error,
        handleDnaSubmit, handleAvatarSubmit, handleHistorySelect, activeHistoryId
    } = useBrandFoundation(appContext);

    const handleDownload = () => {
        if (!brandDnaResult) return;
        let content = `# DNA da Marca: ${brandDnaResult.name}\n\n`;
        content += `## Declaração de Marca\n${brandDnaResult.brandStatement}\n\n`;
        content += `## Missão\n${brandDnaResult.mission}\n\n`;
        content += `## Pilares de Conteúdo\n- ${brandDnaResult.pillars.join('\n- ')}\n\n`;
        content += `## Voz e Personalidade\n${brandDnaResult.voiceAndPersonality}\n\n`;
        content += `## Palavras-chave\n- ${brandDnaResult.keywords.join('\n- ')}\n\n`;
        if (avatarResult) {
            content += `---\n\n# Avatar da Audiência: ${avatarResult.name}\n\n`;
            content += `## Descrição\n${avatarResult.description}\n\n`;
            content += `## Sonhos e Aspirações\n- ${avatarResult.dreamsAndAspirations.join('\n- ')}\n\n`;
            content += `## Medos e Frustrações\n- ${avatarResult.fearsAndFrustrations.join('\n- ')}\n\n`;
            content += `## Pensamentos Diários\n- ${avatarResult.dailyThoughts.join('\n- ')}\n\n`;
            content += `## Desejos Secretos\n- ${avatarResult.secretWishes.join('\n- ')}\n\n`;
        }
        downloadAsMarkdown(content, `dna-marca-${brandDnaResult.name.replace(/\s+/g, '-').toLowerCase()}`);
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
                        {!selectedArchetype ? <ArchetypeSelection onSelect={handleArchetypeSelect} /> : <BrandDnaForm formState={formState} handleInputChange={handleInputChange} handleSubmit={handleDnaSubmit} handleBack={() => setSelectedArchetype(null)} isLoading={isLoadingDna} />}
                    </div>
                    <div className="space-y-4">
                        {isLoadingDna && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {brandDnaResult && (
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>{brandDnaResult.name}</CardTitle>
                                        <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>Baixar</Button>
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
                                    <Button onClick={handleAvatarSubmit} isLoading={isLoadingAvatar} className="w-full" icon={<UsersIcon className="w-5 h-5"/>}>{avatarResult ? 'Gerar Outro Avatar' : 'Gerar Avatar da Audiência'}</Button>
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