import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { SplineScene } from '../components/ui/spline';

const Login: React.FC = () => {
    return (
        <div className="h-screen w-full relative flex items-center justify-center bg-black overflow-hidden p-4">
            <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="!absolute !inset-0 !w-full !h-full z-0 opacity-20"
            />
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-black/50 backdrop-blur-lg border border-neutral-800 rounded-xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-neutral-50">Bem-vindo de volta!</h1>
                        <p className="text-neutral-400">Faça login para continuar construindo sua marca.</p>
                    </div>
                    <Auth
                        supabaseClient={supabase}
                        appearance={{ theme: ThemeSupa }}
                        providers={['google', 'github']}
                        theme="dark"
                        localization={{
                            variables: {
                                sign_in: {
                                    email_label: 'Endereço de e-mail',
                                    password_label: 'Sua senha',
                                    button_label: 'Entrar',
                                    social_provider_text: 'Entrar com {{provider}}',
                                    link_text: 'Já tem uma conta? Entre',
                                },
                                sign_up: {
                                    email_label: 'Endereço de e-mail',
                                    password_label: 'Crie uma senha',
                                    button_label: 'Criar conta',
                                    social_provider_text: 'Cadastre-se com {{provider}}',
                                    link_text: 'Não tem uma conta? Cadastre-se',
                                },
                                forgotten_password: {
                                    email_label: 'Endereço de e-mail',
                                    button_label: 'Enviar instruções',
                                    link_text: 'Esqueceu sua senha?',
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;