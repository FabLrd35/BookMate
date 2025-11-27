export type BadgeCategory = 'READING' | 'PAGES' | 'STREAK' | 'SOCIAL' | 'CHALLENGE' | 'SPECIAL';

export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: BadgeCategory;
    target?: number;
}

export const BADGES: BadgeDefinition[] = [
    // Reading Milestones (Books)
    { id: 'read-1', name: 'Premier Chapitre', description: 'Lire 1 livre', icon: '📖', category: 'READING', target: 1 },
    { id: 'read-5', name: 'Rat de Bibliothèque', description: 'Lire 5 livres', icon: '🐭', category: 'READING', target: 5 },
    { id: 'read-10', name: 'Dévoreur de Livres', description: 'Lire 10 livres', icon: '📚', category: 'READING', target: 10 },
    { id: 'read-20', name: 'Bibliothèque Ambulante', description: 'Lire 20 livres', icon: '🎒', category: 'READING', target: 20 },
    { id: 'read-50', name: 'Erudit', description: 'Lire 50 livres', icon: '🎓', category: 'READING', target: 50 },
    { id: 'read-100', name: 'Légende Littéraire', description: 'Lire 100 livres', icon: '👑', category: 'READING', target: 100 },

    // Reading Milestones (Pages)
    { id: 'pages-1000', name: 'Tourneur de Pages', description: 'Lire 1000 pages', icon: '📄', category: 'PAGES', target: 1000 },
    { id: 'pages-5000', name: 'Voyageur de Mots', description: 'Lire 5000 pages', icon: '🌍', category: 'PAGES', target: 5000 },
    { id: 'pages-10000', name: 'Marathonien', description: 'Lire 10,000 pages', icon: '🏃', category: 'PAGES', target: 10000 },
    { id: 'pages-25000', name: 'Encyclopédie Vivante', description: 'Lire 25,000 pages', icon: '🧠', category: 'PAGES', target: 25000 },

    // Streaks
    { id: 'streak-3', name: 'Échauffement', description: 'Lire 3 jours de suite', icon: '🔥', category: 'STREAK', target: 3 },
    { id: 'streak-7', name: 'Habitué', description: 'Lire 7 jours de suite', icon: '📅', category: 'STREAK', target: 7 },
    { id: 'streak-14', name: 'Passionné', description: 'Lire 14 jours de suite', icon: '❤️', category: 'STREAK', target: 14 },
    { id: 'streak-30', name: 'Inarrêtable', description: 'Lire 30 jours de suite', icon: '🚀', category: 'STREAK', target: 30 },
    { id: 'streak-100', name: 'Immortel', description: 'Lire 100 jours de suite', icon: '⚡', category: 'STREAK', target: 100 },

    // Reviews & Quotes
    { id: 'review-1', name: 'Critique Amateur', description: 'Rédiger 1 critique', icon: '✍️', category: 'SOCIAL', target: 1 },
    { id: 'review-5', name: 'Plume Affûtée', description: 'Rédiger 5 critiques', icon: '🖋️', category: 'SOCIAL', target: 5 },
    { id: 'review-10', name: 'Voix Influente', description: 'Rédiger 10 critiques', icon: '📢', category: 'SOCIAL', target: 10 },
    { id: 'quote-1', name: 'Collectionneur', description: 'Sauvegarder 1 citation', icon: '💬', category: 'SOCIAL', target: 1 },
    { id: 'quote-10', name: 'Gardien des Paroles', description: 'Sauvegarder 10 citations', icon: '📜', category: 'SOCIAL', target: 10 },

    // Challenges
    { id: 'challenge-1', name: 'Premier Pas', description: 'Compléter 1 défi', icon: '🎯', category: 'CHALLENGE', target: 1 },
    { id: 'challenge-3', name: 'Challenger', description: 'Compléter 3 défis', icon: '🥉', category: 'CHALLENGE', target: 3 },
    { id: 'challenge-5', name: 'Compétiteur', description: 'Compléter 5 défis', icon: '🥈', category: 'CHALLENGE', target: 5 },
    { id: 'challenge-10', name: 'Champion', description: 'Compléter 10 défis', icon: '🥇', category: 'CHALLENGE', target: 10 },
    { id: 'challenge-all-predefined', name: 'Maître des Défis', description: 'Compléter tous les défis prédéfinis', icon: '🏆', category: 'CHALLENGE' },

    // Special
    { id: 'genre-5', name: 'Explorateur', description: 'Lire 5 genres différents', icon: '🧭', category: 'SPECIAL', target: 5 },
    { id: 'long-book', name: 'Pavé dans la Mare', description: 'Lire un livre de +500 pages', icon: '🧱', category: 'SPECIAL', target: 500 },
    { id: 'fast-read', name: 'Lecture Éclair', description: 'Lire un livre en moins de 3 jours', icon: '⚡', category: 'SPECIAL', target: 3 },
    { id: 'author-3', name: 'Fidèle', description: 'Lire 3 livres du même auteur', icon: '🐕', category: 'SPECIAL', target: 3 },
    { id: 'create-challenge', name: 'Créateur', description: 'Créer un défi personnalisé', icon: '✨', category: 'SPECIAL' },
];
