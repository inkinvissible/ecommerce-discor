"use client";

import { useState } from "react";
import Image from "next/image";
import {
    TransformWrapper,
    TransformComponent,
    useControls,
} from "react-zoom-pan-pinch";
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Maximize2,
    Loader2,
    Package,
    X, // Importar el ícono X
} from "lucide-react";
import {
    Dialog,
    DialogClose, // Importar DialogClose
    DialogContent,
    DialogTrigger,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Interfaz de props para el componente principal
interface ProductImageZoomProps {
    sku: string;
    alt: string;
    className?: string;
}

// Componente para los controles de Zoom (interno)
const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    return (
        <TooltipProvider>
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            className="h-10 w-10 rounded-full p-2.5 shadow-lg"
                            onClick={() => zoomIn()}
                        >
                            <ZoomIn className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Acercar</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            className="h-10 w-10 rounded-full p-2.5 shadow-lg"
                            onClick={() => zoomOut()}
                        >
                            <ZoomOut className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Alejar</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            className="h-10 w-10 rounded-full p-2.5 shadow-lg"
                            onClick={() => resetTransform()}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Restablecer</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};

// Componente principal ProductImageZoom
const ProductImageZoom = ({ sku, alt }: ProductImageZoomProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const imageUrl = `https://discor.multisoft.ar/images/${sku}.jpg`;

    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div
                    className={
                        "group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg border bg-gray-50 shadow-sm transition-shadow hover:shadow-md"
                    }
                >
                    {/* Indicador de Carga */}
                    {isLoading && !hasError && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/80">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {/* Estado de Error */}
                    {hasError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100 text-center">
                            <Package className="h-12 w-12 text-gray-400" />
                            <p className="text-sm font-medium text-gray-600">
                                Imagen no disponible
                            </p>
                        </div>
                    )}

                    {/* Imagen */}
                    {!hasError && (
                        <Image
                            src={imageUrl}
                            alt={alt}
                            fill
                            className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}

                    {/* Overlay con ícono para ampliar */}
                    {!isLoading && !hasError && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                            <div className="translate-y-4 scale-90 rounded-full bg-white/90 p-3 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                                <Maximize2 className="h-6 w-6 text-gray-800" />
                            </div>
                        </div>
                    )}
                </div>
            </DialogTrigger>

            {/* Contenido del Modal de Zoom */}
            <DialogContent className="h-svh w-screen max-w-none border-0 bg-black/80 p-0 sm:p-6 backdrop-blur-md sm:h-[90svh] sm:w-[90vw] sm:rounded-2xl shadow-xl transition-all duration-300 ease-out">
                <DialogTitle className="sr-only">Zoom de imagen</DialogTitle>
                {/* Botón de cierre visible y accesible */}
                <DialogClose className="absolute top-4 left-4 z-50 rounded-full bg-white/80 p-2.5 text-black transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary sm:left-auto sm:right-4">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Cerrar</span>
                </DialogClose>

                {/* Interacción con zoom/pan */}
                <TransformWrapper
                    initialScale={1}
                    minScale={0.8}
                    maxScale={8}
                    doubleClick={{ disabled: true }}
                    wheel={{ step: 0.15 }}
                >
                    <>
                        {/* Opcional: controles de zoom si querés permitirlos */}
                        {/* <Controls /> */}

                        <TransformComponent
                            wrapperStyle={{ width: '100%', height: '100%' }}
                            contentStyle={{ width: '100%', height: '100%' }}
                        >
                            <div className="relative flex h-full w-full items-center justify-center px-4 py-8 sm:px-8 sm:py-10">
                                {/* Loader al centro */}
                                {isLoading && !hasError && (
                                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                                )}

                                {/* Error de carga */}
                                {hasError && (
                                    <div className="flex flex-col items-center justify-center gap-3 text-center text-gray-300">
                                        <Package className="h-14 w-14 text-gray-400" />
                                        <p className="font-medium text-sm sm:text-base">
                                            No se pudo cargar la imagen.
                                        </p>
                                    </div>
                                )}

                                {/* Imagen con transición de carga */}
                                {!hasError && (
                                    <Image
                                        src={imageUrl}
                                        alt={alt}
                                        fill
                                        className="object-contain transition-opacity duration-300 ease-in-out"
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                        sizes="100vw"
                                    />
                                )}
                            </div>
                        </TransformComponent>
                    </>
                </TransformWrapper>
            </DialogContent>
        </Dialog>
    );
};

export default ProductImageZoom;