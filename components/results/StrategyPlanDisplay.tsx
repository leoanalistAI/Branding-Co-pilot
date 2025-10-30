import React from 'react';
import { StrategyPlan } from '../../types';
import { CalendarDaysIcon } from '../icons';

interface StrategyPlanDisplayProps {
    data: StrategyPlan;
    query: {
        objetivo: string;
        periodo: string;
    };
}

const StrategyPlanDisplay: React.FC<StrategyPlanDisplayProps> = ({ data, query }) => {
    return (
        <div className="animate-fade-in">
            <header className="text-center mb-8">
                <CalendarDaysIcon className="w-12 h-12 mx-auto text-blue-400 mb-2" />
                <h2 className="text-3xl font-bold text-white">{data.title}</h2>
                <p className="text-neutral-400">Plano de {query.periodo} para alcançar o objetivo: "{query.objetivo}"</p>
            </header>

            <div className="space-y-8">
                {data.weeklyBreakdown.map((week, index) => (
                    <div key={index} className="relative pl-8 border-l-2 border-neutral-700">
                        <div className="absolute -left-4 top-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                            {index + 1}
                        </div>
                        <div className="ml-4">
                            <h3 className="text-xl font-semibold text-blue-300">{week.week}</h3>
                            <p className="text-md font-medium text-neutral-300 mt-1 mb-3">{week.theme}</p>
                            <ul className="space-y-2">
                                {week.actions.map((action, actionIndex) => (
                                    <li key={actionIndex} className="text-sm text-neutral-400 bg-neutral-800/50 p-3 rounded-lg">
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StrategyPlanDisplay;