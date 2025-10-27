import React, { useState } from 'react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { SplineScene } from '../ui/spline';

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
        <div className="h-screen w-full relative flex items-center justify-center bg-black overflow-hidden p-4">
            <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="!absolute !inset-0 !w-full !h-full z-0 opacity-20"
            />
            <div className="relative z-10">
                <Card className="max-w-md w-full mx-auto bg-black/50 backdrop-blur-lg">
                    <CardHeader>
                        <CardTitle>Configure sua Chave de API Gemini</CardTitle>
                        <CardDescription>
                            Para usar o Branding Copilot, você precisa de sua própria chave de API do Google AI Studio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="apiKey" className="sr-only">
                                    API Key
                                </label>
                                <input
                                    id="apiKey"
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                    placeholder="Cole sua chave de API aqui"
                                    required
                                />
                            </div>
                            <p className="text-xs text-neutral-400">
                                Sua chave é armazenada localmente no seu navegador e nunca é enviada para nossos servidores.
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                                    Obtenha sua chave aqui.
                                </a>
                            </p>
                            <Button type="submit" className="w-full">
                                Salvar e Começar a Criar
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ApiKeySetup;
