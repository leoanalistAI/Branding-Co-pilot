import { Type } from "@google/genai";
import { BrandDna, AppContext } from "@/types";

const getContextPrompt = (appContext: AppContext): string => {
    if (!appContext.brandDna) return '';
    return `
---
CONTEXTO DA MARCA:
Nome da Marca: ${appContext.brandDna.name}
Declaração de Marca: ${appContext.brandDna.brandStatement}
Missão: ${appContext.brandDna.mission}
Pilares de Conteúdo: ${appContext.brandDna.pillars.join(', ')}
Voz e Personalidade: ${appContext.brandDna.voiceAndPersonality}
Palavras-chave: ${appContext.brandDna.keywords.join(', ')}
---
    `;
};

export const brandDnaPrompt = (name: string, purpose: string, expertise: string, audience: string, transformation: string, personality: string) => ({
    prompt: `
        Gere um DNA de Marca Pessoal para a seguinte pessoa/projeto. Use o Google Search para se inspirar e trazer informações atualizadas.
        - Nome: ${name}
        - Missão/Propósito: ${purpose}
        - Expertise: ${expertise}
        - Público: ${audience}
        - Transformação Oferecida: ${transformation}
        - Personalidade da Comunicação: ${personality}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "name": (string) O nome da marca/pessoa.
        - "brandStatement": (string) Uma declaração de marca curta e impactante (1-2 frases).
        - "mission": (string) A missão da marca, expandindo o propósito inicial (2-3 frases).
        - "pillars": (string[]) 3 a 5 pilares de conteúdo principais.
        - "voiceAndPersonality": (string) Descreva a voz e personalidade da marca em detalhes (3-4 frases), baseada na personalidade informada.
        - "keywords": (string[]) 5 a 8 palavras-chave e termos relevantes para SEO e busca.
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            brandStatement: { type: Type.STRING },
            mission: { type: Type.STRING },
            pillars: { type: Type.ARRAY, items: { type: Type.STRING } },
            voiceAndPersonality: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['name', 'brandStatement', 'mission', 'pillars', 'voiceAndPersonality', 'keywords']
    }
});

export const audienceAvatarPrompt = (brandDna: BrandDna) => ({
    prompt: `
        Com base no seguinte DNA de Marca, crie um "Avatar da Audiência" detalhado e específico. Este avatar representa o cliente/seguidor ideal. Use o Google Search para pesquisas sobre o público.
        DNA da Marca:
        ${JSON.stringify(brandDna, null, 2)}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "name": (string) Um nome fictício para o avatar.
        - "description": (string) Uma descrição detalhada do avatar. CRÍTICO: Inclua uma IDADE ESPECÍFICA (ex: 28 anos) e uma PROFISSÃO ou ÁREA DE ESTUDO ESPECÍFICA (ex: 'Desenvolvedor de Software júnior' ou 'Estudante de Marketing Digital').
        - "dreamsAndAspirations": (string[]) 3-4 sonhos e aspirações.
        - "fearsAndFrustrations": (string[]) 3-4 medos e frustrações.
        - "dailyThoughts": (string[]) 3-4 pensamentos que o avatar tem diariamente relacionados ao nicho.
        - "secretWishes": (string[]) 2-3 desejos secretos ou inconfessáveis.
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            dreamsAndAspirations: { type: Type.ARRAY, items: { type: Type.STRING } },
            fearsAndFrustrations: { type: Type.ARRAY, items: { type: Type.STRING } },
            dailyThoughts: { type: Type.ARRAY, items: { type: Type.STRING } },
            secretWishes: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['name', 'description', 'dreamsAndAspirations', 'fearsAndFrustrations', 'dailyThoughts', 'secretWishes']
    }
});

export const optimizeProfilePrompt = (platform: string, currentBio: string, appContext: AppContext) => ({
    prompt: `
        Analise a imagem do perfil e a biografia para a plataforma ${platform}.
        ${getContextPrompt(appContext)}
        Biografia Atual: "${currentBio}"

        Com base em tudo, forneça:
        1. Uma nova biografia otimizada, focada em clareza, autoridade e chamada para ação.
        2. Sugestões de melhoria para a foto de perfil, banner/capa, título/headline e otimizações gerais.

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            bio: { type: Type.STRING },
            suggestions: {
                type: Type.OBJECT,
                properties: {
                    profilePicture: { type: Type.ARRAY, items: { type: Type.STRING } },
                    banner: { type: Type.ARRAY, items: { type: Type.STRING } },
                    headline: { type: Type.ARRAY, items: { type: Type.STRING } },
                    general: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['profilePicture', 'banner', 'headline', 'general']
            },
        },
        required: ['bio', 'suggestions']
    }
});

export const developProductPrompt = (productIdea: string, appContext: AppContext) => ({
    prompt: `
        Desenvolva a seguinte ideia de produto/serviço em um conceito claro. Use o Google Search para validar a ideia e buscar referências.
        Ideia: "${productIdea}"
        ${getContextPrompt(appContext)}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "name": (string) Um nome atraente para o produto/serviço.
        - "description": (string) Uma descrição detalhada.
        - "targetAudience": (string) Descrição do público-alvo ideal.
        - "keyFeatures": (string[]) 3-5 principais características ou módulos.
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['name', 'description', 'targetAudience', 'keyFeatures']
    }
});

