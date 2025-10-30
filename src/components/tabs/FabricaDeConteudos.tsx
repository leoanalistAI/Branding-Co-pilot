import React, { useState } from 'react';
import { AppContext } from '@/types';
import { useContentFactory } from '@/hooks/useContentFactory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Sources from '@/components/ui/Sources';
import { InstagramIcon, LinkedinIcon, ClipboardDocumentIcon, CheckIcon } from '@/components/icons';

// Sub-componente para o formulário de geração
const ContentGenerationForm: React.FC<{
    platform: 'instagram' | 'linkedin';
    setPlatform: (p: 'instagram' | 'linkedin') => void;
    contentType: string;
    setContentType: (c: 'post' | 'story' | 'reels') => void;
    topic: string;
    setTopic: (t: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}> = ({ platform, setPlatform, contentType, setContentType, topic, setTopic, handleSubmit, isLoading }) => {
    const platformOptions = {
        instagram: { types: ['post', 'story', 'reels'], icon: <InstagramIcon className="w-5 h-5" /> },
        linkedin: { types: ['post'], icon: <LinkedinIcon className="w-5 h-5" /> },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fábrica de Conteúdos</CardTitle>
                <CardDescription>Gere ideias e textos para suas redes sociais com base no seu DNA de Marca.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Plataforma</label>
                        <div className="flex gap-2">
                            {Object.entries(platformOptions).map(([key, { icon }]) => (
                                <Button
                                    key={key}
                                    type="button"
                                    variant={platform === key ? 'primary' : 'secondary'}
                                    onClick={() => setPlatform(key as 'instagram' | 'linkedin')}
                                    className="flex-1 capitalize"
                                    icon={icon}
                                >
                                    {key}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Formato do Conteúdo</label>
                        <div className="flex gap-2">
                            {platformOptions[platform].types.map(type => (
                                <Button
                                    key={type}
                                    type="button"
                                    variant={contentType === type ? 'primary' : 'secondary'}
                                    onClick={() => setContentType(type as 'post' | 'story' | 'reels')}
                                    className="flex-1 capitalize"
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">Tópico Principal</label>
                        <input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: Como a IA pode otimizar o marketing de conteúdo"
                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                            required
                        />
                    </div>
                    <Button type="submit" isLoading={isLoading} className="w-full !mt-6">
                        Gerar Conteúdo
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

// Sub-componente para exibir os resultados
const ContentResultDisplay: React.FC<{
    content: any[] | null;
    isLoading: boolean;
    error: string | null;
    sources: any[];
}> = ({ content, isLoading, error, sources }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (isLoading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (error) return <p className="text-red-400 text-center">{error}</p>;
    if (!content) return <div className="text-center text-neutral-500">Seu conteúdo gerado aparecerá aqui.</div>;

    return (
        <div className="space-y-4">
            {content.map((item, index) => (
                <Card key={index}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{item.title || `Slide ${index + 1}`}</CardTitle>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopy(item.body, index)}
                                icon={copiedIndex === index ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                            >
                                {copiedIndex === index ? 'Copiado!' : 'Copiar'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-neutral-300">{item.body}</p>
                        {item.image_prompt && (
                            <p className="text-xs text-blue-400/70 mt-3 italic">Sugestão de imagem: {item.image_prompt}</p>
                        )}
                    </CardContent>
                </Card>
            ))}
            <Sources sources={sources} />
        </div>
    );
};


const FabricaDeConteudos: React.FC<{ appContext: AppContext }> = ({ appContext }) => {
    const {
        platform, setPlatform, contentType, setContentType, topic, setTopic,
        isLoading, error, generatedContent, sources, handleSubmit, isBrandDnaReady
    } = useContentFactory(appContext);

    if (!isBrandDnaReady) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-2xl font-bold text-neutral-100">Defina sua Marca Primeiro</h2>
                <p className="text-neutral-400 mt-2">
                    A Fábrica de Conteúdos utiliza o seu DNA de Marca para criar posts alinhados com sua estratégia.
                    <br />
                    Por favor, vá para a aba <strong>"DNA da Marca"</strong> e gere sua fundação de marca antes de continuar.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 h-full overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <ContentGenerationForm
                    platform={platform}
                    setPlatform={setPlatform}
                    contentType={contentType}
                    setContentType={setContentType}
                    topic={topic}
                    setTopic={setTopic}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                />
                <ContentResultDisplay
                    content={generatedContent}
                    isLoading={isLoading}
                    error={error}
                    sources={sources}
                />
            </div>
        </div>
    );
};

export default FabricaDeConteudos;