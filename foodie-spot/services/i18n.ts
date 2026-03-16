// services/i18n.ts – Lightweight EN/FR translation service

export type Language = 'fr' | 'en';

export interface Translations {
    common: {
        loading: string;
        error: string;
        cancel: string;
        retry: string;
        ok: string;
    };
    home: {
        searchPlaceholder: string;
        nearby: string;
        categories: string;
        noRestaurantsFound: string;
        specialOffer: string;
    };
    search: {
        placeholder: string;
        filterToggle: string;
        resultsOne: string;
        resultsMany: string;
        noResults: string;
        recentSearches: string;
        suggestions: string;
    };
    cart: {
        title: string;
        empty: string;
        emptySubtitle: string;
        addToCart: string;
        each: string;
        subtotal: string;
        delivery: string;
        total: string;
        placeOrder: string;
        summary: string;
        added: string;
    };
    orders: {
        title: string;
        noOrders: string;
        all: string;
        inProgress: string;
        delivered: string;
        cancelled: string;
    };
    tracking: {
        title: string;
        order: string;
        estimatedDelivery: string;
        updating: string;
        deliveryAddress: string;
        liveTracking: string;
        updatedAt: string;
        map: string;
        mapSubtitle: string;
        restaurant: string;
        you: string;
        driverApproaching: string;
        driverUnavailable: string;
        driver: string;
        driverSoon: string;
        deliveries: string;
        timeline: string;
        timelineUpdating: string;
        pullToRefresh: string;
        loadingText: string;
        errorTitle: string;
        noData: string;
        statusPending: string;
        statusConfirmed: string;
        statusPreparing: string;
        statusReady: string;
        statusPickedUp: string;
        statusDelivering: string;
        statusDelivered: string;
        statusCancelled: string;
    };
    profile: {
        logout: string;
        logoutTitle: string;
        logoutMessage: string;
        addresses: string;
        favourites: string;
        orderHistory: string;
        support: string;
        shareApp: string;
        darkMode: string;
        language: string;
        permissionRequired: string;
        photoPermission: string;
        photoUpdated: string;
        photoError: string;
    };
}

const fr: Translations = {
    common: {
        loading: 'Chargement...',
        error: 'Erreur',
        cancel: 'Annuler',
        retry: 'Réessayer',
        ok: 'OK',
    },
    home: {
        searchPlaceholder: 'Rechercher un restaurant...',
        nearby: 'À proximité',
        categories: 'Catégories',
        noRestaurantsFound: 'Aucun restaurant trouvé',
        specialOffer: 'Offre spéciale',
    },
    search: {
        placeholder: 'Rechercher un restaurant',
        filterToggle: 'Filtres',
        resultsOne: 'restaurant trouvé',
        resultsMany: 'restaurants trouvés',
        noResults: 'Aucun restaurant ne correspond à votre recherche',
        recentSearches: 'Recherches récentes',
        suggestions: 'Suggestions',
    },
    cart: {
        title: 'Panier',
        empty: 'Votre panier est vide',
        emptySubtitle: 'Ajoutez des plats pour continuer.',
        addToCart: 'Ajouter au panier',
        each: 'chacun',
        subtotal: 'Sous-total',
        delivery: 'Livraison',
        total: 'Total',
        placeOrder: 'Passer la commande',
        summary: 'Résumé',
        added: 'Ajouté au panier !',
    },
    orders: {
        title: 'Mes commandes',
        noOrders: 'Aucune commande trouvée.',
        all: 'Tout',
        inProgress: 'En cours',
        delivered: 'Livré',
        cancelled: 'Annulé',
    },
    tracking: {
        title: 'Suivi de commande',
        order: 'Commande',
        estimatedDelivery: 'Livraison estimée',
        updating: "En cours d'actualisation",
        deliveryAddress: 'Adresse de livraison',
        liveTracking: 'Temps réel activé',
        updatedAt: 'Màj',
        map: 'Carte',
        mapSubtitle: 'Aperçu de la position',
        restaurant: 'Restaurant',
        you: 'Vous',
        driverApproaching: 'Livreur en approche',
        driverUnavailable: 'Position du livreur indisponible',
        driver: 'Livreur',
        driverSoon: 'Le livreur sera assigné bientôt.',
        deliveries: 'livraisons',
        timeline: 'Suivi en temps réel',
        timelineUpdating: 'Mise à jour en cours…',
        pullToRefresh: 'Tirez pour actualiser',
        loadingText: 'Chargement du suivi…',
        errorTitle: 'Impossible de charger le suivi',
        noData: 'Aucune donnée de suivi disponible.',
        statusPending: 'Commande reçue',
        statusConfirmed: 'Confirmée par le restaurant',
        statusPreparing: 'En préparation',
        statusReady: 'Prête',
        statusPickedUp: 'Récupérée par le livreur',
        statusDelivering: 'En cours de livraison',
        statusDelivered: 'Livrée ✓',
        statusCancelled: 'Annulée',
    },
    profile: {
        logout: 'Déconnexion',
        logoutTitle: 'Déconnexion',
        logoutMessage: 'Êtes-vous sûr de vouloir vous déconnecter ?',
        addresses: 'Mes adresses',
        favourites: 'Mes favoris',
        orderHistory: 'Historique',
        support: 'Support',
        shareApp: "Partager l'app",
        darkMode: 'Mode sombre',
        language: 'Langue',
        permissionRequired: 'Permission requise',
        photoPermission: "Nous avons besoin d'accéder à vos photos",
        photoUpdated: 'Photo de profil mise à jour !',
        photoError: 'Impossible de télécharger la photo',
    },
};