export const brainstormMarketingIdeasPrompt = (topic: string, appContext: AppContext) => ({
    prompt: `
        Gere 5 ideias de marketing criativas e acionáveis sobre o tópico: "${topic}".
        Considere o contexto da marca para alinhar as ideias. Use o Google Search para se inspirar.
        ${getContextPrompt(appContext)}
        
        O resultado deve ser um JSON com uma lista de 5 objetos. CADA OBJETO DEVE CONTER:
        - "idea": (string) Um título curto e criativo para a ideia. NÃO DEIXE VAZIO.
        - "description": (string) Uma descrição detalhada de como implementar a ideia. NÃO DEIXE VAZIO.
        
        NÃO adicione markdown. Garanta que a resposta seja um JSON válido.
    `,
    schema: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                idea: { type: Type.STRING },
                description: { type: Type.STRING },
            },
            required: ['idea', 'description']
        }
    }
});

export const createEditorialCalendarPrompt = (theme: string, platforms: string[], numPosts: number, appContext: AppContext) => ({
    prompt: `
        Crie um calendário editorial com ${numPosts} posts sobre o tema "${theme}" para as plataformas: ${platforms.join(', ')}.
        ${getContextPrompt(appContext)}
        O resultado deve ser um JSON com uma lista de objetos. Para a data, use um formato relativo como "Dia 1", "Dia 2". NÃO adicione markdown.
    `,
    schema: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                date: { type: Type.STRING },
                platform: { type: Type.STRING },
                topic: { type: Type.STRING },
                contentIdea: { type: Type.STRING },
            },
            required: ['date', 'platform', 'topic', 'contentIdea']
        }
    }
});

export const analyzeCompetitorPrompt = (competitorUrl: string, appContext: AppContext) => ({
    prompt: `
        Analise o perfil/site no link a seguir: ${competitorUrl}.
        Use o Google Search para coletar informações sobre este perfil e seu nicho.
        Se um contexto de marca for fornecido, use-o para comparar e encontrar oportunidades.
        ${getContextPrompt(appContext)}
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "competitorName": (string) O nome do influenciador/marca analisada.
        - "strengths": (string[]) 3-4 pontos fortes.
        - "weaknesses": (string[]) 3-4 pontos fracos.
        - "opportunities": (string[]) 3-4 oportunidades para a *minha* marca com base na análise.
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            competitorName: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['competitorName', 'strengths', 'weaknesses', 'opportunities']
    }
});

export const findPeersPrompt = (brandDna: BrandDna) => ({
    prompt: `
        Com base no DNA de Marca abaixo, encontre 3-5 peers, influenciadores ou concorrentes diretos relevantes.
        Use o Google Search para a pesquisa.
        DNA da Marca: ${JSON.stringify(brandDna, null, 2)}

        O resultado deve ser um JSON com uma lista de objetos. NÃO adicione markdown.
    `,
    schema: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                url: { type: Type.STRING },
            },
            required: ['name', 'url']
        }
    }
});

export const generateFunnelStageSuggestionsPrompt = (stageTitle: string, stageDescription: string, appContext: AppContext) => ({
    prompt: `
        Para a etapa do funil de marketing "${stageTitle}" (${stageDescription}), gere sugestões.
        Use o Google Search para pesquisar táticas e ferramentas relevantes.
        ${getContextPrompt(appContext)}
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "tactics": (string[]) 3-4 táticas de marketing.
        - "contentIdeas": (string[]) 3-4 ideias de conteúdo.
        - "tools": (string[]) 2-3 ferramentas úteis.
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            tactics: { type: Type.ARRAY, items: { type: Type.STRING } },
            contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['tactics', 'contentIdeas', 'tools']
    }
});

