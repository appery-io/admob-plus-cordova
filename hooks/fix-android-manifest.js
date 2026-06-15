#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    const manifestPath = path.join(
        context.opts.projectRoot,
        'platforms/android/app/src/main/AndroidManifest.xml'
    );

    if (!fs.existsSync(manifestPath)) {
        return;
    }

    let manifest = fs.readFileSync(manifestPath, 'utf8');
    let changed = false;

    if (!manifest.includes('xmlns:tools="http://schemas.android.com/tools"')) {
        manifest = manifest.replace(
            '<manifest',
            '<manifest xmlns:tools="http://schemas.android.com/tools"'
        );
        changed = true;
    }

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
        changed = true;
    } else if (adActivities.length === 1 && !adActivities[0].includes('tools:replace')) {
        manifest = manifest.replace(
            adActivityPattern,
            adActivities[0].replace(
                '<activity',
                '<activity tools:replace="android:exported"'
            )
        );
        changed = true;
    }

    const adServicesProperty =
        '<property android:name="android.adservices.AD_SERVICES_CONFIG" android:resource="@xml/gma_ad_services_config" tools:replace="android:resource" />';

    if (!manifest.includes('android.adservices.AD_SERVICES_CONFIG')) {
        manifest = manifest.replace(
            '</application>',
            `        ${adServicesProperty}\n    </application>`
        );
        changed = true;
    } else if (!manifest.includes('tools:replace="android:resource"')) {
        manifest = manifest.replace(
            /<property[^>]*android:name="android\.adservices\.AD_SERVICES_CONFIG"[^>]*\/?>/,
            adServicesProperty
        );
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(manifestPath, manifest, 'utf8');
        console.log('admob-plus-cordova: updated AndroidManifest.xml for AdMob/Firebase compatibility');
    }
};
