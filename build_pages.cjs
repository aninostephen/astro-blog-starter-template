const fs = require('fs');

function mdToHtml(mdText) {
    let lines = mdText.replace(/\r/g, '').split('\n');
    let html = '';
    let inList = false;

    for (let line of lines) {
        line = line.trim();
        if (line === '') continue;

        if (line.startsWith('# ')) {
            html += '<h1>' + line.substring(2) + '</h1>\n';
        } else if (line.startsWith('## ')) {
            html += '<h2>' + line.substring(3) + '</h2>\n';
        } else if (line.startsWith('- ')) {
            if (!inList) {
                html += '<ul>\n';
                inList = true;
            }
            html += '<li>' + line.substring(2) + '</li>\n';
        } else if (line === '---') {
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }
            html += '<hr />\n';
        } else {
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }
            let p = line;
            while (p.includes('**')) {
                p = p.replace('**', '<strong>').replace('**', '</strong>');
            }
            html += '<p>' + p + '</p>\n';
        }
    }
    if (inList) html += '</ul>\n';
    return html;
}

function injectHtml(astroFile, htmlContent) {
    let astro = fs.readFileSync(astroFile, 'utf8');
    let parts = astro.split('<main>');
    if (parts.length < 2) return;
    let head = parts[0] + '<main>\n';
    let tail = '\n\t\t</main>' + parts[1].split('</main>')[1];
    fs.writeFileSync(astroFile, head + htmlContent + tail);
}

try {
    const privacyMd = fs.readFileSync('privacy-policy-content.txt', 'utf8');
    injectHtml('src/pages/privacy.astro', mdToHtml(privacyMd));
    console.log("Injected privacy policy.");
} catch (err) {
    console.error("Error with privacy policy:", err.message);
}

try {
    const termsMd = fs.readFileSync('terms-of-services-content.txt', 'utf8');
    injectHtml('src/pages/terms.astro', mdToHtml(termsMd));
    console.log("Injected terms of service.");
} catch (err) {
    console.error("Error with terms of service:", err.message);
}

console.log("Done");
