// Types pour le formulaire de demande de devis

export type TypeBusiness = 
  | 'marketplace'
  | 'saas'
  | 'commerce_physique'
  | 'application_mobile'
  | 'reseau_distribution'
  | 'vente_produits'
  | 'vente_services'
  | 'autre';

export type IntegrationMLM = 
  | 'site_web_existant'
  | 'application_existante'
  | 'plateforme_en_developpement'
  | 'projet_nouveau'
  | 'ne_sais_pas';

export type ModeleMLM = 
  | 'binaire'
  | 'unilevel'
  | 'hybride'
  | 'plan_paliers'
  | 'plan_points'
  | 'cashback_mlm'
  | 'inscription_gratuite_commissions'
  | 'conseille';

export type ObjectifMLM = 
  | 'recruter_clients'
  | 'fideliser_communaute'
  | 'creer_reseau_distributeurs'
  | 'augmenter_ca'
  | 'automatiser_recommandation'
  | 'lancer_business'
  | 'autre';

export type Fonctionnalite = 
  | 'tableau_bord_mlm'
  | 'systeme_affiliation'
  | 'arbre_genealogique'
  | 'automatisation_commissions'
  | 'espace_membre_niveaux'
  | 'gestion_paiements'
  | 'gestion_abonnements'
  | 'notifications_automatisees'
  | 'back_office_admin'
  | 'application_mobile'
  | 'import_export_donnees'
  | 'api_integration_externe'
  | 'autre';

export type Technologie = 
  | 'wordpress'
  | 'shopify'
  | 'webflow'
  | 'bubble'
  | 'app_mobile'
  | 'developpement_sur_mesure'
  | 'non_developpe'
  | 'ne_sais_pas';

export type Budget = 
  | 'moins_1500'
  | '1500_3000'
  | '3000_6000'
  | '6000_10000'
  | 'plus_10000'
  | 'discuter';

export type Delai = 
  | 'moins_30_jours'
  | '1_2_mois'
  | '2_4_mois'
  | 'plus_4_mois'
  | 'pas_de_delai';

export interface DevisFormData {
  // 1. Informations générales
  nom_prenom: string;
  entreprise: string;
  email: string;
  telephone: string;
  site_web?: string;

  // 2. Projet MLM
  type_business: TypeBusiness;
  type_business_autre?: string;
  integration_mlm: IntegrationMLM[];
  modele_mlm: ModeleMLM[];
  objectif_mlm: ObjectifMLM;
  objectif_mlm_autre?: string;

  // 3. Fonctionnalités souhaitées
  fonctionnalites: Fonctionnalite[];
  fonctionnalites_autre?: string;

  // 4. Informations techniques
  technologie: Technologie;
  base_donnees_existante: boolean;
  base_donnees_details?: string;

  // 5. Budget & Délais
  budget: Budget;
  delai: Delai;

  // 6. Description du projet
  description_projet: string;
  fichiers?: { name: string; path: string; size: number }[];

  // 7. Consentement & envoi
  recontact_telephone: boolean;
  acceptation_rgpd: boolean;

  // Métadonnées
  created_at?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface DevisResponse {
  success: boolean;
  message: string;
  id?: string;
  errors?: Record<string, string>;
}

// Labels pour l'affichage
export const TYPE_BUSINESS_LABELS: Record<TypeBusiness, string> = {
  marketplace: 'Marketplace',
  saas: 'SaaS',
  commerce_physique: 'Commerce physique',
  application_mobile: 'Application mobile',
  reseau_distribution: 'Réseau de distribution',
  vente_produits: 'Vente de produits',
  vente_services: 'Vente de services',
  autre: 'Autre',
};

export const INTEGRATION_MLM_LABELS: Record<IntegrationMLM, string> = {
  site_web_existant: 'Un site web existant',
  application_existante: 'Une application existante',
  plateforme_en_developpement: 'Une plateforme en développement',
  projet_nouveau: 'Un projet entièrement nouveau',
  ne_sais_pas: 'Je ne sais pas encore',
};

export const MODELE_MLM_LABELS: Record<ModeleMLM, string> = {
  binaire: 'Binaire',
  unilevel: 'Unilevel',
  hybride: 'Hybride',
  plan_paliers: 'Plan à paliers',
  plan_points: 'Plan par points',
  cashback_mlm: 'Cashback MLM',
  inscription_gratuite_commissions: 'Inscription gratuite + commissions',
  conseille: 'Je souhaite être conseillé',
};

export const OBJECTIF_MLM_LABELS: Record<ObjectifMLM, string> = {
  recruter_clients: 'Recruter plus de clients / utilisateurs',
  fideliser_communaute: 'Fidéliser ma communauté',
  creer_reseau_distributeurs: 'Créer un réseau de distributeurs',
  augmenter_ca: 'Augmenter mon chiffre d\'affaires',
  automatiser_recommandation: 'Automatiser la recommandation',
  lancer_business: 'Lancer un nouveau business',
  autre: 'Autre',
};

export const FONCTIONNALITE_LABELS: Record<Fonctionnalite, string> = {
  tableau_bord_mlm: 'Tableau de bord MLM',
  systeme_affiliation: 'Système d\'affiliation',
  arbre_genealogique: 'Arbre généalogique',
  automatisation_commissions: 'Automatisation des commissions',
  espace_membre_niveaux: 'Espace membre avec niveaux',
  gestion_paiements: 'Gestion des paiements (Stripe/PayPal)',
  gestion_abonnements: 'Gestion des abonnements',
  notifications_automatisees: 'Notifications automatisées',
  back_office_admin: 'Back office admin complet',
  application_mobile: 'Application mobile',
  import_export_donnees: 'Import/export données',
  api_integration_externe: 'API ou intégration externe',
  autre: 'Autre',
};

export const TECHNOLOGIE_LABELS: Record<Technologie, string> = {
  wordpress: 'WordPress',
  shopify: 'Shopify',
  webflow: 'Webflow',
  bubble: 'Bubble.io',
  app_mobile: 'App mobile (Android/iOS)',
  developpement_sur_mesure: 'Développement sur-mesure',
  non_developpe: 'Projet non encore développé',
  ne_sais_pas: 'Je ne sais pas',
};

export const BUDGET_LABELS: Record<Budget, string> = {
  moins_1500: 'Moins de 1 500 €',
  '1500_3000': '1 500 € – 3 000 €',
  '3000_6000': '3 000 € – 6 000 €',
  '6000_10000': '6 000 € – 10 000 €',
  plus_10000: 'Plus de 10 000 €',
  discuter: 'Je préfère en discuter',
};

export const DELAI_LABELS: Record<Delai, string> = {
  moins_30_jours: 'Moins de 30 jours',
  '1_2_mois': '1 à 2 mois',
  '2_4_mois': '2 à 4 mois',
  plus_4_mois: 'Plus de 4 mois',
  pas_de_delai: 'Pas de délai particulier',
};