export const analyzeVideoPrompt = (userPrompt: string, appContext: AppContext) => ({
    prompt: `
        Analise este vídeo com base na seguinte instrução: "${userPrompt}".
        ${getContextPrompt(appContext)}
        Extraia insights de marketing e crie um título, descrição e um gancho viral (hook) para o vídeo.
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            copyableContent: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    hook: { type: Type.STRING },
                },
                required: ['title', 'description', 'hook']
            },
        },
        required: ['insights', 'copyableContent']
    }
});

export const generateCopyPrompt = (type: string, topic: string, toneOfVoice: string, appContext: AppContext) => ({
    prompt: `
        Crie uma copy para "${type}" sobre o tópico/produto "${topic}".
        O tom de voz deve ser ${toneOfVoice}.
        Use o Google Search para referências de copywriting eficaz.
        ${getContextPrompt(appContext)}
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "headline": (string) Um título/headline impactante.
        - "body": (string) O corpo do texto, bem estruturado.
        - "cta": (string) Uma chamada para ação (call to action) clara.
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            headline: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
        },
        required: ['headline', 'body', 'cta']
    }
});

export const createScriptPrompt = (videoType: string, topic: string, title: string, hook: string, appContext: AppContext) => ({
    prompt: `
        Crie um roteiro para um vídeo do tipo "${videoType}".
        Tópico: ${topic}
        ${title ? `Título Sugerido: ${title}` : ''}
        ${hook ? `Gancho Sugerido: ${hook}` : ''}
        ${getContextPrompt(appContext)}
        
        O resultado deve ser um JSON. O roteiro deve ser dividido em cenas com descrição visual e diálogo.
        - "title": (string) Um título otimizado para a plataforma.
        - "hook": (string) O gancho inicial (primeiros 3 segundos).
        - "script": (array) Um array de objetos, onde cada objeto tem "scene", "visual" e "dialogue".
        - "cta": (string) A chamada para ação no final.
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            script: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        scene: { type: Type.STRING },
                        visual: { type: Type.STRING },
                        dialogue: { type: Type.STRING },
                    },
                    required: ['scene', 'visual', 'dialogue']
                }
            },
            cta: { type: Type.STRING },
        },
        required: ['title', 'hook', 'script', 'cta']
    }
});

export const generateCarouselPrompt = (topic: string, platform: string, numSlides: number, appContext: AppContext) => ({
    prompt: `
        Crie um post de carrossel para ${platform} com ${numSlides} slides sobre o tópico: "${topic}".
        O carrossel deve ter uma narrativa coesa, começando com um gancho forte no primeiro slide e terminando com uma chamada para ação clara.
        Para cada slide, forneça um título, o conteúdo do texto e um prompt detalhado para uma imagem de IA que ilustre o conteúdo.
        ${getContextPrompt(appContext)}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "mainTitle": (string) Um título geral para o post de carrossel.
        - "slides": (array) Um array de ${numSlides} objetos, onde cada objeto representa um slide.
            - "slideNumber": (number) O número do slide.
            - "title": (string) Um título curto e impactante para o slide.
            - "content": (string) O texto principal do slide.
            - "imagePrompt": (string) Um prompt para gerar uma imagem que acompanha o texto do slide.
        - "cta": (string) Uma chamada para ação para o último slide.
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            mainTitle: { type: Type.STRING },
            slides: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        slideNumber: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                    },
                    required: ['slideNumber', 'title', 'content', 'imagePrompt']
                }
            },
            cta: { type: Type.STRING },
        },
        required: ['mainTitle', 'slides', 'cta']
    }
});

export const generateSeoAnalysisPrompt = (topic: string, appContext: AppContext) => ({
    prompt: `
        Faça uma análise de SEO completa para o tópico: "${topic}".
        Use o Google Search para encontrar palavras-chave, perguntas relacionadas e analisar a estrutura dos conteúdos que rankeiam bem.
        ${getContextPrompt(appContext)}
        
        O resultado deve ser um JSON com a seguinte estrutura.
        - "primaryKeywords": (string[]) 3-5 palavras-chave primárias.
        - "secondaryKeywords": (string[]) 5-8 palavras-chave secundárias ou de cauda longa.
        - "commonQuestions": (string[]) 4-6 perguntas comuns que as pessoas fazem (People Also Ask).
        - "suggestedStructure": (object) Um objeto com "title", "introduction", "sections" (array de strings) e "conclusion".
    `,
    schema: {
        type: Type.OBJECT,
        properties: {
            primaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            secondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            commonQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedStructure: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    introduction: { type: Type.STRING },
                    sections: { type: Type.ARRAY, items: { type: Type.STRING } },
                    conclusion: { type: Type.STRING },
                },
                required: ['title', 'introduction', 'sections', 'conclusion']
            },
        },
        required: ['primaryKeywords', 'secondaryKeywords', 'commonQuestions', 'suggestedStructure']
    }
});