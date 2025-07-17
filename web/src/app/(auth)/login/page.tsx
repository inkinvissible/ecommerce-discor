// src/app/(auth)/login/page.tsx
"use client";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const [error, setError] = useState("");

    const handleLogin = async (data: { username: string; password: string }) => {
        setError("");

        if (!data.username || !data.password) {
            setError("Por favor completa todos los campos");
            return;
        }

        const result = await login(data);

        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Panel izquierdo - Formulario */}
            <div className="w-1/2 flex flex-col justify-center px-12 lg:px-16 bg-gray-50">
                <div className="max-w-md mx-auto w-full">
                    {/* Logo */}
                    <div className="mb-8">
                        <Image
                            src={"/images/logo-discor.png"}
                            alt={"Logo de DisCor: Cerrajería y Accesorios"}
                            height={40}
                            width={190}
                        />
                        <p className="text-gray-600 mt-2">Sistema E-commerce exclusivo clientes</p>
                    </div>

                    {/* Título */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Iniciar Sesión
                        </h1>
                        <p className="text-gray-600">
                            Accede a tu panel de administración
                        </p>
                    </div>

                    {/* Mensaje de error */}
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Formulario */}
                    <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

                    {/* Enlaces de ayuda */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            ¿Necesitas ayuda?{" "}
                            <a href="#" className="text-primary hover:text-shadow-primary transition-all ease-in-out duration-300 font-semibold underline">
                                Soporte técnico
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Panel derecho - Imagen */}
            <div className="w-1/2 relative">
                <Image
                    src="/images/login-image.jpg"
                    alt="Auto profesional"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/80"></div>

                {/* Contenido superpuesto */}
                <div className="absolute inset-0 flex flex-col justify-center px-8 lg:px-12 text-white">
                    <div className="max-w-lg">
                        <h2 className="text-4xl font-bold mb-8 leading-tight">
                            4 simples pasos para que realices tu pedido
                        </h2>

                        <div className="space-y-6">
                            {/* Paso 1 */}
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-cyan-800 rounded-full flex items-center justify-center font-bold text-lg">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Iniciá sesión</h3>
                                    <p className="text-gray-200 text-sm">
                                        Para poder ver todos nuestros productos
                                    </p>
                                </div>
                            </div>

                            {/* Paso 2 */}
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-cyan-800 rounded-full flex items-center justify-center font-bold text-lg">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Buscá el producto</h3>
                                    <p className="text-gray-200 text-sm">
                                        Que necesitás y seleccioná la cantidad
                                    </p>
                                </div>
                            </div>

                            {/* Paso 3 */}
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-cyan-800 rounded-full flex items-center justify-center font-bold text-lg">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Agregalo al carrito</h3>
                                    <p className="text-gray-200 text-sm">
                                        Revisá todos los productos seleccionados
                                    </p>
                                </div>
                            </div>

                            {/* Paso 4 */}
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-cyan-800 rounded-full flex items-center justify-center font-bold text-lg">
                                    4
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Realizá tu pedido</h3>
                                    <p className="text-gray-200 text-sm">
                                        Y lo estaremos preparando para vos
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/20">
                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Proceso rápido y seguro</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}