export interface Address {
    id: string;
    clientId: string;
    alias: string;
    street: string;
    city: string;
    province: string;
    zipCode: string;
    isDefaultShipping: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ShippingZone {
    id: string;
    name: string;
    freeShippingThreshold: string;
}

export interface PricingConfig {
    id: string;
    clientId: string;
    markupPercentage: string;
    createdAt: string;
    updatedAt: string;
}

export interface Client {
    id: string;
    businessName: string;
    cuit: string;
    erpCode: string;
    priceListId: number;
    discountPercentage: string;
    applyVat: boolean;
    addresses: Address[];
    shippingZone: ShippingZone;
    pricingConfigs: PricingConfig;
}

export interface Profile {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    client: Client;
    roles: string[];
}