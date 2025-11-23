// Fichier : Frontend/translations.js

const translations = {
  // ====================
  // FRANÇAIS
  // ====================
  fr: {
    // --- Navbar ---
    nav_home: "Accueil",
    nav_my_bookings: "Mes Réservations",
    nav_about: "À propos",
    nav_contact: "Contact",

    // --- Hero Section ---
    hero_title: "Voyagez à travers l'Afrique",
    hero_subtitle: "Réservez vos billets de bus en ligne facilement et rapidement",

    // --- Formulaire de recherche ---
    search_form_origin: "Ville de départ",
    search_form_destination: "Ville d'arrivée",
    search_form_trip_type: "Type de voyage",
    search_form_one_way: "Aller simple",
    search_form_round_trip: "Aller-retour",
    search_form_dates: "Dates du voyage",
    search_form_passengers: "Passagers",
    search_form_button: "Rechercher",
    passenger_summary: (adults, children) => {
        let text = `${adults} Adulte(s)`;
        if (children > 0) {
            text += `, ${children} Enfant(s)`;
        }
        return text;
    },

    // --- Sections de la page d'accueil ---
    popular_destinations_title: "Destinations populaires",
    why_en_bus_title: "Pourquoi choisir En-Bus ?",
    feature_easy_booking: "Réservation facile",
    feature_easy_booking_desc: "Réservez vos billets en quelques clics",
    feature_best_prices: "Meilleurs prix",
    feature_best_prices_desc: "Trouvez les meilleures offres",
    feature_comfort: "Confort garanti",
    feature_comfort_desc: "Voyagez avec les meilleures compagnies",
    feature_security: "Sécurité maximale",
    feature_security_desc: "Vos informations sont sécurisées",
  },

  // ====================
  // ANGLAIS
  // ====================
  en: {
    // --- Navbar ---
    nav_home: "Home",
    nav_my_bookings: "My Bookings",
    nav_about: "About",
    nav_contact: "Contact",

    // --- Hero Section ---
    hero_title: "Travel across Africa",
    hero_subtitle: "Book your bus tickets online easily and quickly",

    // --- Search Form ---
    search_form_origin: "Origin City",
    search_form_destination: "Destination City",
    search_form_trip_type: "Trip Type",
    search_form_one_way: "One-way",
    search_form_round_trip: "Round-trip",
    search_form_dates: "Travel Dates",
    search_form_passengers: "Passengers",
    search_form_button: "Search",
    passenger_summary: (adults, children) => {
        let text = `${adults} Adult(s)`;
        if (children > 0) {
            text += `, ${children} Child(ren)`;
        }
        return text;
    },

    // --- Sections de la page d'accueil ---
    popular_destinations_title: "Popular Destinations",
    why_en_bus_title: "Why choose En-Bus?",
    feature_easy_booking: "Easy Booking",
    feature_easy_booking_desc: "Book your tickets in just a few clicks",
    feature_best_prices: "Best Prices",
    feature_best_prices_desc: "Find the best deals",
    feature_comfort: "Guaranteed Comfort",
    feature_comfort_desc: "Travel with the best companies",
    feature_security: "Maximum Security",
    feature_security_desc: "Your information is secure",
  }
};