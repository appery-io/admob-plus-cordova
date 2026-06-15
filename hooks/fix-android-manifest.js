#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const AD_ACTIVITY =
    '<activity android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|uiMode|screenSize|smallestScreenSize" android:excludeFromRecents="true" android:exported="true" android:name="com.google.android.gms.ads.AdActivity" android:noHistory="true" tools:replace="android:exported" />';

const AD_SERVICES_PROPERTY =
    '<property android:name="android.adservices.AD_SERVICES_CONFIG" android:resource="@xml/gma_ad_services_config" tools:replace="android:resource" />';

function ensureToolsNamespace(manifest) {
    if (manifest.includes('xmlns:tools="http://schemas.android.com/tools"')) {
        return manifest;
    }

    return manifest.replace(
        '<manifest',
        '<manifest xmlns:tools="http://schemas.android.com/tools"'
    );
}

module.exports = function (context) {
    const manifestPath = path.join(
        context.opts.projectRoot,
        'platforms/android/app/src/main/AndroidManifest.xml'
    );

    if (!fs.existsSync(manifestPath)) {
        return;
    }

    let manifest = fs.readFileSync(manifestPath, 'utf8');
    const original = manifest;

    manifest = ensureToolsNamespace(manifest);

    const adActivityPattern =
        /\s*<activity[^>]*android:name="com\.google\.android\.gms\.ads\.AdActivity"[^>]*\/?>\s*/g;
    manifest = manifest.replace(adActivityPattern, '\n');

    manifest = manifest.replace(
        /<property[^>]*android:name="android\.adservices\.AD_SERVICES_CONFIG"[^>]*\/?>\s*/g,
        ''
    );

    manifest = manifest.replace(
        '</application>',
        `        ${AD_ACTIVITY}\n        ${AD_SERVICES_PROPERTY}\n    </application>`
    );

    if (manifest !== original) {
        fs.writeFileSync(manifestPath, manifest, 'utf8');
        console.log('admob-plus-cordova: updated AndroidManifest.xml for AdMob/Firebase compatibility');
    }
};
