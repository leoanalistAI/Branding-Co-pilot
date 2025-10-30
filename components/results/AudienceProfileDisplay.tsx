import React from 'react';
import { AudienceProfile } from '../../types';
import { UserGroupIcon } from '../icons';

interface AudienceProfileDisplayProps {
    data: AudienceProfile;
}

const InfoSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div className="bg-neutral-800/50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">{title}</h3>
        <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    </div>
);

const AudienceProfileDisplay: React.FC<AudienceProfileDisplayProps> = ({ data }) => {
    return (
        <div className="bg-black/20 p-6 rounded-xl border border-neutral-800 animate-fade-in">
            <header className="text-center mb-8">
                <UserGroupIcon className="w-12 h-12 mx-auto text-blue-400 mb-2" />
                <h2 className="text-3xl font-bold text-white">{data.name}</h2>
                <p className="text-neutral-400 max-w-2xl mx-auto mt-2">{data.description}</p>
            </header>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoSection title="Sonhos e Aspirações" items={data.dreamsAndAspirations} />
                    <InfoSection title="Medos e Frustrações" items={data.fearsAndFrustrations} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoSection title="Pensamentos Diários" items={data.dailyThoughts} />
                    <InfoSection title="Desejos Secretos" items={data.secretWishes} />
                </div>
            </div>
        </div>
    );
};

export default AudienceProfileDisplay;