// ============================================
// SCRIPT DE GÉNÉRATION D'ICÔNES PWA
// ============================================

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'icons');

// Créer le dossier icons s'il n'existe pas
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// SVG source (logo En-Bus)
const svgLogo = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <!-- Fond dégradé -->
    <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#73d700"/>
            <stop offset="100%" stop-color="#5fb800"/>
        </radialGradient>
    </defs>
    
    <rect width="512" height="512" fill="url(#bgGrad)" rx="80"/>
    
    <!-- Bus simplifié -->
    <g transform="translate(100, 200)">
        <rect x="0" y="20" width="312" height="120" rx="20" fill="#F0F5F9" stroke="#0A0F15" stroke-width="8"/>
        <path d="M260 20 L310 20 L312 100 L260 100 Z" fill="#A9D2FF" stroke="#0A0F15" stroke-width="8"/>
        
        <!-- Fenêtres -->
        <rect x="20" y="40" width="50" height="45" rx="8" fill="#A9D2FF" stroke="#0A0F15" stroke-width="6"/>
        <rect x="80" y="40" width="50" height="45" rx="8" fill="#A9D2FF" stroke="#0A0F15" stroke-width="6"/>
        <rect x="140" y="40" width="50" height="45" rx="8" fill="#A9D2FF" stroke="#0A0F15" stroke-width="6"/>
        <rect x="200" y="40" width="50" height="45" rx="8" fill="#A9D2FF" stroke="#0A0F15" stroke-width="6"/>
        
        <!-- Porte -->
        <rect x="30" y="85" width="40" height="55" rx="6" fill="#E7EDF3" stroke="#0A0F15" stroke-width="6"/>
        
        <!-- Phare -->
        <circle cx="305" cy="105" r="12" fill="#FFEAA7" stroke="#0A0F15" stroke-width="4"/>
        
        <!-- Roues -->
        <circle cx="80" cy="155" r="28" fill="#0A0F15"/>
        <circle cx="80" cy="155" r="14" fill="#9AA5B1"/>
        <circle cx="240" cy="155" r="28" fill="#0A0F15"/>
        <circle cx="240" cy="155" r="14" fill="#9AA5B1"/>
    </g>
</svg>
`;

// Sauvegarder le SVG
fs.writeFileSync(path.join(iconsDir, 'logo.svg'), svgLogo);

// Générer les PNG
async function generateIcons() {
    console.log('🎨 Génération des icônes PWA...\n');
    
    for (const size of sizes) {
        try {
            await sharp(Buffer.from(svgLogo))
                .resize(size, size)
                .png()
                .toFile(path.join(iconsDir, `icon-${size}.png`));
            
            console.log(`✅ icon-${size}.png généré`);
        } catch (error) {
            console.error(`❌ Erreur icon-${size}:`, error.message);
        }
    }
    
    console.log('\n✅ Toutes les icônes ont été générées !');
}

generateIcons();