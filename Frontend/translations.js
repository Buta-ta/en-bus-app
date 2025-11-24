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
    // ✅ VÉRIFIEZ QUE CETTE LIGNE EXISTE
    footer_tagline: "Voyagez à travers l'Afrique en toute simplicité",


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
destination_price_from: (price) => `À partir de ${price} FCFA`,
my_bookings_title: "Mes Réservations",
my_bookings_none_title: "Aucune réservation",
my_bookings_none_desc: "Vos futures réservations apparaîtront ici.",
status_confirmed: "✓ Confirmé",
status_pending: "⏳ En attente de paiement",
status_report_pending: "🔄 Report en cours",
status_reported: "↪️ Obsolète",
status_cancelled: (status) => `❌ ${status}`,
button_view_ticket: "Voir le Billet",
button_report: "Reporter",
button_pay: "Payer",
info_report_pending: "Demande en cours...",
info_replaced_by: "Remplacé par :",
button_new_booking: "Nouvelle réservation",
"error_missing_departure_date": "Veuillez sélectionner une date de départ",


"error_missing_origin_destination": "Veuillez sélectionner la ville de départ et d'arrivée",
"error_same_origin_destination": "La ville de départ et d'arrivée doivent être différentes",
"error_missing_departure_date": "Veuillez sélectionner une date de départ",
"error_missing_return_date": "Veuillez sélectionner une date de départ ET de retour",
"info_searching": "Recherche en cours...",
"info_no_trips_found": "Aucun trajet disponible pour cet itinéraire à cette date",
"success_trips_found": (count) => `${count} trajet(s) trouvé(s)`,
"error_search_failed": "Erreur lors de la recherche",



"badge_cheapest": "💰 Le Moins Cher",
"badge_fastest": "🚀 Le Plus Rapide",
"departure_location_label": (location) => `📍 Départ : ${location}`,
"details_stops_planned": "Arrêts prévus :",
"details_stops_count": (count) => `${count} arrêt(s)`,
"details_arrival": "Arrivée",
"details_departure": "Départ",
"details_direct_trip": "Trajet direct",
"seats_available": "sièges dispo.",
"button_select": "Sélectionner",
"amenity_labels": { "wifi": "Wi-Fi", "wc": "Toilettes", "prise": "Prises", "clim": "Clim", "pause": "Pause", "direct": "Direct" },


"results_summary_outbound": (count, from, to) => `Sélectionnez votre <strong>ALLER</strong> : <strong>${from}</strong> → <strong>${to}</strong> (${count} résultat(s))`,
"results_summary_return": (count, from, to) => `Sélectionnez votre <strong>RETOUR</strong> : <strong>${from}</strong> → <strong>${to}</strong> (${count} résultat(s))`,
"results_no_results_title": "Aucun trajet ne correspond à vos filtres",
"results_no_results_desc": "Essayez de modifier vos critères de recherche.",





passenger_count: (count) => `${count} passager(s)`,


    
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
    search_form_origin: "From",
    search_form_destination: "To",
    search_form_trip_type: "Trip Type",
    search_form_one_way: "One-way",
    search_form_round_trip: "Round-trip",
    search_form_dates: "When",
    search_form_passengers: "Passengers",
    search_form_button: "Search",
    search_form_children: "Children <small>(0-6 yrs)</small>",
    search_form_adults: "Adults",
  
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
"destination_price_from": (price) => `From ${price} FCFA`,
footer_tagline: "Travel across Africa with ease",

"my_bookings_none_title": "No Bookings",
"my_bookings_none_desc": "Your future bookings will appear here.",
"status_confirmed": "✓ Confirmed",
"status_pending": "⏳ Pending Payment",
"status_report_pending": "🔄 Rescheduling...",
"status_reported": "↪️ Obsolete",
"status_cancelled": (status) => `❌ ${status}`,
"button_view_ticket": "View Ticket",
"button_report": "Reschedule",
"button_pay": "Pay",
"info_report_pending": "Request in progress...",
"info_replaced_by": "Replaced by:",
"button_new_booking": "New Booking",
"error_missing_departure_date": "Please select a departure date",

"error_missing_origin_destination": "Please select an origin and a destination city",
"error_same_origin_destination": "Origin and destination cities must be different",
"error_missing_departure_date": "Please select a departure date",
"error_missing_return_date": "Please select both a departure and a return date",
"info_searching": "Searching...",
"info_no_trips_found": "No trips available for this route on this date",
"success_trips_found": (count) => `${count} trip(s) found`,
"error_search_failed": "Error during search",


"badge_cheapest": "💰 Cheapest",
"badge_fastest": "🚀 Fastest",
"departure_location_label": (location) => `📍 Departs from: ${location}`,
"details_stops_planned": "Scheduled stops:",
"details_stops_count": (count) => `${count} stop(s)`,
"details_arrival": "Arrival",
"details_departure": "Departure",
"details_direct_trip": "Direct trip",
"seats_available": "seats left",
"button_select": "Select",
"amenity_labels": { "wifi": "Wi-Fi", "wc": "Restroom", "prise": "Outlets", "clim": "AC", "pause": "Break", "direct": "Direct" },

"results_summary_outbound": (count, from, to) => `Select your <strong>OUTBOUND</strong> trip: <strong>${from}</strong> → <strong>${to}</strong> (${count} result(s))`,
"results_summary_return": (count, from, to) => `Select your <strong>RETURN</strong> trip: <strong>${from}</strong> → <strong>${to}</strong> (${count} result(s))`,
"results_no_results_title": "No trips match your filters",
"results_no_results_desc": "Try changing your search criteria.",
"search_form_children": "Children <small>(0-6 yrs)</small>",


"passenger_count": (count) => `${count} passenger(s)`,
  }
};


