import Image from 'next/image';

export function LoginIllustration() {
    return (
        <div className="flex flex-col items-center justify-center p-12 h-full relative">
            {/* Logo */}
            <div className="absolute top-8 left-8 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">AutoPro</h3>
                    <p className="text-slate-400 text-sm">Sistema de Gestión</p>
                </div>
            </div>

            {/* Imagen principal del auto */}
            <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-2xl">
                    <Image
                        src="/images/login-image.jpg"
                        alt="Auto profesional"
                        className="rounded-xl w-96 h-64 object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
                        width={640}
                        height={400}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl"></div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="text-center space-y-6 max-w-lg">
                <h2 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Gestión Vehicular Inteligente
                </h2>
                <p className="text-slate-300 text-xl leading-relaxed">
                    Administra tu flota, controla mantenimientos y optimiza operaciones desde una plataforma profesional y segura.
                </p>

                {/* Características */}
                <div className="grid grid-cols-3 gap-6 mt-8">
                    <div className="text-center group">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl flex items-center justify-center mb-3 mx-auto border border-white/10 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <p className="text-slate-300 text-sm font-medium">Seguridad</p>
                    </div>
                    <div className="text-center group">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl flex items-center justify-center mb-3 mx-auto border border-white/10 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <p className="text-slate-300 text-sm font-medium">Velocidad</p>
                    </div>
                    <div className="text-center group">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl flex items-center justify-center mb-3 mx-auto border border-white/10 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="text-slate-300 text-sm font-medium">Análisis</p>
                    </div>
                </div>
            </div>
        </div>
    );
}