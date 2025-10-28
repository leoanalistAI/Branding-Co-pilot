import { useState, FC } from 'react';
import { HistoryItem } from '../../types';
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';

interface HistorySidebarProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
    activeItemId?: string | null;
}

const HistorySidebar: FC<HistorySidebarProps> = ({ history, onSelect, onDelete, onClear, activeItemId }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="hidden md:block fixed top-1/2 right-0 transform -translate-y-1/2 z-20 p-2 rounded-l-md bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 border border-r-0 border-neutral-800 shadow-lg"
                title="Mostrar Histórico"
            >
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
        );
    }


    return (
        <aside className="w-80 bg-black flex-shrink-0 flex-col border-l border-neutral-800 transition-all duration-300 hidden md:flex">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">Histórico</h2>
                <div className="flex items-center gap-2">
                    {history.length > 0 && (
                         <button 
                            onClick={onClear} 
                            className="text-xs text-neutral-500 hover:text-red-400"
                            title="Limpar Histórico"
                        >
                            Limpar
                        </button>
                    )}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100"
                        title="Recolher Histórico"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {history.length === 0 ? (
                    <div className="p-8 text-center text-sm text-neutral-500">
                        Nenhuma atividade registrada ainda.
                    </div>
                ) : (
                    <ul className="divide-y divide-neutral-800">
                        {history.map(item => (
                            <li key={item.id} className={`group hover:bg-neutral-900 ${activeItemId === item.id ? 'bg-blue-500/10' : ''}`}>
                                <div 
                                    onClick={() => onSelect(item)} 
                                    className="p-3 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-4/5">
                                            <p className={`text-sm font-semibold ${activeItemId === item.id ? 'text-blue-400' : 'text-neutral-200'}`}>{item.summary}</p>
                                            <p className="text-xs text-neutral-400 truncate">{item.type}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {activeItemId === item.id && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Ativo</span>}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-neutral-500 hover:text-red-400"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
};

export default HistorySidebar;