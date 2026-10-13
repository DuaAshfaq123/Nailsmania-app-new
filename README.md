# Mehandi724xONE

Android and iOS henna (mehandi) design catalog. Images ship through Play Asset
Delivery on Android and On-Demand Resources on iOS. No Firebase or login.

**Behaviour of the live app and how to change catalog images:** [docs/CURRENT-BEHAVIOR.md](docs/CURRENT-BEHAVIOR.md)

## Run (Android)

Catalog files must exist at `catalog-packs/` (gitignored). Then:

```sh
yarn start
yarn android
```

Release ads: copy `.env.example` to `.env` and fill production AdMob IDs. Debug uses `.env.debug` (test ads).

## Run (iOS)

`catalog-packs/` must also exist for Xcode's ODR build:

```sh
cd ios && pod install && cd ..
yarn start
yarn ios
```

Open `ios/Mehandi724xONE.xcworkspace` for signing, device builds, and archives.
