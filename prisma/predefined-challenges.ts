import { ChallengeType, ChallengePeriod } from "@prisma/client"

export const PREDEFINED_CHALLENGES = [
    {
        title: "📄 Dévoreur de Pages",
        description: "Lisez 10 000 pages par an",
        challengeType: "PAGE_COUNT" as ChallengeType,
        target: 10000,
        period: "YEARLY" as ChallengePeriod,
        icon: "📄",
        isPredefined: true,
    },
    {
        title: "📚 Un Roman par Semaine",
        description: "Lisez 1 roman chaque semaine",
        challengeType: "BOOK_COUNT" as ChallengeType,
        target: 1,
        period: "WEEKLY" as ChallengePeriod,
        icon: "📚",
        isPredefined: true,
    },
    {
        title: "🗯️ Fan de BD",
        description: "Lisez 3 bandes dessinées par mois",
        challengeType: "BOOK_COUNT" as ChallengeType,
        target: 3,
        period: "MONTHLY" as ChallengePeriod,
        icon: "🗯️",
        isPredefined: true,
    },
    {
        title: "✍️ Critique Littéraire",
        description: "Rédigez 10 critiques par an",
        challengeType: "REVIEW_COUNT" as ChallengeType,
        target: 10,
        period: "YEARLY" as ChallengePeriod,
        icon: "✍️",
        isPredefined: true,
    },
]
