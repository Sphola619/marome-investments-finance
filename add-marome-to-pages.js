const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname);

// Get all HTML files
const htmlFiles = fs.readdirSync(frontendDir).filter(file => 
    file.endsWith('.html') && file !== 'index.html'
);

console.log(`Found ${htmlFiles.length} HTML files to update (excluding index.html)`);

htmlFiles.forEach(file => {
    const filePath = path.join(frontendDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    
    // Add CSS link if not present
    if (!content.includes('marome-chat.css')) {
        // Try with self-closing tag
        if (content.includes('<link rel="stylesheet" href="styles.css"/>')) {
            content = content.replace(
                '<link rel="stylesheet" href="styles.css"/>',
                '<link rel="stylesheet" href="styles.css"/>\n    <link rel="stylesheet" href="marome-chat.css"/>'
            );
            modified = true;
        }
        // Try without self-closing tag
        else if (content.includes('<link rel="stylesheet" href="styles.css">')) {
            content = content.replace(
                '<link rel="stylesheet" href="styles.css">',
                '<link rel="stylesheet" href="styles.css">\n    <link rel="stylesheet" href="marome-chat.css">'
            );
            modified = true;
        }
    }
    
    // Add JS script if not present
    if (!content.includes('marome-chat.js')) {
        content = content.replace(
            '</body>',
            '    <script src="marome-chat.js"></script>\n    \n</body>'
        );
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated: ${file}`);
    } else {
        console.log(`- Skipped: ${file} (already has Marome)`);
    }
});

console.log('\nDone! Marome chat widget has been added to all pages.');