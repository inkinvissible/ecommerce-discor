'use client';

import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-4 py-8">
                {/* Sección principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Información de la empresa */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            DisCor: Cerrajería y Accesorios
                        </h3>

                        <div className="flex items-center">
                            <Image
                                alt="Logo DisCor"
                                src="/images/logo-discor.png"
                                height={40}
                                width={100}
                                className="object-contain"
                            />
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">Comunícate con nosotros</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-10 h-10 p-1 hover:bg-gray-100 rounded-full"
                                asChild
                            >
                                <a
                                    href="https://wa.me/543517638778"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Contactar por WhatsApp"
                                >
                                    <Image
                                        alt="WhatsApp"
                                        src="/images/whatsapp-icon.webp"
                                        height={32}
                                        width={32}
                                        className="object-contain"
                                    />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Soporte */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Soporte
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Centro de ayuda
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Reportar problema
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Términos de servicio
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Política de privacidad
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Información de contacto */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Contacto
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>infodiscor@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>+54 351 7638778</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>Córdoba, Argentina</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Sección inferior */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <span>© {currentYear} DisCor. Hecho con</span>
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>por Agustín Martin</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span>Versión 1.0.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;