const en: Translations = {
    common: {
        loading: 'Loading...',
        error: 'Error',
        cancel: 'Cancel',
        retry: 'Try again',
        ok: 'OK',
    },
    home: {
        searchPlaceholder: 'Search for a restaurant...',
        nearby: 'Nearby',
        categories: 'Categories',
        noRestaurantsFound: 'No restaurants found',
        specialOffer: 'Special offer',
    },
    search: {
        placeholder: 'Search for a restaurant',
        filterToggle: 'Filters',
        resultsOne: 'restaurant found',
        resultsMany: 'restaurants found',
        noResults: 'No restaurants match your search',
        recentSearches: 'Recent searches',
        suggestions: 'Suggestions',
    },
    cart: {
        title: 'Cart',
        empty: 'Your cart is empty',
        emptySubtitle: 'Add dishes to continue.',
        addToCart: 'Add to cart',
        each: 'each',
        subtotal: 'Subtotal',
        delivery: 'Delivery',
        total: 'Total',
        placeOrder: 'Place order',
        summary: 'Summary',
        added: 'Added to cart!',
    },
    orders: {
        title: 'My orders',
        noOrders: 'No orders found.',
        all: 'All',
        inProgress: 'In progress',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    },
    tracking: {
        title: 'Order tracking',
        order: 'Order',
        estimatedDelivery: 'Estimated delivery',
        updating: 'Updating…',
        deliveryAddress: 'Delivery address',
        liveTracking: 'Live tracking enabled',
        updatedAt: 'Updated',
        map: 'Map',
        mapSubtitle: 'Live location overview',
        restaurant: 'Restaurant',
        you: 'You',
        driverApproaching: 'Driver approaching',
        driverUnavailable: 'Driver location unavailable',
        driver: 'Driver',
        driverSoon: 'Driver will be assigned soon.',
        deliveries: 'deliveries',
        timeline: 'Live Timeline',
        timelineUpdating: 'Timeline updating…',
        pullToRefresh: 'Pull to refresh tracking',
        loadingText: 'Loading tracking…',
        errorTitle: 'Unable to load tracking',
        noData: 'No tracking data available.',
        statusPending: 'Order received',
        statusConfirmed: 'Confirmed by restaurant',
        statusPreparing: 'Preparing',
        statusReady: 'Ready',
        statusPickedUp: 'Picked up by driver',
        statusDelivering: 'Out for delivery',
        statusDelivered: 'Delivered ✓',
        statusCancelled: 'Cancelled',
    },
    profile: {
        logout: 'Logout',
        logoutTitle: 'Logout',
        logoutMessage: 'Are you sure you want to log out?',
        addresses: 'My addresses',
        favourites: 'My favourites',
        orderHistory: 'Order history',
        support: 'Support',
        shareApp: 'Share the app',
        darkMode: 'Dark mode',
        language: 'Language',
        permissionRequired: 'Permission required',
        photoPermission: 'We need access to your photos',
        photoUpdated: 'Profile photo updated!',
        photoError: 'Failed to upload photo',
    },
};

const dictionaries: Record<Language, Translations> = { fr, en };

let _currentLanguage: Language = 'fr';

export const i18n = {
    getLanguage: (): Language => _currentLanguage,
    setLanguage: (lang: Language) => { _currentLanguage = lang; },
    t: (lang?: Language): Translations => dictionaries[lang ?? _currentLanguage],
};
