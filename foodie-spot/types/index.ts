export interface Restaurant {
    id: string;
    name: string;
    cuisine: string;
    description: string;
    image: string;
    rating: number;
    reviewsCount: number;
    deliveryTime: number | { min: number; max: number };
    distance: number;
    priceRange: string;
    address: string;
    phone: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    isOpen: boolean;
    isFavorite: boolean;
}

export interface SearchFilters {
    cuisine?: string;
    priceRange?: string;
    rating?: number;
    deliveryTime?: number;
    isOpen?: boolean;
}
export interface Dish {
    id: string;
    resurantId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    allergens?: string[];
    isAvailable: boolean;
}


export interface CartItem {
    dish: Dish;
    quantity: number;
    options?: string[];
    specialInstructions?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    photo?: string;
    addresses: Address[];
    favoriteRestaurants: string[];
}

export interface Address {
    id: string;
    label: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}
export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'picked_up'
    | 'delivering'
    | 'on-the-way'
    | 'delivered'
    | 'cancelled';

export interface OrderTimelineItem {
    status: OrderStatus;
    timestamp: string;
    message?: string;
}

export interface OrderTrackingStep {
    key: OrderStatus;
    label: string;
    completed: boolean;
    time?: string;
}

export interface OrderTracking {
    orderId: string;
    orderNumber?: string;
    status: OrderStatus;
    timeline?: OrderTimelineItem[];
    steps?: OrderTrackingStep[];
    estimatedDelivery?: string;
    estimatedArrival?: string;
    estimatedMinutes?: number;
    restaurant?: {
        id: string;
        name: string;
        image?: string;
        phone?: string;
        location?: {
            latitude: number;
            longitude: number;
            address?: string;
        };
    } | null;
    deliveryAddress?: Address | string;
    driver?: {
        id: string;
        name: string;
        phone?: string;
        photo?: string;
        vehicle?: string;
        rating?: number;
        totalDeliveries?: number;
    };
    driverLocation?: {
        latitude: number;
        longitude: number;
        heading?: number;
        speed?: number;
        updatedAt?: string;
    };
}

export interface Order {
    id: string;
    restaurantId: string;
    restaurantName: string;
    items: CartItem[];
    total: number;
    deliveryFee: number;
    status: OrderStatus;
    createdAt: Date | string;
    estimatedDeliveryTime?: Date | string;
    deliveryAddress: Address | string;
    orderNumber?: string;
    timeline?: OrderTimelineItem[];
    driverInfo?: {
        id?: string;
        name: string;
        phone: string;
        photo?: string;
        avatar?: string;
        vehicle?: string;
        licensePlate?: string | null;
        rating?: number;
        totalDeliveries?: number;
        location?: {
            latitude: number;
            longitude: number;
        };
    };
}

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

export interface ToastOptions {
    type?: ToastType;
    duration?: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastContextType { 
    show: (message: string,  type?: ToastType, duration?: number) => void;
    success: (message: string,  duration?: number) => void;
    error: (message: string,  duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string,  duration?: number) =>  void;
}


export interface ToastStackProps {
    toasts: ToastMessage[];
}

export interface ToastItemProps {
    toast: ToastMessage;
    index: number;
}
