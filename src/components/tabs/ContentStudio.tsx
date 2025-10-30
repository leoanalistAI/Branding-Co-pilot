import React, { useState, useEffect } from 'react';
import { AppContext, HistoryItem } from '../../types';
import TextGenerator from './content-studio/TextGenerator';
import Brainstormer from './content-studio/Brainstormer';
import ImageStudio from './content-studio/ImageStudio';
import VideoAnalyzerTool from './content-studio/VideoAnalyzerTool';
import { PencilSquareIcon, LightBulbIcon, PhotoIcon, VideoCameraIcon } from '../icons/Icons';

interface ContentStudioProps {
    appContext: AppContext;
    history: HistoryItem[]; // This prop is now for the 'text' part, others will get their own
}

type StudioTool = 'text' | 'brainstorm' | 'image' | 'video';

const ContentStudio: React.FC<ContentStudioProps> = ({ appContext }) => {
    const [activeTool, setActiveTool] = useState<StudioTool>('text');

    useEffect(() => {
        if (appContext.prefillData && appContext.prefillData.tab === 'contentStudio') {
            setActiveTool('text');
        }
    }, [appContext.prefillData]);

    const getHistoryForTool = (toolId: StudioTool): HistoryItem[] => {
        const tabMap: { [key in StudioTool]: string } = {
            text: 'contentStudio',
            brainstorm: 'brainstorm',
            image: 'image',
            video: 'video'
        };
        const historyKey = tabMap[toolId];
        if (!appContext.activeBrandId) return [];
        return appContext.history.brandHistories[appContext.activeBrandId]?.[historyKey] || [];
    };

    const tools = [
        { id: 'text', label: 'Texto e Roteiros', icon: PencilSquareIcon, component: <TextGenerator appContext={appContext} history={getHistoryForTool('text')} /> },
        { id: 'brainstorm', label: 'Brainstorm', icon: LightBulbIcon, component: <Brainstormer appContext={appContext} history={getHistoryForTool('brainstorm')} /> },
        { id: 'image', label: 'Imagens', icon: PhotoIcon, component: <ImageStudio appContext={appContext} history={getHistoryForTool('image')} /> },
        { id: 'video', label: 'Analisar Vídeo', icon: VideoCameraIcon, component: <VideoAnalyzerTool appContext={appContext} history={getHistoryForTool('video')} /> },
    ];

    const activeToolComponent = tools.find(t => t.id === activeTool)?.component;

    return (
        <div className="h-full flex flex-col">
            <header className="p-6 lg:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Estúdio de Conteúdo</h2>
                <p className="text-neutral-400 mt-1">Sua central de criação: da ideia ao post completo, com texto e imagem.</p>
            </header>
            <div className="px-6 lg:px-8 border-b border-neutral-800">
                <div className="flex space-x-1 overflow-x-auto pb-px">
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as StudioTool)}
                            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-t-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-black focus:ring-offset-2 ${
                                activeTool === tool.id
                                    ? 'bg-neutral-900 text-blue-400'
                                    : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-100'
                            }`}
                        >
                            <tool.icon className="w-5 h-5" />
                            <span>{tool.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {activeToolComponent}
            </div>
        </div>
    );
};

export default ContentStudio;