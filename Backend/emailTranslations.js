const translations = {
  fr: {
    email_greeting: (name) => `Bonjour ${name},`,
    email_thanks: "Merci de votre confiance,",
    email_team: "L'équipe En-Bus",
    email_pending_subject: (bookingNum) => `⏳ Action requise pour votre réservation #${bookingNum}`,
    email_pending_title: "Réservation en attente",
    email_pending_intro: (from, to) => `Votre réservation pour le trajet <strong>${from} → ${to}</strong> est presque prête !`,
    email_pending_agency_cta: "Pour confirmer, veuillez vous rendre en agence avec le code de paiement suivant :",
    email_pending_agency_code_label: "Votre Code de Paiement",
    email_pending_mm_cta: (price, ref) => `Pour finaliser, effectuez un paiement Mobile Money de <strong>${price}</strong> avec la référence <strong>${ref}</strong>.`,
    email_pending_deadline_warning: (deadline) => `Attention, cette réservation expirera si le paiement n'est pas reçu avant le <strong>${deadline}</strong>.`,
    email_confirmed_subject: (bookingNum) => `✅ Confirmé ! Votre billet En-Bus #${bookingNum}`,
    email_confirmed_title: "Réservation Confirmée",
    email_confirmed_intro: "Excellente nouvelle ! Votre paiement a été reçu et votre voyage est confirmé.",
    email_confirmed_details_trip: "Trajet :",
    email_confirmed_details_date: "Date de départ :",
    email_confirmed_cta: "Vous pouvez accéder à votre billet et suivre votre bus à tout moment depuis la section 'Mes Réservations' de notre application.",
    email_confirmed_button: "Accéder à mes réservations",
    email_confirmed_outro: "Nous vous souhaitons un excellent voyage !",
    email_report_subject: (bookingNum) => `🔄 Voyage reporté - Votre nouveau billet #${bookingNum}`,
    email_report_title: "Voyage Reporté",
    email_report_intro: "Votre demande de report a été traitée avec succès.",
    email_report_old_trip_label: "Ancien voyage :",
    email_report_old_trip_date: (date) => `Date : ${date}`,
    email_report_old_trip_invalid: "(n'est plus valide)",
    email_report_new_trip_label: "Votre NOUVEAU billet :",
    email_report_outro: "Veuillez utiliser ce nouveau billet pour votre voyage.",
    email_thanks: "Merci de votre confiance,",
    email_team: "L'équipe En-Bus",
    footer_copyright: "Tous droits réservés.",
    nav_contact: "Contact",
    nav_my_bookings: "Mes Réservations",
    pdf_total_paid: "TOTAL PAYÉ",
    pdf_travel_partner: "Votre partenaire de voyage"

    },
  en: {

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

    email_thanks: "Thank you for your trust,",
    email_team: "The En-Bus Team",
    footer_copyright: "All rights reserved.",
    nav_contact: "Contact",
    nav_my_bookings: "My Bookings",
    pdf_total_paid: "TOTAL PAID",
    pdf_travel_partner: "Your travel partner"


    // ... (mettez les traductions anglaises ici)
  }
};

module.exports = translations; // On exporte l'objet