// services/i18n.ts – Lightweight EN/FR translation service

export type Language = 'fr' | 'en';

// ---------------------------------------------------------------------------
// Shape of the translation dictionaries
// ---------------------------------------------------------------------------
export interface Translations {
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    ok: string;
    noResults: string;
    min: string;
    km: string;
  };
  home: {
    deliverTo: string;
    locating: string;
    searchPlaceholder: string;
    nearby: string;
    noRestaurantsFound: string;
    specialOffer: string;
    categories: string;
    promoCodePrefix: string;
    errorLoad: string;
    refresh: string;
  };
  search: {
    placeholder: string;
    filterToggle: string;
    resultsOne: string;
    resultsMany: string;
    noResults: string;
  };
  profile: {
    title: string;
    logout: string;
    logoutTitle: string;
    logoutMessage: string;
    permissionRequired: string;
    photoPermission: string;
    photoUpdated: string;
    photoError: string;
  };
  orders: {
    title: string;
    noOrders: string;
    all: string;
    inProgress: string;
    delivered: string;
    cancelled: string;
  };
  notifications: {
    title: string;
  };
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    forgotPassword: string;
    noAccount: string;
    alreadyAccount: string;
    loginError: string;
    registerError: string;
  };
}

// ---------------------------------------------------------------------------
// Translation dictionaries
// ---------------------------------------------------------------------------
const fr: Translations = {
  common: {
    loading: 'Chargement...',
    error: 'Erreur',
    retry: 'Réessayer',
    cancel: 'Annuler',
    ok: 'OK',
    noResults: 'Aucun résultat',
    min: 'min',
    km: 'km',
  },
  home: {
    deliverTo: 'Livraison à',
    locating: 'Localisation...',
    searchPlaceholder: 'Rechercher un restaurant...',
    nearby: 'À proximité',
    noRestaurantsFound: 'Aucun restaurant trouvé',
    specialOffer: 'Offre spéciale',
    categories: 'Catégories',
    promoCodePrefix: 'Code',
    errorLoad: 'Impossible de charger les restaurants',
    refresh: 'Actualiser',
  },
  search: {
    placeholder: 'Rechercher un restaurant',
    filterToggle: 'Filtres',
    resultsOne: 'restaurant trouvé',
    resultsMany: 'restaurants trouvés',
    noResults: 'Aucun restaurant ne correspond à votre recherche',
  },
  profile: {
    title: 'Profil',
    logout: 'Déconnexion',
    logoutTitle: 'Déconnexion',
    logoutMessage: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    permissionRequired: 'Permission requise',
    photoPermission: "Nous avons besoin d'accéder à vos photos",
    photoUpdated: 'Photo de profil mise à jour !',
    photoError: 'Impossible de télécharger la photo',
  },
  orders: {
    title: 'Mes commandes',
    noOrders: 'Aucune commande pour ce filtre.',
    all: 'Tout',
    inProgress: 'En cours',
    delivered: 'Livré',
    cancelled: 'Annulé',
  },
  notifications: {
    title: 'Notifications',
  },
  auth: {
    login: 'Connexion',
    register: "S'inscrire",
    email: 'Email',
    password: 'Mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    phone: 'Téléphone',
    forgotPassword: 'Mot de passe oublié ?',
    noAccount: "Pas encore de compte ?",
    alreadyAccount: 'Déjà un compte ?',
    loginError: 'Identifiants incorrects',
    registerError: "Échec de l'inscription",
  },
};

const en: Translations = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Try again',
    cancel: 'Cancel',
    ok: 'OK',
    noResults: 'No results',
    min: 'min',
    km: 'km',
  },
  home: {
    deliverTo: 'Deliver to',
    locating: 'Locating...',
    searchPlaceholder: 'Search for a restaurant...',
    nearby: 'Nearby',
    noRestaurantsFound: 'No restaurants found',
    specialOffer: 'Special offer',
    categories: 'Categories',
    promoCodePrefix: 'Code',
    errorLoad: 'Failed to load restaurants',
    refresh: 'Refresh',
  },
  search: {
    placeholder: 'Search for a restaurant',
    filterToggle: 'Filters',
    resultsOne: 'restaurant found',
    resultsMany: 'restaurants found',
    noResults: 'No restaurants match your search',
  },
  profile: {
    title: 'Profile',
    logout: 'Logout',
    logoutTitle: 'Logout',
    logoutMessage: 'Are you sure you want to log out?',
    permissionRequired: 'Permission required',
    photoPermission: 'We need access to your photos',
    photoUpdated: 'Profile photo updated!',
    photoError: 'Failed to upload photo',
  },
  orders: {
    title: 'My orders',
    noOrders: 'No orders for this filter.',
    all: 'All',
    inProgress: 'In progress',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  },
  notifications: {
    title: 'Notifications',
  },
  auth: {
    login: 'Login',
    register: 'Sign up',
    email: 'Email',
    password: 'Password',
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone',
    forgotPassword: 'Forgot password?',
    noAccount: 'No account yet?',
    alreadyAccount: 'Already have an account?',
    loginError: 'Incorrect credentials',
    registerError: 'Registration failed',
  },
};

const dictionaries: Record<Language, Translations> = { fr, en };

// ---------------------------------------------------------------------------
// Plain accessor used outside React (e.g. services, tests)
// ---------------------------------------------------------------------------
let _currentLanguage: Language = 'fr';

export const i18n = {
  getLanguage: (): Language => _currentLanguage,
  setLanguage: (lang: Language) => { _currentLanguage = lang; },
  t: (lang: Language = _currentLanguage): Translations => dictionaries[lang],
};

