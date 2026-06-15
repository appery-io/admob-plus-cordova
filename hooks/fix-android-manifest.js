#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
        /<activity[^>]*android:name="com\.google\.android\.gms\.ads\.AdActivity"[^>]*\/?>/g;
    const adActivities = manifest.match(adActivityPattern) || [];

    if (adActivities.length > 1) {
        const adActivityEntry =
            '<activity android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|uiMode|screenSize|smallestScreenSize" android:excludeFromRecents="true" android:exported="true" android:name="com.google.android.gms.ads.AdActivity" android:noHistory="true" tools:replace="android:exported" />';

        manifest = manifest.replace(adActivityPattern, '');
        manifest = manifest.replace(
            '</application>',
            `        ${adActivityEntry}\n    </application>`
        );
    } else if (adActivities.length === 1 && !adActivities[0].includes('tools:replace')) {
        manifest = manifest.replace(
            adActivityPattern,
            adActivities[0].replace(
                '<activity',
                '<activity tools:replace="android:exported"'
            )
        );
    }

    const adServicesProperty =
        '<property android:name="android.adservices.AD_SERVICES_CONFIG" android:resource="@xml/gma_ad_services_config" tools:replace="android:resource" />';

    manifest = manifest.replace(
        /<property[^>]*android:name="android\.adservices\.AD_SERVICES_CONFIG"[^>]*\/?>\s*/g,
        ''
    );
    manifest = manifest.replace(
        '</application>',
        `        ${adServicesProperty}\n    </application>`
    );

    if (manifest !== original) {
        fs.writeFileSync(manifestPath, manifest, 'utf8');
        console.log('admob-plus-cordova: updated AndroidManifest.xml for AdMob/Firebase compatibility');
    }
};
