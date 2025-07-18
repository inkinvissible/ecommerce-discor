// src/store/useProductStore.ts
import { create } from 'zustand';
import { Product, ProductFilters } from '@/types/product';

interface ProductState {
    products: Product[];
    filters: ProductFilters;
    viewMode: 'grid' | 'list';

    // Actions
    setProducts: (products: Product[]) => void;
    setFilters: (filters: Partial<ProductFilters>) => void;
    updateFilter: (key: keyof ProductFilters, value: ProductFilters[keyof ProductFilters]) => void;
    setViewMode: (mode: 'grid' | 'list') => void;
    setPage: (page: number) => void;
    resetFilters: () => void;
    addToCart: (productId: string, quantity: number) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;

    // Getters
    getFilteredProducts: () => Product[];

}

const defaultFilters: ProductFilters = {
    search: '',
    category: '',
    priceRange: [0, 1000000],
    page: 1,
    limit: 12,
};

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    filters: defaultFilters,
    viewMode: 'grid',

    setProducts: (products) => set({ products }),

    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
    })),

    updateFilter: (key, value) => set((state) => ({
        filters: {
            ...state.filters,
            [key]: value,
            // Resetear página cuando cambian los filtros (excepto cuando es el cambio de página)
            page: key === 'page' && typeof value === 'number' ? value : 1
        }
    })),

    setViewMode: (mode) => set({ viewMode: mode }),

    setPage: (page) => set((state) => ({
        filters: { ...state.filters, page }
    })),

    resetFilters: () => set({ filters: defaultFilters }),

    addToCart: (productId, quantity) => set((state) => ({
        products: state.products.map(product =>
            product.id === productId
                ? { ...product, inCart: true, quantity }
                : product
        )
    })),

    updateQuantity: (productId, quantity) => set((state) => ({
        products: state.products.map(product =>
            product.id === productId
                ? { ...product, quantity }
                : product
        )
    })),

    removeFromCart: (productId) => set((state) => ({
        products: state.products.map(product =>
            product.id === productId
                ? { ...product, inCart: false, quantity: undefined }
                : product
        )
    })),

    getFilteredProducts: () => {
        const { products, filters } = get();
        return products.filter(product => {
            const matchesSearch = product.name.es.toLowerCase().includes(filters.search.toLowerCase()) ||
                product.sku.toLowerCase().includes(filters.search.toLowerCase());
            const matchesCategory = !filters.category || filters.category === 'todos' || product.category.name.es === filters.category;
            const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

            return matchesSearch && matchesCategory && matchesPrice;
        });
    }
}));