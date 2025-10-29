import React, { useState } from 'react';
import { KeyIcon, ArrowRightIcon } from '../icons/Icons';

interface ApiKeySetupProps {
    onKeySubmit: (key: string) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeySubmit }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onKeySubmit(apiKey.trim());
        }
    };

    return (
        <div className="bg-black min-h-screen flex items-center justify-center text-neutral-200 font-sans p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <KeyIcon className="w-12 h-12 mx-auto text-blue-500" />
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
                        Configure sua Chave de API
                    </h1>
                    <p className="mt-3 text-neutral-400">
                        Para usar o Branding Co-pilot, você precisa de uma chave de API do Google AI Studio.
                    </p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="api-key" className="block text-sm font-medium leading-6 text-neutral-300">
                                Chave de API do Gemini
                            </label>
                            <div className="mt-2">
                                <input
                                    id="api-key"
                                    name="api-key"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition"
                            >
                                Salvar e Continuar
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Não tem uma chave? Obtenha uma aqui &rarr;
                    </a>
                    <p className="text-xs text-neutral-500 mt-2">
                        Sua chave de API é armazenada apenas no seu navegador e nunca é enviada para nossos servidores.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApiKeySetup;