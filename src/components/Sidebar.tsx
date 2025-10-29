import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  context: string;
  setContext: (context: string) => void;
  brandDNA: string;
  setBrandDNA: (dna: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab, context, setContext, brandDNA, setBrandDNA }: SidebarProps) => {
  const [isContextOpen, setIsContextOpen] = useState(true);

  const tabs = [
    'DNA da Marca',
    'Otimizador de Perfil',
    'Estúdio de Conteúdo',
    'SEO Pessoal',
    'Gerador de Imagens',
    'Desenvolvimento de Produtos',
    'Brainstorm de Marca',
    'Calendário Editorial',
    'Análise de Influência',
    'Jornada da Audiência',
    'Analisador de Vídeo',
  ];

  return (
    <aside className="w-80 bg-gray-800 p-4 flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Personal Branding</h1>
        <h2 className="text-md text-purple-400">Co-pilot</h2>
      </div>

      <div className="mt-4">
        <button
          onClick={() => setIsContextOpen(!isContextOpen)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <span>Contexto</span>
          {isContextOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isContextOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mt-2 space-y-2">
            <textarea
              className="w-full h-24 p-2 bg-gray-700 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Insira o contexto principal aqui..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
            <textarea
              className="w-full h-24 p-2 bg-gray-700 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Insira o DNA da sua marca aqui..."
              value={brandDNA}
              onChange={(e) => setBrandDNA(e.target.value)}
            />
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 overflow-y-auto">
        <ul>
          {tabs.map((tab) => (
            <li key={tab}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab);
                }}
                className={`block px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {tab}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;