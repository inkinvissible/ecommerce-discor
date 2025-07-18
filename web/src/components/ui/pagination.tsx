// src/components/ui/pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    isLoading?: boolean;
    showItemsPerPage?: boolean;
    itemsPerPageOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    isLoading = false,
    showItemsPerPage = true,
    itemsPerPageOptions = [12, 24, 36, 48]
}) => {
    // Función para generar el rango de páginas a mostrar
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Si hay pocas páginas, mostrar todas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Lógica para mostrar páginas con puntos suspensivos
            if (currentPage <= 3) {
                // Mostrar las primeras páginas
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Mostrar las últimas páginas
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // Mostrar páginas alrededor de la actual
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200">
            {/* Información de elementos */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                    Mostrando {startItem} - {endItem} de {totalItems} productos
                </span>
                
                {showItemsPerPage && (
                    <div className="flex items-center gap-2">
                        <span>Mostrar:</span>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => onItemsPerPageChange(Number(value))}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {itemsPerPageOptions.map((option) => (
                                    <SelectItem key={option} value={option.toString()}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center gap-2">
                {/* Botón anterior */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                </Button>

                {/* Números de página */}
                <div className="flex items-center gap-1">
                    {pageNumbers.map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <span className="px-2 py-1 text-gray-400">
                                    <MoreHorizontal className="w-4 h-4" />
                                </span>
                            ) : (
                                <Button
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(page as number)}
                                    disabled={isLoading}
                                    className="w-8 h-8 p-0"
                                >
                                    {page}
                                </Button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Botón siguiente */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="gap-1"
                >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
