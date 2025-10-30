import React from 'react';
import { Source } from '../../types';
import { LinkIcon } from '../icons';

interface SourcesProps {
    sources: Source[];
}

const Sources: React.FC<SourcesProps> = ({ sources }) => {
    if (!sources || sources.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 border-t border-neutral-800 pt-4">
            <h4 className="font-semibold text-neutral-500 text-xs uppercase tracking-wider mb-2">Fontes da Web</h4>
            <ul className="space-y-2">
                {sources.map((source, index) => (
                    <li key={index}>
                        <a 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-start gap-2 group"
                        >
                            <LinkIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-600 group-hover:text-blue-400 transition-colors" />
                            <span className="truncate" title={source.title || source.uri}>{source.title || source.uri}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sources;