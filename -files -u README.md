[1mdiff --cc README.md[m
[1mindex a7f73be,bd0bfed..0000000[m
[1m--- a/README.md[m
[1m+++ b/README.md[m
[36m@@@ -1,29 -1,1 +1,34 @@@[m
[31m- # Mehandi724xONE[m
[32m++<<<<<<< HEAD[m
[32m++#NailsMania[m
[32m +[m
[31m- Android and iOS henna (mehandi) design catalog. Images ship through Play Asset[m
[32m++Android and iOS NailsMania[m
[32m++ design catalog. Images ship through Play Asset[m
[32m +Delivery on Android and On-Demand Resources on iOS. No Firebase or login.[m
[32m +[m
[32m +**Behaviour of the live app and how to change catalog images:** [docs/CURRENT-BEHAVIOR.md](docs/CURRENT-BEHAVIOR.md)[m
[32m +[m
[32m +## Run (Android)[m
[32m +[m
[32m +Catalog files must exist at `catalog-packs/` (gitignored). Then:[m
[32m +[m
[32m +```sh[m
[32m +yarn start[m
[32m +yarn android[m
[32m +```[m
[32m +[m
[32m +Release ads: copy `.env.example` to `.env` and fill production AdMob IDs. Debug uses `.env.debug` (test ads).[m
[32m +[m
[32m +## Run (iOS)[m
[32m +[m
[32m +`catalog-packs/` must also exist for Xcode's ODR build:[m
[32m +[m
[32m +```sh[m
[32m +cd ios && pod install && cd ..[m
[32m +yarn start[m
[32m +yarn ios[m
[32m +```[m
[32m +[m
[32m +Open `ios/Mehandi724xONE.xcworkspace` for signing, device builds, and archives.[m
[32m++=======[m
[32m+ # Nailsmania-app[m
[32m++>>>>>>> c234a619e3b564a434b7ede5bf569afba8952bbb[m
