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

    search_form_dates_placeholder: "Sélectionnez vos dates",
    passengers_name_placeholder: "Nom complet",
    passengers_phone_placeholder: "Ex: +242 06 123 4567",
    passengers_email_placeholder: "exemple@email.com",
    payment_phone_placeholder_mtn: "Ex: 06 123 4567",
    payment_phone_placeholder_airtel: "Ex: 05 123 4567",
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

    baggage_title: "Bagages Supplémentaires",
baggage_info: (count) => `Chaque passager a droit à <strong>${count} bagage(s) en soute</strong> inclus.`,
passenger_form_title: (num, type, seat) => `Passager ${num} (${type}) - Siège ${seat}`,
passenger_type_adult: "Adulte",
passenger_type_child: "Enfant",
passengers_name_label: "Nom complet *",
passengers_phone_label: "Numéro de téléphone (international accepté) *",
passengers_phone_info: "Formats acceptés : +XXX..., 00XXX..., ou national",
passengers_email_label: "Email (optionnel)",
baggage_options_for: (num, seat) => `Options pour Passager ${num} (Siège ${seat})`,
baggage_standard_label: (price) => `Bagage standard suppl. (+${price} FCFA/pce)`,
baggage_oversized_label: (price) => `Bagage hors format (+${price} FCFA/pce)`,


    
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
    // ✅ ET AJOUTER LES TRADUCTIONS ANGLAISES ICI
    search_form_dates_placeholder: "Select your dates",
    passengers_name_placeholder: "Full name",
    passengers_phone_placeholder: "E.g. +242 06 123 4567",
    passengers_email_placeholder: "example@email.com",
    payment_phone_placeholder_mtn: "E.g. 06 123 4567",
    payment_phone_placeholder_airtel: "E.g. 05 123 4567",

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

    baggage_title: "Extra Baggage",
baggage_info: (count) => `Each passenger is entitled to <strong>${count} checked bag(s)</strong>.`,
passenger_form_title: (num, type, seat) => `Passenger ${num} (${type}) - Seat ${seat}`,
passenger_type_adult: "Adult",
passenger_type_child: "Child",
passengers_name_label: "Full name *",
passengers_phone_label: "Phone number (international accepted) *",
passengers_phone_info: "Accepted formats: +XXX..., 00XXX..., or national",
passengers_email_label: "Email (optional)",
baggage_options_for: (num, seat) => `Options for Passenger ${num} (Seat ${seat})`,
baggage_standard_label: (price) => `Extra standard bag (+${price} FCFA/pc)`,
baggage_oversized_label: (price) => `Oversized bag (+${price} FCFA/pc)`,
  }
};


