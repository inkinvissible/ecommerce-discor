// src/components/layout/Products/ProductCardSkeleton.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCardSkeletonProps {
    count?: number;
    viewMode?: 'grid' | 'list';
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ 
    count = 12, 
    viewMode = 'grid' 
}) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                        {viewMode === 'grid' ? (
                            <div className="space-y-4">
                                {/* Imagen */}
                                <Skeleton className="aspect-square w-full rounded-lg" />
                                
                                {/* Título */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                
                                {/* Precio */}
                                <Skeleton className="h-6 w-1/3" />
                                
                                {/* Botón */}
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                {/* Imagen */}
                                <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                                
                                {/* Contenido */}
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </>
    );
};

export default ProductCardSkeleton;
