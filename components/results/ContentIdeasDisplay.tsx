import React from 'react';
import { ContentIdea } from '../../types';
import { PencilSquareIcon, PhotoIcon, VideoCameraIcon } from '../icons';

interface ContentIdeasDisplayProps {
    data: ContentIdea[];
    query: {
        tema: string;
        formato: string;
    };
}

const getIconForFormat = (format: string) => {
    const lowerFormat = format.toLowerCase();
    if (lowerFormat.includes('vídeo')) {
        return <VideoCameraIcon className="w-6 h-6 text-blue-400" />;
    }
    if (lowerFormat.includes('imagem') || lowerFormat.includes('carrossel')) {
        return <PhotoIcon className="w-6 h-6 text-green-400" />;
    }
    return <PencilSquareIcon className="w-6 h-6 text-purple-400" />;
};

const ContentIdeasDisplay: React.FC<ContentIdeasDisplayProps> = ({ data, query }) => {
    return (
        <div className="animate-fade-in space-y-6">
            <header className="text-center">
                <h2 className="text-2xl font-bold text-white">Ideias de Conteúdo</h2>
                <p className="text-neutral-400">Para o tema "{query.tema}" no formato {query.formato}</p>
            </header>
            <div className="space-y-4">
                {data.map((idea, index) => (
                    <div key={index} className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                                {getIconForFormat(idea.format)}
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-neutral-100">{idea.title}</h3>
                                <p className="text-sm text-neutral-400 mt-1">{idea.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContentIdeasDisplay;