#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
	console.log('fix tools namespace');
    const manifestPath = path.join(context.opts.projectRoot, 'platforms/android/app/src/main/AndroidManifest.xml');

    if (fs.existsSync(manifestPath)) {
        let manifest = fs.readFileSync(manifestPath, 'utf8');

        if (!manifest.includes('xmlns:tools="http://schemas.android.com/tools"')) {
            manifest = manifest.replace('<manifest', '<manifest xmlns:tools="http://schemas.android.com/tools"');
            fs.writeFileSync(manifestPath, manifest, 'utf8');
            console.log('✅ tools namespace added to AndroidManifest.xml');
        } else {
            console.log('ℹ️ tools namespace already exists in AndroidManifest.xml');
        }
    } else {
        console.log('⚠️ AndroidManifest.xml not found. Build the project first.');
    }
};