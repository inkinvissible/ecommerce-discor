// src/types/dashboard.ts
export interface Order {
    id: string;
    date: string;
    total: number;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Category {
    id: string;
    name: string;
}