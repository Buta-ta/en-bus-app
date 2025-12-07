const translations = {
  // ===================================
  // LANGUE FRANÇAISE (FR)
  // ===================================
  fr: {
    page_title: "En-Bus - Voyagez à travers l'Afrique",
    // --- Navbar & Footer ---
    nav_home: "Accueil",
    nav_my_bookings: "Mes Réservations",
    nav_about: "À propos",
    nav_contact: "Contact",
    footer_tagline: "Voyagez à travers l'Afrique en toute simplicité",
    footer_quicklinks: "Liens rapides",
    footer_copyright: "&copy; 2025 En-Bus. Tous droits réservés.",

    // --- Page d'accueil ---
    select_a_city: "— Choisissez une ville —",
    smart_search_placeholder: "Où voulez-vous aller ? Ex: Brazzaville vers Pointe-Noire",
    hero_title: "Voyagez à travers l'Afrique",
    hero_subtitle: "Réservez vos billets de bus en ligne facilement et rapidement",
    popular_destinations_title: "Destinations populaires",
    destination_price_from: (price) => `À partir de ${price} FCFA`,
    why_en_bus_title: "Pourquoi choisir En-Bus ?",
    feature_easy_booking: "Réservation facile",
    feature_easy_booking_desc: "Réservez vos billets en quelques clics",
    feature_best_prices: "Meilleurs prix",
    feature_best_prices_desc: "Trouvez les meilleures offres",
    feature_comfort: "Confort garanti",
    feature_comfort_desc: "Voyagez avec les meilleures compagnies",
    feature_security: "Sécurité maximale",
    feature_security_desc: "Vos informations sont sécurisées",

    // --- Formulaire de recherche ---

    smart_search_suggestions: [
    "Ex: Brazzaville → Pointe-Noire",
    "Ex: Douala → Yaoundé",
    "Ex: Abidjan → Lagos"
],




    search_form_origin: "Ville de départ",
    search_form_destination: "Ville d'arrivée",
    search_form_trip_type: "Type de voyage",
    search_form_one_way: "Aller simple",
    search_form_round_trip: "Aller-retour",
    search_form_dates: "Dates du voyage",
    search_form_dates_placeholder: "Sélectionnez vos dates",
    search_form_passengers: "Passagers",
    search_form_adults: "Adultes",
    search_form_children: "Enfants <small>(0-6 ans)</small>",
    search_form_button: "Rechercher",
    passenger_summary: (adults, children) => {
        let text = `${adults} Adulte(s)`;
        if (children > 0) text += `, ${children} Enfant(s)`;
        return text;
    },

    map_section_title: "Notre Réseau en un coup d'œil",

    
    // --- Page Résultats ---
    results_title: "Résultats de recherche",
    results_back_button: "← Modifier la recherche",
    results_summary_outbound: (count, from, to) => `Sélectionnez votre <strong>ALLER</strong> : <strong>${from}</strong> → <strong>${to}</strong> (${count} résultat(s))`,
    results_summary_return: (count, from, to) => `Sélectionnez votre <strong>RETOUR</strong> : <strong>${from}</strong> → <strong>${to}</strong> (${count} résultat(s))`,
    results_no_results_title: "Aucun trajet ne correspond à vos filtres",
    results_no_results_desc: "Essayez de modifier vos critères de recherche.",
    badge_cheapest: "💰 Le Moins Cher",
    badge_fastest: "🚀 Le Plus Rapide",
    departure_location_label: (location) => `📍 Départ : ${location}`,
    details_stops_planned: "Arrêts prévus :",
    details_stops_count: (count) => `${count} arrêt(s)`,
    details_connections: "Correspondance :",
    details_connections_count: (count) => `${count} changement(s)`, 
    details_arrival: "Arrivée",
    details_departure: "Départ",
    details_direct_trip: "Trajet direct",
    seats_available: "sièges dispo.",
    button_select: "Sélectionner",
    filter_sort_by: "Trier par :",
    sort_by_departure: "Heure de départ",
    sort_by_price: "Prix croissant",
    sort_by_duration: "Durée du trajet",
    sort_by_company: "Compagnie (A-Z)",
    filter_company: "Compagnie :",
    filter_all: "Toutes",
    filter_trip_type: "Type :",
    filter_type_direct: "Direct uniquement",
    filter_type_stops: "Avec arrêts",
    filter_type_connections: "Avec correspondances",
    filter_departure_time: "Départ :",
    filter_time_all: "Toute la journée",
    filter_time_morning: "Matin (5h-12h)",
    filter_time_afternoon: "Après-midi (12h-17h)",
    filter_time_evening: "Soirée (17h-21h)",
    filter_time_night: "Nuit (21h-5h)",
    filter_price: "Prix :",
    filter_price_min: "Min",
    filter_price_max: "Max",
    filter_amenities: "Équipements :",
    amenity_labels: { wifi: "Wi-Fi", wc: "Toilettes", prise: "Prises", clim: "Clim" },
    filter_reset_button: "Réinitialiser",
    success_filters_reset: "Filtres réinitialisés",
    amenity_wifi: "Wi-Fi",
    amenity_wc: "WC",
    amenity_plugs: "Prises",
    amenity_ac: "Clim",
    filter_departure_location: "Lieu de départ",
    filter_all_locations: "Tous les lieux",
    filter_toggle_button: " Filtrer & Trier",
    filter_time_night: "Nuit (21h-5h)",
    info_no_trips_found: "Aucun trajet disponible pour cet itinéraire à cette date",

    // ============================================
    // ✅ CLÉ AJOUTÉE ICI
    // ============================================
    info_no_trips_match_filters: "Aucun trajet ne correspond à vos critères de filtre.",

    results_no_results_desc: "Essayez de modifier vos critères de recherche.",
    info_no_trips_match_filters: "Aucun trajet ne correspond à vos critères de filtre.",

    // ============================================
    // ✅ CLÉ AJOUTÉE ICI
    // ============================================
    info_trips_available_before_filter: (count) => `${count} trajet(s) disponible(s) avant filtrage.`,
    // ============================================
    // ============================================



    details_connection_info: (city, wait) => `Changement à ${city} (Attente: ${wait})`,




    // --- Page Sélection des Sièges ---


    toast_select_outbound_seats: "Sélectionnez vos sièges pour l'aller",
    toast_select_return_seats: "Sélectionnez vos sièges pour le retour",
    toast_select_return_bus: "Sélectionnez maintenant votre bus de RETOUR",
    error_max_seats: (max) => `Vous pouvez sélectionner au maximum ${max} siège(s)`,
    // ...


    seats_title: "Sélection des sièges",
    seats_back_button: "← Retour",
    seats_price_info_adult: "Adulte",
    seats_price_info_child: "Enfant",
    trip_badge_outbound: "ALLER",
    trip_badge_return: "RETOUR",
    seats_occupancy_info_travelers: (count) => `<strong>${count}</strong> voyageurs à bord`,
    seats_occupancy_info_seats_left: (count) => `<strong>${count}</strong> sièges restants`,
    seats_occupancy_info_few_left: (count) => `<span class="danger">🔥 Plus que <strong>${count}</strong> sièges !</span>`,
    seats_legend_available: "Disponible",
    seats_legend_selected: "Sélectionné",
    seats_legend_occupied: "Occupé",
    seats_summary_seats: "Sièges :",
    seats_summary_price: "Prix :",
    seats_summary_none: "Aucun",
    continue_button: "Continuer",
    seats_driver: "Chauffeur",
    seats_entrance: "Entrée",
    seats_back_row: "Rangée arrière",
    seats_restroom: "Toilettes",

    // --- Page Passagers & Bagages ---
    passengers_page_title: "Informations Passagers",
    passengers_page_back_button: "← Retour",
    passengers_name_placeholder: "Nom complet",
    passengers_phone_placeholder: "Ex: +242 06 123 4567",
    passengers_email_placeholder: "exemple@email.com",
    baggage_title: "Bagages Supplémentaires",
    baggage_info: (count) => `Chaque passager a droit à <strong>${count} bagage(s) en soute</strong> inclus.`,
    passenger_form_title: (num, type, seat) => `Passager ${num} (${type}) - Siège ${seat}`,
    passenger_type_adult: "Adulte",
    passenger_type_child: "Enfant",
    passengers_name_label: "Nom complet *",
    passengers_phone_label: "Numéro de téléphone *",
    passengers_phone_info: "Formats acceptés : +XXX..., 00XXX..., ou national",
    passengers_email_label: "Email (optionnel)",
    baggage_options_for: (num, seat) => `Options pour Passager ${num} (Siège ${seat})`,
    baggage_standard_label: (price) => `Bagage standard suppl. (+${price} FCFA/pce)`,
    baggage_oversized_label: (price) => `Bagage hors format (+${price} FCFA/pce)`,
    passengers_back_button: "← Retour", // Une seule clé pour tous les boutons "Retour"
    passengers_continue_button: "Continuer vers Paiement",


    // --- Page Mes Réservations ---
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
    passenger_count: (count) => `${count} passager(s)`,
    button_track: "Suivre",
    button_delete_title: "Masquer de l'historique",
    date_at_time: (date, time) => `${date} à ${time}`,
    live_status_on_time: "À l'heure",
    live_status_delayed: (min, reason) => `En retard (${min} min) - ${reason || 'Raison non spécifiée'}`,
    live_status_cancelled: (reason) => `Annulé - ${reason || 'Raison non spécifiée'}`,
    live_status_arrived: "Arrivé",


    // --- Modale de Report ---
    report_modal_title: "Reporter votre voyage",
    report_current_trip_title: "📍 Votre voyage actuel",
    report_label_date: "Date",
    report_label_price_paid: "Prix payé",
    report_first_free: "✅ Premier report : <strong>GRATUIT</strong>",
    report_fee_applies: (count) => `⚠️ Ceci sera votre report n°${count}. Des frais peuvent s'appliquer.`,
    report_select_new_date: "Sélectionnez une nouvelle date",
    report_seats_left: (count) => `${count} place(s) restante(s)`,
    report_price_diff_positive: (price) => `+${price} FCFA à payer`,
    report_price_diff_negative: (price) => `${price} FCFA de crédit`,
    report_price_diff_neutral: "Même prix",
    button_cancel: "Annuler",
    report_summary_title: "📊 Récapitulatif du report",
    report_summary_current_price: "Prix actuel",
    report_summary_new_price: "Prix nouveau voyage",
    report_summary_price_diff: "Différence de prix",
    report_summary_fee: (count) => `Frais de report (${count}${count === 1 ? 'er' : 'ème'})`,
    report_summary_fee_free: "GRATUIT",
    report_summary_total_to_pay: "TOTAL À PAYER",
    report_summary_credit_generated: "CRÉDIT GÉNÉRÉ",
    report_summary_payment_title: "💳 Paiement de la différence",
    report_summary_amount_to_pay: (amount) => `Montant à régler : ${amount} FCFA`,
    report_summary_payment_info: (number) => `Envoyez au : ${number}`,
    report_summary_submit_button: "Valider la demande",
    toast_report_calculating_cost: "Calcul du coût du report...",
    toast_report_confirming: "Confirmation du report en cours...",
    toast_report_confirmed: "✅ Voyage reporté avec succès !",
    toast_report_request_sent: "✅ Demande de report envoyée !",
    payment_agency_info_report: "Vous devrez payer la différence à l'agence. Votre demande sera validée par un admin.",
    info_credit_generated: (amount) => `💰 Un crédit de ${amount} FCFA sera ajouté à votre compte.`,
    button_confirm_report: "✅ Confirmer le report",
    toast_searching_available_trips: "Recherche des voyages disponibles...",
    toast_checking_conditions: "Vérification des conditions de report...",
    error_report_not_allowed: "Report non autorisé pour ce billet.",
    info_no_trips_found_report: "Aucun autre voyage disponible pour le report.",
    error_generic: "Une erreur est survenue.",
    toast_calculating_cost: "Calcul du coût...",
    toast_confirming_request: "Traitement en cours...",
    confirm_request_sent_title: "Demande envoyée !",
    confirm_request_sent_mm_desc: (id) => `Votre demande et votre preuve de paiement (ID: ${id}) ont été envoyées. Un administrateur va vérifier et valider votre nouveau billet.`,
    confirm_request_sent_agency_desc: (amount) => `Votre demande est enregistrée. Veuillez payer ${amount} FCFA à l'agence en présentant votre code.`,
    confirm_request_ok_button: "J'ai compris",
    confirm_remove_booking_title: "Retirer la réservation ?",
    confirm_remove_booking_desc: (bookingNum) => `Voulez-vous vraiment retirer la réservation ${bookingNum} de l'historique de cet appareil ?`,
    button_cancel_alt: "Annuler",
    button_remove: "Oui, retirer",
    toast_booking_removed: "Réservation retirée de l'historique.",
    loading_bookings: "Chargement de vos réservations...",





          



    // --- Page de Paiement ---
    payment_page_title: "Paiement",
    payment_page_back_button: "← Retour",
    payment_summary_title: "Récapitulatif",
    payment_method_title: "💳 Mode de paiement",
    payment_mtn_name: "MTN Mobile Money",
    payment_badge_fast: "Rapide",
    payment_mtn_desc: "⚡ Paiement instantané via MTN",
    payment_phone_label_mtn: "📞 Numéro de téléphone MTN",
    payment_phone_placeholder_mtn: "Ex: 06 123 4567",
    payment_amount_label: "💰 Montant à payer",
    payment_ref_label: "🎫 Référence de réservation",
    payment_airtel_name: "Airtel Money",
    payment_airtel_desc: "⚡ Paiement instantané via Airtel",
    payment_phone_label_airtel: "📞 Numéro de téléphone Airtel",
    payment_phone_placeholder_airtel: "Ex: 05 123 4567",
    payment_agency_name: "Paiement à l'agence",
    payment_agency_desc: (hours) => `⏰ Payez dans les ${hours}h à l'agence`,
    payment_agency_nearest: "📍 Agence la plus proche",
    payment_agency_deadline: "⏰ Vous devez payer avant :",
    payment_agency_ref: "📋 Référence de réservation",
    payment_agency_important_title: "⚠️ Important :",
    payment_agency_rule1: (hours) => `Cette réservation sera <strong>automatiquement annulée</strong> si le paiement n'est pas effectué dans les ${hours}h`,
    payment_agency_rule2: "Présentez-vous à l'agence avec une pièce d'identité",
    payment_agency_rule3: "Le numéro de réservation sera requis",
    payment_confirm_button: "Confirmer la Réservation",
    urgency_seats_left: "Places restantes",
    urgency_deadline: "Votre réservation expire dans",
    summary_outbound_route: "Itinéraire Aller",
    summary_outbound_date: "Date Aller",
    summary_return_route: "Itinéraire Retour",
    summary_return_date: "Date Retour",
    summary_tickets_price: "Prix des billets",
    summary_baggage_fees: "Frais de bagages",
    summary_total_price: "PRIX TOTAL",
    payment_agency_desc_countdown: (h, m) => `⏰ Payez dans les ${h}h ${String(m).padStart(2, '0')}m`,


    // --- Page Instructions de Paiement ---
    payment_instructions_title_agency: "Paiement à l'agence",
    payment_instructions_title_mm: (method) => `${method} Mobile Money`,
    payment_instructions_subtitle: "Finalisez votre réservation en effectuant le paiement",
    booking_ref_label: "Numéro de réservation",
    amount_to_pay_label: "💰 Montant à payer",
    agency_to_pay_label: "🏢 Agence de paiement",
    your_phone_label: (method) => `📞 Votre numéro ${method}`,
    your_phone_warning: "⚠️ Utilisez CE numéro pour effectuer le paiement",
    merchant_phone_label: (method) => `📞 Numéro marchand ${method}`,
    payment_ref_label_important: "🔖 Référence (IMPORTANT)",
    payment_ref_warning: "⚠️ Inscrivez cette référence dans le message du transfert",
    payment_deadline_label: "⏰ Date limite de paiement",
    payment_steps_title: (method) => `📱 Étapes de paiement ${method}`,
    payment_steps_1: (code) => `Composez <strong>${code}</strong> sur votre téléphone.`,
    payment_steps_2: "Sélectionnez <strong>\"Transfert d'argent\"</strong>.",
    payment_steps_3: (number) => `Entrez le numéro marchand : <strong>${number}</strong>`,
    payment_steps_4: (amount) => `Montant : <strong>${amount}</strong>`,
    payment_steps_5: (ref) => `Message/Référence : <strong>${ref}</strong>`,
    payment_steps_6: "Validez avec votre code PIN.",
    final_step_title: "🚀 Étape Finale : Confirmez votre paiement",
    final_step_desc: (method) => `Après avoir reçu le SMS de confirmation de ${method}, copiez l'ID de la transaction et collez-le ici pour accélérer la validation.`,
    transaction_id_label: "ID de Transaction",
    transaction_id_placeholder: "Collez la référence de la transaction ici",
    submit_proof_button: "✔ J'ai payé, soumettre la référence",
    deadline_warning_title: "Important : Délai de paiement",
    deadline_warning_desc: (date, time) => `Cette réservation sera <strong>automatiquement annulée</strong> si le paiement n'est pas effectué avant le <strong>${date} à ${time}</strong>.`,
    check_status_button: "🔄 Vérifier le statut du paiement",
    back_home_button: "🏠 Retour à l'accueil",
    countdown_time_left: "Temps restant :",
    countdown_calculating: "Calcul...",
    countdown_expired: "EXPIRÉ",
    payment_ref_warning_agency: "⚠️ Présentez ce code unique à l'agent de caisse.",


          // --- Toasts de la page de paiement ---
    toast_booking_creation: "Création de la réservation en cours...",
    toast_select_payment_method: "Veuillez sélectionner un mode de paiement.",
    toast_invalid_phone: (method) => `Numéro de téléphone ${method} invalide ou manquant.`,
    toast_price_error: "Erreur de calcul du prix. Le total ne peut pas être zéro.",
    toast_agency_unavailable: "Paiement en agence non disponible (délai insuffisant).",
    toast_booking_saved_success: "✅ Réservation enregistrée !",
    toast_booking_saved_fail: "La sauvegarde a échoué.",
    toast_sending_proof: "Envoi de votre référence...",
    toast_proof_received: "Référence reçue ! Notre équipe va vérifier votre paiement.",
    toast_proof_submit_error: "Erreur lors de la soumission.",
    toast_enter_transaction_id: "Veuillez saisir l'ID de la transaction.",
    toast_checking_status: "Vérification du statut...",
    toast_payment_confirmed_redirect: "✅ Paiement confirmé ! Redirection vers votre billet...",
    toast_payment_pending_check: "⏳ Paiement en cours de vérification. Veuillez patienter...",
    toast_booking_cancelled_status: (status) => `❌ Cette réservation a été ${status}.`,
    error_booking_not_found: "Réservation introuvable",
    toast_current_status: "Statut actuel :",
    error_check_status: "Erreur lors de la vérification. Réessayez.",
    






    // --- Messages d'erreur & Info ---
    error_missing_departure_date: "Veuillez sélectionner une date de départ",
    error_missing_origin_destination: "Veuillez sélectionner la ville de départ et d'arrivée",
    error_same_origin_destination: "Le départ et l'arrivée doivent être différents",
    error_missing_return_date: "Veuillez sélectionner une date de départ ET de retour",
    info_searching: "Recherche en cours...",
    info_no_trips_found: "Aucun trajet disponible pour cet itinéraire à cette date",
    success_trips_found: (count) => `${count} trajet(s) trouvé(s)`,
    error_search_failed: "Erreur lors de la recherche",
    error_no_booking_to_download: "Aucune réservation à télécharger.",
    error_no_return_ticket: "Il n'y a pas de billet retour pour cette réservation.",
    error_search_all_fields: "Veuillez remplir l'origine, la destination et la date.",
        // On peut même être plus spécifique pour chaque erreur
    error_search_missing_origin: "Veuillez sélectionner une ville de départ.",
    error_search_missing_destination: "Veuillez sélectionner une ville d'arrivée.",
    error_search_missing_date: "Veuillez sélectionner une date de voyage.",

    // --- Traductions pour la confirmation d'absence de retour ---
    info_no_return_trips_found: "Aucun trajet retour disponible pour cette date",
    confirm_no_return_title: "Aucun retour trouvé",
    confirm_no_return_desc: "Aucun voyage retour n'a été trouvé pour la date sélectionnée. Voulez-vous essayer avec une autre date ?",
    button_modify_search: "Modifier la recherche",



    // --- Page de Confirmation ---
    confirmation_page_title: "Réservation Confirmée !",
    confirmation_page_subtitle: "Votre voyage est prêt. Bon voyage !",
    confirmation_booking_number_label: "N° de réservation",
    confirmation_status_confirmed: "Confirmé",
    confirmation_ticket_outbound: "Billet ALLER",
    confirmation_ticket_return: "Billet RETOUR",
    details_label_passengers: "Passagers",
    details_label_seats: "Sièges",
    details_label_company: "Compagnie",
    details_label_bus_no: "Bus N°",
    qr_code_title: "🎫 Billet électronique",
    qr_code_instruction: "Présentez ce code à l'embarquement",
    info_arrive_early_title: "Arrivez à l'avance",
    info_arrive_early_desc: "Présentez-vous 30 minutes avant le départ avec une pièce d'identité valide",
    info_baggage_title: "Bagages inclus",
    info_baggage_desc: "1 bagage en soute (20kg) + 1 bagage à main",
    button_download_outbound: " Télécharger Billet Aller",
    button_download_return: " Télécharger Billet Retour",
    button_track_outbound: " Suivre Bus Aller",
    button_track_return: " Suivre Bus Retour",
    button_new_booking_alt: " Nouvelle Réservation",
    confirmation_help: "Besoin d'aide ? Contactez-nous :",
    details_label_departure: "Départ",
    details_label_arrival: "Arrivée",

    details_label_date: "Date",
    details_label_duration: "Durée",
    details_label_seat: "Siège",
    ticket_footer_instruction: "Présentez-vous 30 minutes avant le départ.",
    stub_label_booking: "Réservation",
    stub_label_passenger: "Passager",
    stub_label_total_paid: "Total Payé",
    details_stop_info: (duration, time) => `Arrêt de ${duration} (Arrivée: ${time})`,
    details_connection_info: (city, wait) => `Changement à ${city}  (Attente: ${wait})`,
    details_next_bus_info: (company, bus, time) => `Prochain bus: ${company} (N°${bus || '?'}) à ${time}`,
    details_connections_title: " Correspondances",
    details_connection_info: (city, wait) => `Changement à ${city} (Attente: ${wait})`,
    details_next_bus_info: (company, bus, time) => `Prochain bus: ${company} (N°${bus || '?'}) à ${time}`,
    details_stops_planned: " Arrêts Prévus",
    details_stop_info: (duration, time) => `Arrêt de ${duration} (Arrivée: ${time})`,
    
      
    toast_ticket_downloaded: "Billet téléchargé !",
    button_download_invoice: "Télécharger la Facture",
    button_download_invoice_icon: "📄",
    toast_generating_ticket: "Génération de votre billet en cours...",
    error_generating_ticket: "Erreur lors de la génération du billet.",


          // DANS L'OBJET 'fr'
      // --- Contenu des Emails ---
      email_greeting: (name) => `Bonjour ${name},`,
      email_thanks: "Merci de votre confiance,",
      email_team: "L'équipe En-Bus",

      // Email: Paiement en attente
      email_pending_subject: (bookingNum) => `⏳ Action requise pour votre réservation #${bookingNum}`,
      email_pending_title: "Réservation en attente",
      email_pending_intro: (from, to) => `Votre réservation pour le trajet <strong>${from} → ${to}</strong> est presque prête !`,
      email_pending_agency_cta: "Pour confirmer, veuillez vous rendre en agence avec le code de paiement suivant :",
      email_pending_agency_code_label: "Votre Code de Paiement",
      email_pending_mm_cta: (price, ref) => `Pour finaliser, effectuez un paiement Mobile Money de <strong>${price}</strong> avec la référence <strong>${ref}</strong>.`,
      email_pending_deadline_warning: (deadline) => `Attention, cette réservation expirera si le paiement n'est pas reçu avant le <strong>${deadline}</strong>.`,

      // Email: Paiement confirmé
      email_confirmed_subject: (bookingNum) => `✅ Confirmé ! Votre billet En-Bus #${bookingNum}`,
      email_confirmed_title: "Réservation Confirmée",
      email_confirmed_intro: "Excellente nouvelle ! Votre paiement a été reçu et votre voyage est confirmé.",
      email_confirmed_details_trip: "Trajet :",
      email_confirmed_details_date: "Date de départ :",
      email_confirmed_cta: "Vous pouvez accéder à votre billet et suivre votre bus à tout moment depuis la section 'Mes Réservations'.",
      email_confirmed_button: "Accéder à mes réservations",
      email_confirmed_outro: "Nous vous souhaitons un excellent voyage !",

      // Email: Report confirmé
      email_report_subject: (bookingNum) => `🔄 Voyage reporté - Votre nouveau billet #${bookingNum}`,
      email_report_title: "Voyage Reporté",
      email_report_intro: "Votre demande de report a été traitée avec succès.",
      email_report_old_trip_label: "Ancien voyage :",
      email_report_old_trip_date: (date) => `Date : ${date}`,
      email_report_old_trip_invalid: "(n'est plus valide)",
      email_report_new_trip_label: "Votre NOUVEAU billet :",
      email_report_outro: "Veuillez utiliser ce nouveau billet pour votre voyage.",
      email_mobile_payment_title: "📱 Paiement Mobile",
      email_booking_reference: "Référence",
      email_confirmed_button: "Accéder à mes réservations",


      nfo_loading_popular: "Chargement des meilleures offres...",

// DANS L'OBJET 'en'
// ... (ajoutez les traductions anglaises correspondantes)
// ex: email_greeting: (name) => `Hello ${name},`
// ex: email_pending_subject: (bookingNum) => `⏳ Action Required for your booking #${bookingNum}`


      // --- Page À Propos (Nouvelles clés) ---
      about_hero_title: "Connecter l'Afrique, un voyage à la fois.",
      about_hero_subtitle: "Notre mission est de simplifier les voyages en bus sur le continent, en offrant une plateforme fiable, sécurisée et facile à utiliser.",
      about_mission_title: "Notre Mission",
      about_mission_desc: "Rendre la réservation de billets de bus en Afrique aussi simple que quelques clics, pour tout le monde, partout.",
      about_vision_title: "Notre Vision",
      about_vision_desc: "Devenir la plateforme de référence pour tous les déplacements terrestres en Afrique, en connectant les villes et les peuples.",
      about_values_title: "Nos Valeurs",
      about_values_desc: "Confiance, sécurité, simplicité et innovation sont au cœur de tout ce que nous faisons.",
      about_stats_title: "En-Bus en chiffres",
      about_stats_passengers: "Passagers Transportés",
      about_stats_destinations: "Destinations",
      about_stats_partners: "Compagnies Partenaires",
      about_stats_satisfaction: "Satisfaction Client (%)",
      about_partners_title: "Nos compagnies partenaires",
      about_cta_title: "Prêt à voyager ?",
      about_cta_subtitle: "Trouvez votre prochain trajet dès maintenant.",
      about_cta_button: "Rechercher un billet",
      pdf_total_paid: "TOTAL PAYÉ",
      pdf_travel_partner: "Votre partenaire de voyage", 
      pdf_adult_ticket_desc: "Billet(s) Adulte:",


         // --- Page Contact (Nouvelles clés) ---
    contact_main_title: "Contactez-nous",
    contact_main_subtitle: "Une question ? Une suggestion ? Notre équipe est là pour vous aider.",
    contact_email_title: "Par Email",
    contact_email_desc: "Pour toute demande générale ou support.",
    contact_phone_title: "Par Téléphone",
    contact_phone_desc: "Assistance immédiate du Lundi au Samedi.",
    contact_hq_title: "Siège Social",
    contact_hq_address: "Avenue de la République, Brazzaville, Congo",
    contact_form_title: "Envoyez-nous un message",
    contact_form_name: "Votre Nom",
    contact_form_email: "Votre Email",
    contact_form_subject: "Sujet",
    contact_subject_general: "Question générale",
    contact_subject_booking: "Aide à la réservation",
    contact_subject_partnership: "Partenariat",
    contact_form_message: "Message",
    contact_form_button: "Envoyer le message",
    contact_faq_title: "Questions Fréquentes",
    faq_q1_title: "Comment puis-je payer ma réservation ?",
    faq_q1_answer: "Vous pouvez payer par MTN Mobile Money, Airtel Money, ou directement dans l'une de nos agences partenaires. Toutes les options vous seront proposées au moment du paiement.",
    faq_q2_title: "Puis-je annuler ou modifier mon billet ?",
    faq_q2_answer: "Oui, il est possible de reporter votre voyage sous certaines conditions via la section \"Mes Réservations\". Les annulations avec remboursement dépendent de la politique de chaque compagnie.",
    faq_q3_title: "Je n'ai pas reçu mon billet, que faire ?",
    faq_q3_answer: "Après un paiement confirmé, votre billet est disponible dans \"Mes Réservations\". Si vous ne le voyez pas, vérifiez le statut de votre paiement ou contactez-nous.",
                        
        // --- Traductions manquantes ---
    toast_sending_message: "Envoi en cours...",
    toast_message_sent_success: "Message envoyé avec succès !",
    loading_ticket: "Chargement de votre billet...",
    ticket_footer_instruction: "Présentez-vous 30 minutes avant le départ avec une pièce d'identité valide ou un passeport pour un voyage international",
    pdf_footer_tagline: "Votre partenaire de voyage",
    local_notif_ticket_download_title: "Billet téléchargé",
    local_notif_ticket_download_body: (filename) => `Le fichier ${filename} a été enregistré dans vos documents.`,





        // --- Clés manquantes identifiées ---
    pdf_total_paid: "TOTAL PAYÉ",
    pdf_footer_tagline: "Votre partenaire de voyage",
    local_notif_ticket_download_title: "Billet téléchargé",
    local_notif_ticket_download_body: (fileName) => `${fileName} enregistré`,
    toast_ticket_downloaded_native: "Billet PDF enregistré !",
    toast_generating_ticket: "Génération du billet...",
    error_generating_ticket: "Erreur génération billet",
    error_no_booking_to_download: "Aucune réservation à télécharger.",
    error_no_return_ticket: "Pas de billet retour pour cette réservation.",
    error_search_missing_origin: "Veuillez sélectionner une ville de départ.",
    error_search_missing_destination: "Veuillez sélectionner une ville d'arrivée.",
    error_search_missing_date: "Veuillez sélectionner une date de voyage.",
    confirmation_title_pending: "Finalisez votre paiement",
    confirmation_subtitle_pending: "Réservation en attente",
    error_critical: "Erreur critique. Veuillez recommencer.",
    payment_agency_unavailable_tooltip: "Paiement en agence indisponible (trop proche du départ)",
    confirm_cancel_title: "Annuler la réservation ?",
    confirm_cancel_desc: (num) => `Voulez-vous vraiment annuler ${num} ?`,
    button_confirm: "Confirmer",
      // --- Animation "Aucun billet trouvé" (Backend) ---
    not_found_title: "Aucun billet actif trouvé",
    not_found_desc: "Il semble que les billets enregistrés sur cet appareil ne soient plus valides ou ont été supprimés.",
    button_plan_new_trip: "Planifier un nouveau voyage",
    footer_follow_us: "Suivez-nous",
    footer_phone_label: "Tél",


    // Clés pour la page de paiement
    summary_passengers_details: (adults, children, maxAge) => {
        let text = `${adults} Adulte(s)`;
        if (children > 0) {
            text += `, ${children} Enfant(s) (0-${maxAge} ans)`;
        }
        return text;
    },
    // Clés pour le sélecteur de passagers
    search_form_children_dynamic: (maxAge) => `Enfants <small>(0-${maxAge} ans)</small>`,
    // ...

     // ============================================
    // ✅ CLÉS POUR LES SUGGESTIONS ALTERNATIVES
    // ============================================
     no_trips_found_for_date: "Aucun trajet trouvé pour le {date}",

    alternative_trips_title: "Suggestions de trajets alternatifs",
    alternative_trips_desc: "Nous n'avons rien trouvé pour cette date, mais voici des trajets disponibles sur des jours proches :",
    trips_available: (count) => `${count} trajet(s) disponible(s)`,
    view_trips_button: "Voir les trajets",
    // ============================================
  





    },






  // ===================================
  // LANGUE ANGLAISE (EN)
  // ===================================
  en: {
    page_title: "En-Bus - Travel across Africa",
    // --- Navbar & Footer ---
    nav_home: "Home",
    nav_my_bookings: "My Bookings",
    nav_about: "About",
    nav_contact: "Contact",
    footer_tagline: "Travel across Africa with ease",
    footer_quicklinks: "Quick Links",
    footer_copyright: "&copy; 2025 En-Bus. All rights reserved.",

    // --- Home Page ---
    smart_search_placeholder: "Where do you want to go? E.g. Brazzaville to Pointe-Noire",
    hero_title: "Travel across Africa",
    hero_subtitle: "Book your bus tickets online easily and quickly",
    popular_destinations_title: "Popular Destinations",
    destination_price_from: (price) => `From ${price} FCFA`,
    why_en_bus_title: "Why choose En-Bus?",
    feature_easy_booking: "Easy Booking",
    feature_easy_booking_desc: "Book your tickets in just a few clicks",
    feature_best_prices: "Best Prices",
    feature_best_prices_desc: "Find the best deals",
    feature_comfort: "Guaranteed Comfort",
    feature_comfort_desc: "Travel with the best companies",
    feature_security: "Maximum Security",
    feature_security_desc: "Your information is secure",

    // --- Search Form ---

    smart_search_suggestions: [
    "E.g. Brazzaville to Pointe-Noire",
    "E.g. Douala to Yaoundé",
    "E.g. Abidjan to Lagos"
],

    select_a_city: "— Choose a city —",
    search_form_origin: "From",
    search_form_destination: "To",
    search_form_trip_type: "Trip Type",
    search_form_one_way: "One-way",
    search_form_round_trip: "Round-trip",
    search_form_dates: "When",
    search_form_passengers: "Passengers",
    search_form_adults: "Adults",
    search_form_children: "Children <small>(0-6 yrs)</small>",
    search_form_button: "Search",
    search_form_dates_placeholder: "Select your dates",
    passenger_summary: (adults, children) => {
        let text = `${adults} Adult(s)`;
        if (children > 0) text += `, ${children} Child(ren)`;
        return text;
    },

    map_section_title: "Our Network at a Glance",

    // --- Results Page ---
    details_connection_info: (city, wait) => `Change at ${city} (Wait: ${wait})`,
  
  
    
    results_title: "Search Results",
    results_back_button: "← Modify Search",
    results_summary_outbound: (count, from, to) => `Select your <strong>OUTBOUND</strong> trip: <strong>${from}</strong> → <strong>${to}</strong> (${count} result(s))`,
    results_summary_return: (count, from, to) => `Select your <strong>RETURN</strong> trip: <strong>${from}</strong> → <strong>${to}</strong> (${count} result(s))`,
    results_no_results_title: "No trips match your filters",
    results_no_results_desc: "Try changing your search criteria.",
    badge_cheapest: "💰 Cheapest",
    badge_fastest: "🚀 Fastest",
    departure_location_label: (location) => `📍 Departs from: ${location}`,
    details_stops_planned: "Scheduled stops:",
    details_stops_count: (count) => `${count} stop(s)`,
    details_connections: "Connection:",
    details_connections_count: (count) => `${count} change(s)`,
    details_arrival: "Arrival",
    details_departure: "Departure",
    details_direct_trip: "Direct trip",
    seats_available: "seat(s) left",
    button_select: "Select",
    amenity_labels: { wifi: "Wi-Fi", wc: "Restroom", prise: "Plugs", clim: "AC" },
    filter_reset_button: "Reset",
    success_filters_reset: "Filters reset",
    filter_sort_by: "Sort by:",
    sort_by_departure: "Departure time",
    sort_by_price: "Price (Low to High)",
    sort_by_duration: "Trip duration",
    sort_by_company: "Company (A-Z)",
    filter_company: "Company:",
    filter_all: "All",
    filter_trip_type: "Type:",
    filter_type_direct: "Direct only",
    filter_type_stops: "With stops",
    filter_type_connections: "With connections",
    filter_departure_time: "Departure:",
    filter_time_all: "All day",
    filter_time_morning: "Morning (5am-12pm)",
    filter_time_afternoon: "Afternoon (12pm-5pm)",
    filter_time_evening: "Evening (5pm-9pm)",
    filter_time_night: "Night (9pm-5am)",
    filter_price: "Price:",
    filter_price_min: "Min",
    filter_price_max: "Max",
    filter_amenities: "Amenities:",
    amenity_wifi: "Wi-Fi",
    amenity_wc: "Restroom",
    amenity_plugs: "Plugs",
    amenity_ac: "AC",
    filter_departure_location: "Departure point",
    filter_all_locations: "All departure locations",
    filter_toggle_button: " Filter & Sort",
    filter_time_night: "Night (9pm-5am)",
     // ... vos autres traductions ...
    info_no_trips_found: "No trips available for this route on this date",
    results_no_results_desc: "Try changing your search criteria.",
    info_no_trips_match_filters: "No trips match your filter criteria.",
    
    // ============================================
    // ✅ KEY ADDED HERE
    // ============================================
    info_trips_available_before_filter: (count) => `${count} trip(s) available before filtering.`,
    // ============================================

    // ============================================
    // ✅ KEY ADDED HERE
    // ============================================
    info_no_trips_match_filters: "No trips match your filter criteria.",
    // ============================================


    



    // --- Seat Selection Page ---
    //✅ VÉRIFIEZ QUE CES LIGNES SONT BIEN PRÉSENTES ET CORRECTEMENT ÉCRITES
    toast_select_outbound_seats: "Select your seats for the outbound trip",
    toast_select_return_seats: "Select your seats for the return trip",
    toast_select_return_bus: "Now select your RETURN bus",
    error_max_seats: (max) => `You can select a maximum of ${max} seat(s)`,
    seats_title: "Seat Selection",
    seats_back_button: "← Back",
    seats_price_info_adult: "Adult",
    seats_price_info_child: "Child",
    trip_badge_outbound: "OUTBOUND",
    trip_badge_return: "RETURN",
    seats_occupancy_info_travelers: (count) => `<strong>${count}</strong> travelers on board`,
    seats_occupancy_info_seats_left: (count) => `<strong>${count}</strong> seats left`,
    seats_occupancy_info_few_left: (count) => `<span class="danger">🔥 Only <strong>${count}</strong> seats left!</span>`,
    seats_legend_available: "Available",
    seats_legend_selected: "Selected",
    seats_legend_occupied: "Occupied",
    seats_summary_seats: "Seats:",
    seats_summary_price: "Price:",
    seats_summary_none: "None",
    continue_button: "Continue",
    seats_driver: "Driver",
    seats_entrance: "Entrance",
    seats_back_row: "Back row",
    seats_restroom: "Restroom",

    // --- Passengers & Baggage Page ---
    passengers_page_title: "Passenger Information",
    passengers_page_back_button: "← Back",
    passengers_name_placeholder: "Full name",
    passengers_phone_placeholder: "E.g. +242 06 123 4567",
    passengers_email_placeholder: "example@email.com",
    baggage_title: "Extra Baggage",
    baggage_info: (count) => `Each passenger is entitled to <strong>${count} checked bag(s)</strong>.`,
    passenger_form_title: (num, type, seat) => `Passenger ${num} (${type}) - Seat ${seat}`,
    passenger_type_adult: "Adult",
    passenger_type_child: "Child",
    passengers_name_label: "Full name *",
    passengers_phone_label: "Phone number *",
    passengers_phone_info: "Accepted formats: +XXX..., 00XXX..., or national",
    passengers_email_label: "Email (optional)",
    baggage_options_for: (num, seat) => `Options for Passenger ${num} (Seat ${seat})`,
    baggage_standard_label: (price) => `Extra standard bag (+${price} FCFA/pc)`,
    baggage_oversized_label: (price) => `Oversized bag (+${price} FCFA/pc)`,
    passengers_back_button: "← Back",
    passengers_continue_button: "Continue to Payment",
    

    
    // --- Payment Page ---
    payment_page_title: "Payment",
    payment_page_back_button: "← Back",
    payment_summary_title: "Summary",
    payment_method_title: "💳 Payment Method",
    payment_mtn_name: "MTN Mobile Money",
    payment_badge_fast: "Fast",
    payment_mtn_desc: "⚡ Instant payment via MTN",
    payment_phone_label_mtn: "📞 MTN Phone Number",
    payment_phone_placeholder_mtn: "E.g. 06 123 4567",
    payment_amount_label: "💰 Amount to pay",
    payment_ref_label: "🎫 Booking Reference",
    payment_airtel_name: "Airtel Money",
    payment_airtel_desc: "⚡ Instant payment via Airtel",
    payment_phone_label_airtel: "📞 Airtel Phone Number",
    payment_phone_placeholder_airtel: "E.g. 05 123 4567",
    payment_agency_name: "Pay at Agency",
    payment_agency_desc: (hours) => `⏰ Pay within ${hours}h at the agency`,
    payment_agency_nearest: "📍 Nearest Agency",
    payment_agency_deadline: "⏰ You must pay before:",
    payment_agency_ref: "📋 Booking Reference",
    payment_agency_important_title: "⚠️ Important:",
    payment_agency_rule1: (hours) => `This booking will be <strong>automatically cancelled</strong> if payment is not made within ${hours}h`,
    payment_agency_rule2: "Go to the agency with a valid ID",
    payment_agency_rule3: "The booking reference will be required",
    payment_confirm_button: "Confirm Booking",
    urgency_seats_left: "Seats left",
    urgency_deadline: "Your booking expires in",
    summary_outbound_route: "Outbound Route",
    summary_outbound_date: "Outbound Date",
    summary_return_route: "Return Route",
    summary_return_date: "Return Date",
    summary_tickets_price: "Tickets Price",
    summary_baggage_fees: "Baggage Fees",
    summary_total_price: "TOTAL PRICE",
    payment_agency_desc_countdown: (h, m) => `⏰ Pay within ${h}h ${String(m).padStart(2, '0')}m`,


    // --- Payment Instructions Page ---
    payment_instructions_title_agency: "Pay at Agency",
    payment_instructions_title_mm: (method) => `${method} Mobile Money`,
    payment_instructions_subtitle: "Finalize your booking by making the payment",
    booking_ref_label: "Booking Reference",
    amount_to_pay_label: "💰 Amount to Pay",
    agency_to_pay_label: "🏢 Payment Agency",
    your_phone_label: (method) => `📞 Your ${method} Number`,
    your_phone_warning: "⚠️ Use THIS number to make the payment",
    merchant_phone_label: (method) => `📞 Merchant Number ${method}`,
    payment_ref_label_important: "🔖 Reference (IMPORTANT)",
    payment_ref_warning: "⚠️ Enter this reference in the transfer message",
    payment_deadline_label: "⏰ Payment Deadline",
    payment_steps_title: (method) => `📱 ${method} Payment Steps`,
    payment_steps_1: (code) => `Dial <strong>${code}</strong> on your phone.`,
    payment_steps_2: "Select <strong>\"Send Money\"</strong>.",
    payment_steps_3: (number) => `Enter the merchant number: <strong>${number}</strong>`,
    payment_steps_4: (amount) => `Amount: <strong>${amount}</strong>`,
    payment_steps_5: (ref) => `Message/Reference: <strong>${ref}</strong>`,
    payment_steps_6: "Confirm with your PIN code.",
    final_step_title: "🚀 Final Step: Confirm Your Payment",
    final_step_desc: (method) => `After receiving the confirmation SMS from ${method}, copy the Transaction ID and paste it here to speed up validation.`,
    transaction_id_label: "Transaction ID",
    transaction_id_placeholder: "Paste the transaction reference here",
    submit_proof_button: "✔ I have paid, submit reference",
    deadline_warning_title: "Important: Payment Deadline",
    deadline_warning_desc: (date, time) => `This booking will be <strong>automatically cancelled</strong> if payment is not made before <strong>${date} at ${time}</strong>.`,
    check_status_button: "🔄 Check Payment Status",
    back_home_button: "🏠 Back to Home",
    countdown_time_left: "Time left:",
    countdown_calculating: "Calculating...",
    countdown_expired: "EXPIRED",
    payment_ref_warning_agency: "⚠️ Show this unique code to the agency cashier.",


  
        // --- Payment Page Toasts ---
    toast_booking_creation: "Creating your booking...",
    toast_select_payment_method: "Please select a payment method.",
    toast_invalid_phone: (method) => `Invalid or missing ${method} phone number.`,
    toast_price_error: "Price calculation error. Total cannot be zero.",
    toast_agency_unavailable: "Payment at agency is not available (not enough time).",
    toast_booking_saved_success: "✅ Booking saved!",
    toast_booking_saved_fail: "Save failed.",
    toast_sending_proof: "Submitting your reference...",
    toast_proof_received: "Reference received! Our team will verify your payment.",
    toast_proof_submit_error: "Error during submission.",
    toast_enter_transaction_id: "Please enter the transaction ID.",
    toast_checking_status: "Checking status...",
    toast_payment_confirmed_redirect: "✅ Payment confirmed! Redirecting to your ticket...",
    toast_payment_pending_check: "⏳ Payment is being verified. Please wait...",
    toast_booking_cancelled_status: (status) => `❌ This booking was ${status}.`,
    error_booking_not_found: "Booking not found",
    toast_current_status: "Current status:",
    error_check_status: "Error while checking status. Please try again.",




    



    // --- My Bookings Page ---
    my_bookings_title: "My Bookings",
    my_bookings_none_title: "No Bookings",
    my_bookings_none_desc: "Your future bookings will appear here.",
    status_confirmed: "✓ Confirmed",
    status_pending: "⏳ Pending Payment",
    status_report_pending: "🔄 Rescheduling...",
    status_reported: "↪️ Obsolete",
    status_cancelled: (status) => `❌ ${status}`,
    button_view_ticket: "View Ticket",
    button_report: "Reschedule",
    button_pay: "Pay",
    info_report_pending: "Request in progress...",
    info_replaced_by: "Replaced by:",
    button_new_booking: "New Booking",
    passenger_count: (count) => `${count} passenger(s)`,
    button_track: "Track",
    button_delete_title: "Hide from history",
    date_at_time: (date, time) => `${date} at ${time}`,
    live_status_on_time: "On Time",
    live_status_delayed: (min, reason) => `Delayed (${min} min) - ${reason || 'Unspecified reason'}`,
    live_status_cancelled: (reason) => `Cancelled - ${reason || 'Unspecified reason'}`,
    live_status_arrived: "Arrived",



    // --- Reschedule Modal ---
    report_modal_title: "Reschedule your Trip",
    report_current_trip_title: "📍 Your Current Trip",
    report_label_date: "Date",
    report_label_price_paid: "Price Paid",
    report_first_free: "✅ First reschedule: <strong>FREE</strong>",
    report_fee_applies: (count) => `⚠️ This will be your reschedule #${count}. Fees may apply.`,
    report_select_new_date: "Select a new date",
    report_seats_left: (count) => `${count} seat(s) left`,
    report_price_diff_positive: (price) => `+${price} FCFA to pay`,
    report_price_diff_negative: (price) => `${price} FCFA credit`,
    report_price_diff_neutral: "Same price",
    button_cancel: "Cancel",
    report_summary_title: "📊 Reschedule Summary",
    report_summary_current_price: "Current Price",
    report_summary_new_price: "New Trip Price",
    report_summary_price_diff: "Price Difference",
    report_summary_fee: (count) => `Reschedule Fee (${count === 1 ? '1st' : (count === 2 ? '2nd' : '3rd')})`,
    report_summary_fee_free: "FREE",
    report_summary_total_to_pay: "TOTAL TO PAY",
    report_summary_credit_generated: "CREDIT GENERATED",
    report_summary_payment_title: "💳 Pay the Difference",
    report_summary_amount_to_pay: (amount) => `Amount to settle: ${amount} FCFA`,
    report_summary_payment_info: (number) => `Send to: ${number}`,
    report_summary_submit_button: "Submit Request",
    toast_report_calculating_cost: "Calculating reschedule cost...",
    toast_report_confirming: "Confirming reschedule...",
    toast_report_confirmed: "✅ Trip rescheduled successfully!",
    toast_report_request_sent: "✅ Reschedule request sent!",
    toast_searching_available_trips: "Searching for available trips...",
    payment_agency_info_report: "You will need to pay the difference at the agency. Your request will be validated by an admin.",
    info_credit_generated: (amount) => `💰 A credit of ${amount} FCFA will be added to your account.`,
    button_confirm_report: "✅ Confirm Reschedule",
    toast_checking_conditions: "Checking reschedule conditions...",
    error_report_not_allowed: "Reschedule not allowed for this ticket.",
    info_no_trips_found_report: "No other trips available for reschedule.",
    error_generic: "An error occurred.",
    toast_calculating_cost: "Calculating cost...",
    toast_confirming_request: "Processing...",
    confirm_request_sent_title: "Request Sent!",
    confirm_request_sent_mm_desc: (id) => `Your request and payment proof (ID: ${id}) have been sent. An administrator will verify and validate your new ticket shortly.`,
    confirm_request_sent_agency_desc: (amount) => `Your request is registered. Please pay ${amount} FCFA at the agency by presenting your code.`,
    confirm_request_ok_button: "Got it",
    confirm_remove_booking_title: "Remove booking?",
    confirm_remove_booking_desc: (bookingNum) => `Do you really want to remove booking ${bookingNum} from this device's history?`,
    button_cancel_alt: "Cancel",
    button_remove: "Yes, remove",
    toast_booking_removed: "Booking removed from history.",
    loading_bookings: "Loading your bookings...",




        
    // --- Error Messages ---
    error_missing_departure_date: "Please select a departure date",
    error_missing_origin_destination: "Please select an origin and a destination city",
    error_same_origin_destination: "Origin and destination cities must be different",
    error_missing_return_date: "Please select both a departure and a return date",
    info_searching: "Searching...",
    info_no_trips_found: "No trips available for this route on this date",
    success_trips_found: (count) => `${count} trip(s) found`,
    error_search_failed: "Error during search",
    error_no_booking_to_download: "No booking to download.",
    error_no_return_ticket: "There is no return ticket for this booking.",
     error_search_all_fields: "Please fill in origin, destination, and date.",
        // Version spécifique
    error_search_missing_origin: "Please select an origin city.",
    error_search_missing_destination: "Please select a destination city.",
    error_search_missing_date: "Please select a travel date.",



        // --- Confirmation Page ---
    confirmation_page_title: "Booking Confirmed!",
    confirmation_page_subtitle: "Your trip is ready. Have a great journey!",
    confirmation_booking_number_label: "Booking Ref",
    confirmation_status_confirmed: "Confirmed",
    confirmation_ticket_outbound: "OUTBOUND Ticket",
    confirmation_ticket_return: "RETURN Ticket",
    details_label_passengers: "Passengers",
    details_label_seats: "Seats",
    details_label_company: "Company",
    details_label_bus_no: "Bus No.",
    qr_code_title: "🎫 E-Ticket",
    qr_code_instruction: "Present this code upon boarding",
    info_arrive_early_title: "Arrive Early",
    info_arrive_early_desc: "Please arrive 30 minutes before departure with a valid ID",
    info_baggage_title: "Baggage Included",
    info_baggage_desc: "1 checked bag (20kg) + 1 carry-on bag",
    button_download_outbound: " Download Outbound Ticket",
    button_download_return: " Download Return Ticket",
    button_track_outbound: " Track Outbound Bus",
    button_track_return: " Track Return Bus",
    button_new_booking_alt: " New Booking",
    confirmation_help: "Need help? Contact us:",
    details_label_departure: "Departure",
    details_label_arrival: "Arrival",

    details_label_date: "Date",
    details_label_duration: "Duration",
    details_label_seat: "Seat",
    ticket_footer_instruction: "Please arrive 30 minutes before departure.",
    stub_label_booking: "Booking",
    stub_label_passenger: "Passenger",
    stub_label_total_paid: "Total Paid",
    details_stop_info: (duration, time) => `Break of ${duration} (Arrival: ${time})`,
    details_connection_info: (city, wait) => `Change at ${city} (Wait: ${wait})`,
    details_next_bus_info: (company, bus, time) => `Next bus: ${company} (No. ${bus || '?'}) at ${time}`,
    details_connections_title: " Connections",
    details_connection_info: (city, wait) => `Change at ${city} (Wait: ${wait})`,
    details_next_bus_info: (company, bus, time) => `Next bus: ${company} (No. ${bus || '?'}) at ${time}`,
    details_stops_planned: " Scheduled Stops",
    details_stop_info: (duration, time) => `Break of ${duration} (Arrival: ${time})`,
    toast_ticket_downloaded: "Ticket downloaded!",
    button_download_invoice: "Download Invoice",
    button_download_invoice_icon: "📄",
    toast_generating_ticket: "Generating your ticket...",
    error_generating_ticket: "Error while generating ticket.",
    ticket_footer_instruction: "Please arrive 30 minutes before departure with a valid ID or Passeport for international travel.",



    // DANS L'OBJET 'en'

    // --- Email Content ---
    email_greeting: (name) => `Hello ${name},`,
    email_thanks: "Thank you for traveling with us,",
    email_team: "The En-Bus Team",

    // Email: Pending Payment
    email_pending_subject: (bookingNum) => `⏳ Action Required for your Booking #${bookingNum}`,
    email_pending_title: "Booking Pending",
    email_pending_intro: (from, to) => `Your booking for the trip <strong>${from} → ${to}</strong> is almost ready!`,
    email_pending_agency_cta: "To confirm, please go to one of our agencies with the following payment code:",
    email_pending_agency_code_label: "Your Agency Payment Code",
    email_pending_mm_cta: (price, ref) => `To finalize, please make a Mobile Money payment of <strong>${price}</strong> using the reference <strong>${ref}</strong>.`,
    email_pending_deadline_warning: (deadline) => `Please note, this booking will automatically expire if payment is not received by <strong>${deadline}</strong>.`,

    // Email: Payment Confirmed
    email_confirmed_subject: (bookingNum) => `✅ Confirmed! Your En-Bus Ticket #${bookingNum}`,
    email_confirmed_title: "Booking Confirmed",
    email_confirmed_intro: "Great news! Your payment has been confirmed, and your trip is officially booked.",
    email_confirmed_details_trip: "Trip:",
    email_confirmed_details_date: "Departure Date:",
    email_confirmed_cta: "You can access, download your e-ticket, and track your bus anytime from the 'My Bookings' section of our app.",
    email_confirmed_button: "Go to My Bookings",
    email_confirmed_outro: "We wish you a pleasant journey!",

    // Email: Report Confirmed
    email_report_subject: (bookingNum) => `🔄 Trip Rescheduled - Your New Ticket #${bookingNum}`,
    email_report_title: "Trip Rescheduled",
    email_report_intro: "Your request to reschedule has been successfully processed.",
    email_report_old_trip_label: "Previous Trip:",
    email_report_old_trip_date: (date) => `Date: ${date}`,
    email_report_old_trip_invalid: "(is no longer valid)",
    email_report_new_trip_label: "Your NEW Ticket:",
    email_report_outro: "Please use this new ticket for your travel.",
    // ✅ KEYS ADDED
    email_mobile_payment_title: "📱 Mobile Payment",
    email_booking_reference: "Reference",
    // ------------------
    
    email_confirmed_button: "Go to My Bookings",
    // ✅ CLÉS AJOUTÉES
    

    info_loading_popular: "Loading best deals...",


    // --- About Us Page (New keys) ---
    about_hero_title: "Connecting Africa, one journey at a time.",
    about_hero_subtitle: "Our mission is to simplify bus travel across the continent, offering a reliable, secure, and easy-to-use platform.",
    about_mission_title: "Our Mission",
    about_mission_desc: "To make booking bus tickets in Africa as simple as a few clicks, for everyone, everywhere.",
    about_vision_title: "Our Vision",
    about_vision_desc: "To become the leading platform for all ground travel in Africa, connecting cities and people.",
    about_values_title: "Our Values",
    about_values_desc: "Trust, safety, simplicity, and innovation are at the core of everything we do.",
    about_stats_title: "En-Bus in Numbers",
    about_stats_passengers: "Passengers Transported",
    about_stats_destinations: "Destinations",
    about_stats_partners: "Partner Companies",
    about_stats_satisfaction: "Customer Satisfaction (%)",
    about_partners_title: "Our Partner Companies",
    about_cta_title: "Ready to travel?",
    about_cta_subtitle: "Find your next trip right now.",
    about_cta_button: "Search for a ticket",


        // --- Contact Page (New keys) ---
    contact_main_title: "Get in Touch",
    contact_main_subtitle: "Have a question? A suggestion? Our team is here to help you.",
    contact_email_title: "By Email",
    contact_email_desc: "For any general inquiry or support.",
    contact_phone_title: "By Phone",
    contact_phone_desc: "Immediate assistance from Monday to Saturday.",
    contact_hq_title: "Headquarters",
    contact_hq_address: "Avenue de la République, Brazzaville, Congo",
    contact_form_title: "Send us a message",
    contact_form_name: "Your Name",
    contact_form_email: "Your Email",
    contact_form_subject: "Subject",
    contact_subject_general: "General Inquiry",
    contact_subject_booking: "Booking Assistance",
    contact_subject_partnership: "Partnership",
    contact_form_message: "Message",
    contact_form_button: "Send Message",
    contact_faq_title: "Frequently Asked Questions",
    faq_q1_title: "How can I pay for my booking?",
    faq_q1_answer: "You can pay via MTN Mobile Money, Airtel Money, or directly at one of our partner agencies. All options will be presented to you at checkout.",
    faq_q2_title: "Can I cancel or change my ticket?",
    faq_q2_answer: "Yes, you can reschedule your trip under certain conditions via the \"My Bookings\" section. Cancellations with refunds depend on each bus company's policy.",
    faq_q3_title: "I haven't received my ticket, what should I do?",
    faq_q3_answer: "After a confirmed payment, your ticket is available in the \"My Bookings\" section of the app. If you don't see it, please check your payment status or contact us.",


        // --- Missing translations ---
    toast_sending_message: "Sending message...",
    toast_message_sent_success: "Message sent successfully!",
    loading_ticket: "Loading your ticket...",
    pdf_footer_tagline: "Your travel partner",
    local_notif_ticket_download_title: "Ticket Downloaded",
    local_notif_ticket_download_body: (filename) => `The file ${filename} has been saved to your documents.`, 
    pdf_total_paid: "TOTAL PAID",
    pdf_travel_partner: "Your travel partner",
    pdf_adult_ticket_desc: "Adult Ticket(s):" ,




        // --- Missing keys ---
    pdf_total_paid: "TOTAL PAID",
    pdf_footer_tagline: "Your travel partner",
    local_notif_ticket_download_title: "Ticket downloaded",
    local_notif_ticket_download_body: (fileName) => `${fileName} saved`,
    toast_ticket_downloaded_native: "Ticket PDF saved!",
    toast_generating_ticket: "Generating ticket...",
    error_generating_ticket: "Error generating ticket",
    error_no_booking_to_download: "No booking to download.",
    error_no_return_ticket: "No return ticket for this booking.",
    error_search_missing_origin: "Please select a departure city.",
    error_search_missing_destination: "Please select an arrival city.",
    error_search_missing_date: "Please select a travel date.",
    confirmation_title_pending: "Complete your payment",
    confirmation_subtitle_pending: "Booking pending payment",
    error_critical: "Critical error. Please start over.",
    payment_agency_unavailable_tooltip: "Agency payment unavailable (too close to departure)",
    confirm_cancel_title: "Cancel booking?",
    confirm_cancel_desc: (num) => `Do you really want to cancel ${num}?`,
    button_confirm: "Confirm",
       // --- Translations for the no-return-found confirmation ---
    info_no_return_trips_found: "No return trips available for this date",
    confirm_no_return_title: "No Return Trips Found",
    confirm_no_return_desc: "No return trips were found for the selected date. Would you like to try another date?",
    button_modify_search: "Modify Search",
    not_found_title: "No Active Tickets Found",
    not_found_desc: "It seems the tickets saved on this device are no longer valid or have been deleted.",
    button_plan_new_trip: "Plan a New Trip",
    footer_follow_us: "Follow Us",
    footer_phone_label: "Phone",


     // Keys for the payment page
    summary_passengers_details: (adults, children, maxAge) => {
        let text = `${adults} Adult(s)`;
        if (children > 0) {
            text += `, ${children} Child(ren) (0-${maxAge} yrs)`;
        }
        return text;
    },
    // Keys for the passenger selector
    search_form_children_dynamic: (maxAge) => `Children <small>(0-${maxAge} yrs)</small>`,
    // ...
  },
     

  // ============================================
    // ✅ KEYS FOR ALTERNATIVE SUGGESTIONS
    // ============================================
    no_trips_found_for_date: "No trips found for {date}",

    alternative_trips_title: "Alternative Trip Suggestions",
    alternative_trips_desc: "We couldn't find anything for that date, but here are some available trips on nearby dates:",
    trips_available: (count) => `${count} trip(s) available`,
    view_trips_button: "View trips",

    // --- Autres clés que vous pourriez avoir oubliées ---
    success_filters_reset: "Filters have been reset.",
    info_no_trips_match_filters: "No trips match your filter criteria.",

    // ============================================
  
}



