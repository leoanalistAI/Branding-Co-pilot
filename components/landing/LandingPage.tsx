import React, { FC } from 'react';
import { SplineScene } from "../ui/spline";
import { Spotlight } from "../ui/spotlight";
import { RainbowButton } from '../ui/rainbow-button';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="h-screen w-full relative flex items-center justify-center bg-black overflow-hidden">
        <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="blue"
        />
        <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="!absolute !inset-0 !w-full !h-full z-0" 
        />
        <div className="relative z-10 flex flex-col items-center text-center p-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-2">
                Construa sua Marca Pessoal com IA
            </h1>
            <p className="mt-4 text-neutral-300 max-w-2xl mx-auto">
                Sua ferramenta especialista para otimizar perfis, criar conteúdo de autoridade e se destacar profissionalmente no mercado digital.
            </p>
            <div className="mt-8">
                <RainbowButton onClick={onStart}>
                    Começar a Criar
                </RainbowButton>
            </div>
        </div>
    </div>
  )
}

export default LandingPage;