#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
	console.log('fix google services');
    const manifestPath = path.join(context.opts.projectRoot, 'platforms/android/app/src/main/AndroidManifest.xml');

    if (!fs.existsSync(manifestPath)) {
        console.log('⚠️ AndroidManifest.xml not found. Build the project first.');
        return;
    }

    let manifest = fs.readFileSync(manifestPath, 'utf8');

    // Check if AdActivity already has tools:replace
    const adActivityRegex = /<activity\s+[^>]*android:name="com.google.android.gms.ads.AdActivity"[^>]*>/;
    const toolsReplaceAttribute = 'tools:replace="android:exported"';

    if (manifest.includes(toolsReplaceAttribute)) {
        console.log('ℹ️ AdActivity already has tools:replace="android:exported". No changes needed.');
        return;
    }

    // Modify the AdActivity entry
    manifest = manifest.replace(adActivityRegex, match => {
        if (match.includes('tools:replace')) {
            return match; // Already modified, skip
        }
        return match.replace(/<activity/, `<activity ${toolsReplaceAttribute}`);
    });

    // Ensure xmlns:tools is added to the <manifest> tag
    if (!manifest.includes('xmlns:tools="http://schemas.android.com/tools"')) {
        manifest = manifest.replace('<manifest', '<manifest xmlns:tools="http://schemas.android.com/tools"');
    }

    fs.writeFileSync(manifestPath, manifest, 'utf8');
    console.log('✅ Updated AndroidManifest.xml: Added tools:replace="android:exported" for AdActivity.');
};
