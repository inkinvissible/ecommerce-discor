// src/components/layout/Products/ProductFilters.tsx
import React, {useState, useEffect} from 'react';
import {Search, X, ChevronDown, Filter} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible';
import {ProductFilters, Category} from '@/types/product';
import {formatUppercase} from "@/utils/formatUppercase";

interface ProductFiltersProps {
    filters: ProductFilters;
    onFiltersChange: (filters: Partial<ProductFilters>) => void;
    categories: Category[];
    totalResults?: number;
    isLoading?: boolean;
}

const ProductFiltersComponent: React.FC<ProductFiltersProps> = ({
                                                                    filters,
                                                                    onFiltersChange,
                                                                    categories,
                                                                    totalResults = 0,
                                                                    isLoading = false
                                                                }) => {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search);

    // Sincronizar el valor de búsqueda cuando cambian los filtros externamente
    useEffect(() => {
        if (filters.search !== searchValue) {
            setSearchValue(filters.search);
        }
    }, [filters.search]);

    // Función para ejecutar la búsqueda
    const executeSearch = () => {
        if (searchValue.trim() !== filters.search) {
            onFiltersChange({search: searchValue.trim()});
        }
    };

    // Manejar Enter en el input de búsqueda
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    };

    // Manejar clic en el ícono de búsqueda
    const handleSearchClick = () => {
        executeSearch();
    };

    const updateFilter = (key: keyof ProductFilters, value: string | number[] | string[]) => {
        onFiltersChange({[key]: value});
    };

    const clearFilters = () => {
        setSearchValue('');
        onFiltersChange({
            search: '',
            category: '',
            priceRange: [0, 1000000]
        });
    };

    const clearIndividualFilter = (key: keyof ProductFilters) => {
        if (key === 'search') {
            setSearchValue('');
            onFiltersChange({search: ''});
        } else {
            updateFilter(key, key === 'priceRange' ? [0, 1000000] : '');
        }
    };

    const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
        if (key === 'search') return value !== '';
        if (key === 'priceRange') return value.toString() !== '0,1000000';
        if (key === 'page' || key === 'limit') return false; // No contar page y limit como filtros activos
        return value !== '' && value !== 'todos';
    }).length;

    const getActiveFilters = () => {
        const active = [];

        if (filters.search) {
            active.push({key: 'search', label: `"${filters.search}"`});
        }

        if (filters.category && filters.category !== 'todos' && filters.category !== '') {
            const selectedCategory = categories.find(cat => cat.id === filters.category);
            const categoryLabel = selectedCategory ? selectedCategory.name.es : filters.category;
            active.push({key: 'category', label: categoryLabel});
        }

        return active;
    };

    const activeFilters = getActiveFilters();

    return (
        <div className="space-y-6 mb-6 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            {/* Barra de búsqueda principal */}
            <div className="relative mb-8">
                <div className={`relative transition-all duration-300 ${
                    isSearchFocused ? 'transform scale-[1.02] shadow-lg' : 'shadow-sm'
                }`}>
                    <Input
                        placeholder="Buscar productos por nombre o código... (Enter para buscar)"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        disabled={isLoading}
                        className={`pl-4 pr-20 h-14 text-lg rounded-lg transition-all duration-200 ${
                            isSearchFocused
                                ? 'ring-2 ring-primary/20 border-primary'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    />

                    {/* Botones del lado derecho */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {searchValue && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchValue('');
                                    onFiltersChange({search: ''});
                                }}
                                disabled={isLoading}
                                className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            >
                                <X className="w-4 h-4"/>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSearchClick}
                            disabled={isLoading}
                            className={`h-10 w-10 p-0 rounded-full transition-colors duration-200 cursor-pointer ${
                                isSearchFocused
                                    ? 'text-white hover:bg-primary/90 bg-primary'
                                    : 'text-gray-400 hover:text-white hover:bg-primary'
                            }`}
                        >
                            <Search className="w-5 h-5"/>
                        </Button>
                    </div>
                </div>

                {/* Indicador de resultados */}
                {totalResults > 0 && (
                    <div className="absolute -bottom-12 left-4 text-sm font-medium text-gray-500">
                        {totalResults} producto{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Indicador de búsqueda pendiente */}
                {searchValue !== filters.search && searchValue.trim() !== '' && (
                    <div className="absolute -bottom-7 left-4 text-sm text-primary font-medium">
                        Presiona Enter o haz clic en 🔍 para buscar
                    </div>
                )}
            </div>

            {/* Filtros colapsables */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="space-y-4 mt-12">
                <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="outline"
                            className="gap-2 py-6 px-5 rounded-lg border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                            disabled={isLoading}
                        >
                            <Filter className="w-4 h-4"/>
                            <span className="font-medium">Filtros avanzados</span>
                            {activeFiltersCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                    {activeFiltersCount}
                                </Badge>
                            )}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                                isFiltersOpen ? 'rotate-180' : ''
                            }`}/>
                        </Button>
                    </CollapsibleTrigger>

                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            disabled={isLoading}
                            className="gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                            <X className="w-4 h-4"/>
                            Limpiar filtros
                        </Button>
                    )}
                </div>

                <CollapsibleContent
                    className="transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-hidden">
                    <Card className="mt-4 border-none shadow-md rounded-xl overflow-hidden">
                        <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-white">
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                {/* Filtro por categoría */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        Categoría
                                    </label>
                                    <Select
                                        value={filters.category || 'todos'}
                                        onValueChange={(value) => updateFilter('category', value)}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger
                                            className="h-auto min-h-[2.75rem] bg-white shadow-sm border-gray-200 rounded-lg">
                                            <SelectValue
                                                placeholder="Seleccionar categoría"
                                                className="text-left leading-normal whitespace-normal"
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-gray-200 max-w-none w-full">
                                            <SelectItem value="todos" className="focus:bg-primary/5">
                                                Todas las categorías
                                            </SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id}
                                                    className="focus:bg-primary/5 whitespace-normal break-words min-h-[2.5rem] py-2"
                                                >
                                                    <div className="w-full text-left leading-normal">
                                                        {formatUppercase(category.name.es)}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>

            {/* Filtros activos */}
            {activeFilters.length > 0 && (
                <div className="mt-4 py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-sm font-medium text-gray-600">Filtros activos:</span>
                        {activeFilters.map(({key, label}, index) => (
                            <Badge
                                key={`${key}-${index}`}
                                variant="outline"
                                className="gap-1 py-2 px-3 cursor-pointer bg-white hover:bg-gray-100
                                           transition-colors border-gray-200 text-gray-700 shadow-sm"
                                onClick={() => clearIndividualFilter(key as keyof ProductFilters)}
                            >
                                {label}
                                <X className="w-3 h-3 ml-1 text-gray-500"/>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductFiltersComponent;
