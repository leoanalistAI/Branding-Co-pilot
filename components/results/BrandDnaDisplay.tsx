import React from 'react';
import { BrandDna } from '../../types';
import { SparklesIcon } from '../icons';

interface BrandDnaDisplayProps {
    data: BrandDna;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-neutral-800/50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">{title}</h3>
        <div className="text-neutral-300">{children}</div>
    </div>
);

const BrandDnaDisplay: React.FC<BrandDnaDisplayProps> = ({ data }) => {
    return (
        <div className="bg-black/20 p-6 rounded-xl border border-neutral-800 animate-fade-in">
            <header className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">{data.name}</h2>
                <p className="text-lg text-neutral-400">{data.title}</p>
            </header>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard title="Archetype">
                        <p className="text-lg font-semibold">{data.archetype}</p>
                    </InfoCard>
                    <InfoCard title="Unique Selling Proposition (USP)">
                        <p>{data.uniqueSellingProposition}</p>
                    </InfoCard>
                </div>

                <InfoCard title="Mission">
                    <p className="italic">"{data.mission}"</p>
                </InfoCard>

                <InfoCard title="Vision">
                     <p className="italic">"{data.vision}"</p>
                </InfoCard>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoCard title="Keywords">
                        <ul className="flex flex-wrap gap-2">
                            {data.keywords.map((keyword, index) => (
                                <li key={index} className="bg-blue-900/50 text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                                    {keyword}
                                </li>
                            ))}
                        </ul>
                    </InfoCard>
                    <InfoCard title="Values">
                        <ul className="list-disc list-inside space-y-1">
                            {data.values.map((value, index) => (
                                <li key={index}>{value}</li>
                            ))}
                        </ul>
                    </InfoCard>
                    <InfoCard title="Tone of Voice">
                        <p className="font-semibold">{data.toneOfVoice}</p>
                    </InfoCard>
                </div>
            </div>
        </div>
    );
};

export default BrandDnaDisplay;