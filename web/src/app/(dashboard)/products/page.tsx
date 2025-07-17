// src/app/(dashboard)/products/page.tsx
'use client';

import {Package2, Grid, List, Loader2, RefreshCw} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProductFiltersComponent from '@/components/layout/Products/ProductFilters';
import ProductCard from '@/components/layout/Products/ProductCard';
import Pagination from '@/components/ui/pagination';
import { useProductStore } from '@/store/useProductStore';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useCart } from '@/hooks/useCart';

const ProductsPage: React.FC = () => {
    const {
        viewMode,
        filters,
        setFilters,
        setViewMode,
        setPage,
    } = useProductStore();

    // Hooks para datos
    const { categories, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();
    const { getTotalItems } = useCart(); // Hook del carrito para estado global

    const {
        products,
        total,
        totalPages,
        currentPage,
        isLoading: productsLoading,
        error: productsError,
        refetch: refetchProducts
    } = useProducts({
        search: filters.search,
        category: filters.category,
        page: filters.page,
        limit: filters.limit,
    });

    // Manejar cambios en los filtros
    const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
        setFilters(newFilters);
    };

    // Manejar cambio de página
    const handlePageChange = (page: number) => {
        setPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Manejar cambio de elementos por página
    const handleItemsPerPageChange = (limit: number) => {
        setFilters({ limit, page: 1 });
    };

    // Función para reintentar cargar datos
    const handleRetry = () => {
        refetchProducts();
        refetchCategories();
    };

    // Mostrar error si hay problemas críticos
    if (productsError) {
        return (
            <div className="container mx-auto py-6 px-4">
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>
                        Error al cargar los productos. Por favor, verifica tu conexión e inténtalo de nuevo.
                    </AlertDescription>
                </Alert>
                <Button onClick={handleRetry} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                </Button>
            </div>
        );
    }


    return (
        <div className="container mx-auto py-6 px-4 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
                    <p className="text-gray-600 mt-1">
                        {productsLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Cargando productos...
                            </span>
                        ) : (
                            `${total} producto${total !== 1 ? 's' : ''} disponible${total !== 1 ? 's' : ''}`
                        )}
                    </p>
                </div>

                {/* Controles de vista */}
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="gap-2"
                        disabled={productsLoading}
                    >
                        <Grid className="w-4 h-4" />
                        <span className="hidden sm:inline">Cuadrícula</span>
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="gap-2"
                        disabled={productsLoading}
                    >
                        <List className="w-4 h-4" />
                        <span className="hidden sm:inline">Lista</span>
                    </Button>
                </div>
            </div>

            {/* Alerta de error de categorías (no crítico) */}
            {categoriesError && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>
                        No se pudieron cargar las categorías. Los filtros por categoría no estarán disponibles.
                    </AlertDescription>
                </Alert>
            )}

            {/* Filtros */}
            <ProductFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
                totalResults={total}
                isLoading={productsLoading || categoriesLoading}
            />

            {/* Contenido principal */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {productsLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-700">Cargando productos...</p>
                            <p className="text-sm text-gray-500 mt-1">Esto puede tomar unos segundos</p>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <Package2 className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No se encontraron productos
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            No hay productos que coincidan con los filtros seleccionados.
                            Intenta ajustar los criterios de búsqueda.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setFilters({
                                search: '',
                                category: '',
                                priceRange: [0, 1000000],
                                page: 1
                            })}
                            className="gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Limpiar filtros
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Grid de productos */}
                        <div className="p-6">
                            <div className={`grid gap-6 transition-all duration-300 ${
                                viewMode === 'grid'
                                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    : 'grid-cols-1'
                            }`}>
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}

                                    />
                                ))}
                            </div>
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={total}
                                itemsPerPage={filters.limit}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                isLoading={productsLoading}
                                showItemsPerPage={true}
                                itemsPerPageOptions={[12, 24, 36, 48]}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;