import * as React from 'react';
import { FunnelStage } from '../../../types';
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';
import { EyeIcon, CursorArrowRaysIcon, ShoppingCartIcon, TrophyIcon, SparklesIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from '../../icons/Icons';

interface FunnelNodeProps {
    stage: FunnelStage;
    index: number;
    totalStages: number;
    onUpdate: (id: string, title: string, description: string) => void;
    onRemove: (id: string) => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
    onGetSuggestions: (stage: FunnelStage) => void;
}

const iconMap = {
    EyeIcon,
    CursorArrowRaysIcon,
    ShoppingCartIcon,
    TrophyIcon
};

const FunnelNode: React.FC<FunnelNodeProps> = ({ stage, index, totalStages, onUpdate, onRemove, onMove, onGetSuggestions }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [title, setTitle] = React.useState(stage.title);
    const [description, setDescription] = React.useState(stage.description);

    const cardRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setTitle(stage.title);
        setDescription(stage.description);
    }, [stage]);

     React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                if (isEditing) {
                    handleSave();
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isEditing, cardRef, title, description]);


    const handleSave = () => {
        onUpdate(stage.id, title, description);
        setIsEditing(false);
    };

    const Icon = iconMap[stage.icon];

    return (
        <Card className="relative group p-4">
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-neutral-800">
                        <Icon className="h-6 w-6 text-blue-400" />
                    </span>
                </div>
                <div className="flex-grow">
                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2 text-neutral-100 font-semibold focus:ring-2 focus:ring-blue-500"
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2 text-neutral-300 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleSave} size="sm" variant="primary">Salvar</Button>
                                <Button onClick={() => setIsEditing(false)} size="sm" variant="secondary">Cancelar</Button>
                            </div>
                        </div>
                    ) : (
                        <div onClick={() => setIsEditing(true)} className="cursor-pointer">
                            <h4 className="text-lg font-bold text-neutral-100">{stage.title}</h4>
                            <p className="text-neutral-400 text-sm mt-1">{stage.description}</p>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0">
                     <Button onClick={() => onGetSuggestions(stage)} icon={<SparklesIcon className="w-5 h-5"/>}>
                        Sugestões IA
                    </Button>
                </div>
            </div>
             <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onMove(index, 'up')} disabled={index === 0} className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronUpIcon className="w-4 h-4 text-neutral-300" />
                </button>
                <button onClick={() => onMove(index, 'down')} disabled={index === totalStages - 1} className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronDownIcon className="w-4 h-4 text-neutral-300" />
                </button>
                <button onClick={() => onRemove(stage.id)} className="p-1 rounded-md bg-neutral-800 hover:bg-red-500/50">
                    <TrashIcon className="w-4 h-4 text-neutral-300" />
                </button>
            </div>
        </Card>
    );
};

export default FunnelNode;