import * as React from 'react';
import { generateImageService, editImageService } from '../../services/geminiService';
import { AppContext, ImageResult, HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import { downloadImageFromBase64, fileToBase64 } from '../../utils/fileUtils';
import { ArrowDownTrayIcon, PhotoIcon, XMarkIcon } from '../icons/Icons';

interface ImageGeneratorProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ appContext, history }) => {
    const [prompt, setPrompt] = React.useState('');
    const [aspectRatio, setAspectRatio] = React.useState('1:1');
    const [result, setResult] = React.useState<ImageResult | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [referenceImageFile, setReferenceImageFile] = React.useState<File | null>(null);
    const [referenceImagePreview, setReferenceImagePreview] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Clear results when active brand changes
    React.useEffect(() => {
        setResult(null);
    }, [appContext.activeBrandId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setReferenceImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearReferenceImage = () => {
        setReferenceImageFile(null);
        setReferenceImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            let imageResult;
            if (referenceImageFile) {
                const imageBase64 = await fileToBase64(referenceImageFile);
                imageResult = await editImageService(prompt, imageBase64, referenceImageFile.type);
            } else {
                imageResult = await generateImageService(prompt, aspectRatio);
            }

            setResult(imageResult);
            appContext.addToHistory('image', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Geração de Imagem',
                summary: prompt.substring(0, 40) + '...',
                inputs: { prompt, aspectRatio, hasReference: !!referenceImageFile },
                result: imageResult,
            });
        } catch (err) {
            setError('Falha ao gerar a imagem. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: any) => {
        setPrompt(item.inputs.prompt);
        setAspectRatio(item.inputs.aspectRatio);
        setResult(item.result);
        clearReferenceImage();
    };
    
    const handleDownload = () => {
        if (!result) return;
        const filename = `imagem-gerada-${result.prompt.substring(0, 30).replace(/\s+/g, '-')}.jpeg`;
        downloadImageFromBase64(result.base64, filename);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Gerador de Imagens IA</h2>
                    <p className="text-neutral-400 mt-1">Crie ou edite imagens para seus posts e anúncios a partir de uma descrição.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="prompt" className="block text-sm font-medium text-neutral-300 mb-1">
                                        Descrição da Imagem (Prompt)
                                    </label>
                                    <textarea
                                        id="prompt"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        rows={5}
                                        className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        placeholder="Ex: um astronauta surfando em uma onda cósmica, arte digital, vibrante"
                                        required
                                    />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                                        Imagem de Referência (Opcional)
                                    </label>
                                    <div 
                                        className="relative mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-neutral-700 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors"
                                        onClick={() => !referenceImageFile && fileInputRef.current?.click()}
                                    >
                                        {referenceImagePreview ? (
                                            <>
                                                <img src={referenceImagePreview} alt="Preview da imagem de referência" className="max-h-32 rounded-md object-contain" />
                                                <button type="button" onClick={clearReferenceImage} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/80">
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="space-y-1 text-center">
                                                <PhotoIcon className="mx-auto h-12 w-12 text-neutral-400" />
                                                <p className="text-sm text-neutral-400">Clique para enviar uma imagem</p>
                                                <p className="text-xs text-neutral-500">Use o prompt para descrever a alteração</p>
                                            </div>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Proporção da Imagem
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                                            <button
                                                type="button"
                                                key={ratio}
                                                onClick={() => setAspectRatio(ratio)}
                                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                    aspectRatio === ratio ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                                                } ${referenceImageFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={!!referenceImageFile}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                     {referenceImageFile && <p className="text-xs text-neutral-500 mt-2">A proporção da imagem de referência será mantida.</p>}
                                </div>
                                <Button type="submit" isLoading={isLoading} className="w-full !mt-4">
                                    {referenceImageFile ? 'Editar Imagem' : 'Gerar Imagem'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="h-full">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400">{error}</p>}
                        {result && (
                            <Card className="h-full flex flex-col items-center justify-center p-4">
                                <div className="relative group">
                                    <img
                                        src={`data:image/jpeg;base64,${result.base64}`}
                                        alt={result.prompt}
                                        className="max-w-full max-h-full rounded-lg object-contain"
                                    />
                                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                        <Button size="sm" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                                            Baixar Imagem
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400 mt-2 text-center italic">"{result.prompt}"</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            <HistorySidebar
                history={history}
                onSelect={handleHistorySelect}
                onDelete={(id) => appContext.removeFromHistory('image', id)}
                onClear={() => appContext.clearHistory('image')}
            />
        </div>
    );
};

export default ImageGenerator;