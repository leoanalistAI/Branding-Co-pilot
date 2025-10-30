import { useState, useEffect, useCallback } from 'react';
import { generateBrandDnaService, generateAudienceAvatarService } from '@/services/aiService';
import { AppContext, BrandDna, AudienceAvatar, Source, HistoryItem } from '@/types';

const archetypes = {
    expert: {
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

export const useBrandFoundation = (appContext: AppContext) => {
    const [formState, setFormState] = useState({
        name: '',
        purpose: '',
        expertise: '',
        audience: '',
        transformation: '',
        personality: 'Profissional e Confiável',
    });
    const [selectedArchetype, setSelectedArchetype] = useState<keyof typeof archetypes | null>(null);
    const [brandDnaResult, setBrandDnaResult] = useState<BrandDna | null>(null);
    const [avatarResult, setAvatarResult] = useState<AudienceAvatar | null>(null);
    const [dnaSources, setDnaSources] = useState<Source[]>([]);
    const [avatarSources, setAvatarSources] = useState<Source[]>([]);
    const [isLoadingDna, setIsLoadingDna] = useState(false);
    const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (appContext.brandDna && appContext.activeBrandId) {
            setBrandDnaResult(appContext.brandDna);
            const activeItem = appContext.history.dna.find(item => item.id === appContext.activeBrandId);
            if (activeItem) {
                setAvatarResult(activeItem.result.avatar || null);
                setAvatarSources(activeItem.result.avatarSources || []);
                setDnaSources(activeItem.result.sources || []);
                // To show the form with data, we can set a default archetype
                setSelectedArchetype('expert'); 
                setFormState(activeItem.inputs);
            }
        } else {
            setBrandDnaResult(null);
            setAvatarResult(null);
            setSelectedArchetype(null);
            setFormState({ name: '', purpose: '', expertise: '', audience: '', transformation: '', personality: 'Profissional e Confiável' });
        }
    }, [appContext.brandDna, appContext.activeBrandId, appContext.history.dna]);

    const handleArchetypeSelect = useCallback((archetype: keyof typeof archetypes) => {
        setSelectedArchetype(archetype);
        setFormState(archetypes[archetype].prefill);
    }, []);

    const handleInputChange = useCallback((field: keyof typeof formState, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleDnaSubmit = useCallback(async () => {
        setIsLoadingDna(true);
        setError(null);
        try {
            const { data, sources } = await generateBrandDnaService(
                formState.name, formState.purpose, formState.expertise, formState.audience, formState.transformation, formState.personality
            );
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'DNA da Marca',
                summary: data.name,
                inputs: formState,
                result: { dna: data, sources, avatar: null, avatarSources: [] },
            };
            appContext.addToHistory('dna', newItem);
            appContext.setActiveBrand(newItem);
        } catch (err: any) {
            setError(err.message || 'Falha ao gerar o DNA da Marca.');
        } finally {
            setIsLoadingDna(false);
        }
    }, [formState, appContext]);

    const handleAvatarSubmit = useCallback(async () => {
        if (!brandDnaResult || !appContext.activeBrandId) return;
        setIsLoadingAvatar(true);
        setError(null);
        try {
            const { data, sources } = await generateAudienceAvatarService(brandDnaResult);
            const currentItem = appContext.history.dna.find(item => item.id === appContext.activeBrandId);
            if (currentItem) {
                const updatedItem = {
                    ...currentItem,
                    result: { ...currentItem.result, avatar: data, avatarSources: sources }
                };
                appContext.addToHistory('dna', updatedItem);
            }
        } catch (err: any) {
            setError(err.message || 'Falha ao gerar o Avatar da Audiência.');
        } finally {
            setIsLoadingAvatar(false);
        }
    }, [brandDnaResult, appContext]);

    const handleHistorySelect = useCallback((item: HistoryItem) => {
        appContext.setActiveBrand(item);
    }, [appContext]);

    return {
        formState,
        handleInputChange,
        selectedArchetype,
        setSelectedArchetype,
        handleArchetypeSelect,
        brandDnaResult,
        avatarResult,
        dnaSources,
        avatarSources,
        isLoadingDna,
        isLoadingAvatar,
        error,
        handleDnaSubmit,
        handleAvatarSubmit,
        handleHistorySelect,
        activeHistoryId: appContext.activeBrandId,
    };
};