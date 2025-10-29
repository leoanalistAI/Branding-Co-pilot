import { SparklesIcon, IdentificationIcon, PencilSquareIcon, CubeIcon, MagnifyingGlassIcon } from '../icons/Icons';

interface LandingPageProps {
    onStart: () => void;
}

const features = [
    {
        name: 'Defina seu DNA de Marca',
        description: 'Construa a fundação da sua marca pessoal, definindo sua missão, pilares e voz única.',
        icon: IdentificationIcon,
    },
    {
        name: 'Crie Conteúdo Autêntico',
        description: 'Gere ideias para posts, roteiros de vídeo e newsletters que ressoam com sua audiência.',
        icon: PencilSquareIcon,
    },
    {
        name: 'Desenvolva Produtos',
        description: 'Transforme seu conhecimento em produtos e serviços digitais, de e-books a cursos online.',
        icon: CubeIcon,
    },
    {
        name: 'Otimize para Descoberta',
        description: 'Encontre as palavras-chave certas para que seu público encontre você e seu conteúdo.',
        icon: MagnifyingGlassIcon,
    },
]

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="bg-black min-h-screen text-neutral-200 font-sans">
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#8085ff] to-[#3388ff] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
                <div className="mx-auto max-w-2xl py-24 sm:py-32">
                    <div className="text-center">
                        <SparklesIcon className="w-16 h-16 mx-auto text-blue-500" />
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            Branding Co-pilot
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-neutral-300">
                            Sua IA assistente para construir, gerenciar e escalar sua marca pessoal na internet.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <button
                                onClick={onStart}
                                className="rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                            >
                                Começar Agora
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8 pb-24">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-blue-400">Tudo em um só lugar</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ferramentas inteligentes para cada etapa da sua jornada
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                            {features.map((feature) => (
                                <div key={feature.name} className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-white">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                            <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </div>
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-neutral-400">{feature.description}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;