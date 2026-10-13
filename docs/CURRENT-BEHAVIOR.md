# Mehandi724xONE — current behaviour

Documented **9 September 2026**. Android and iOS use a fully packaged,
store-delivered catalog with no Firebase or accounts.

Package: `com.mehandi724xone`  
Android version in Gradle: `versionName` **2.0**, `versionCode` **15**  
Catalog snapshot: `catalog-packs/thumbs/` → **11 categories**, **1759 designs**, encoded **2026-09-08**.

---

## What the product is

A henna (mehandi) photo catalog. People browse collections, open designs full screen, save, download, and share. They can also keep **private** photos on this device only.

There is **no** login, profile, cloud upload, admin panel, or live catalog update. Changing public images requires a new Play Store or App Store build.

---

## How data lives

| Store | What | Where |
|--------|------|--------|
| Base APK | Home category tiles (11 WebP files) | Built from `catalog-packs/tiles/` into `android/app/src/main/assets/catalog/tiles/` |
| Play Asset Delivery pack `thumbs` | `catalog.json` + gallery thumbnails | `fast-follow` pack from `catalog-packs/thumbs/` |
| Play Asset Delivery pack `full` | Full-resolution designs | `on-demand` pack from `catalog-packs/full/` |
| iOS base app | Home category tiles | Built from `catalog-packs/tiles/` |
| iOS ODR tag `thumbs` | `catalog.json` + gallery thumbnails | Prefetched by the App Store and requested when Home loads |
| iOS ODR tag `full` | Full-resolution designs | Requested when a design opens |
| EncryptedStorage | Saved (likes) index, theme, language, recent searches | Device only |
| App documents | User “My Designs” photos + `manifest.json` | `{DocumentDirectory}/custom-designs/` |

`catalog-packs/` is **gitignored** (~100 MB+). It must exist on the machine
that builds the Android AAB or iOS archive.

**Debug vs stores**

- **Debug APK:** Gradle copies both packs into the APK (`catalog_debug/`). Home and the viewer work without Play.
- **Play / release AAB:** `thumbs` downloads soon after install; `full` downloads the first time a design is opened. Until `full` is ready, the viewer shows the thumbnail.
- **Debug iOS:** Xcode embeds both ODR asset packs in the `.app` so simulator/device testing works without the App Store.
- **App Store / TestFlight:** Apple hosts both ODR packs separately. `thumbs` is in the post-install prefetch order and Home also requests it explicitly. `full` remains download-on-demand until the viewer requests it.

---

## Navigation

Four bottom tabs:

1. **Home** (`Categories`)
2. **Saved** (`Favorites`)
3. **My Designs** (`Upload`)
4. **More** (`Settings`)

Stack screens: full-screen viewer, category gallery, Privacy, Terms, About Us, Support.

Languages: **English, Urdu, Arabic**. Urdu and Arabic are RTL. Changing language restarts the process so layout direction applies.

Theme: **System / Light / Dark**, stored on device.

---

## Home

- Category tiles come from the base APK. Names and short descriptions follow the active language (`catalog.json` translations + locale files).
- Filter chips: **All** plus the 11 collections.
- **Discover designs:** 10 random catalog designs. Pull-to-refresh shuffles a new set. Hearts save locally.
- Pull-to-refresh also keeps pagination-style loading elsewhere so the catalog does not feel frozen.
- **Search** (header): recent category searches (up to 6, stored as English ids), **Trending** (six **random** collections each time the sheet opens), then the full category grid. Tapping a chip opens that collection.
- Banner ad after the user has scrolled (~120 px).

Stable category ids (English, used in navigation and `catalog.json`):

`Front Hand`, `Back Hand`, `Finger`, `Foot`, `Bridal`, `Arabic`, `Stylish`, `Rajistani`, `Eid Special`, `Tikki`, `Kids`.

---

## Category gallery

- Opens from a Home tile or search.
- Designs for that category are **shuffled** each load.
- First page **16** images, then **30** per page. Pull-to-refresh reshuffles.
- Heart on each pin saves/unsaves; toast confirms both ways.
- Tap opens the viewer with the **full** pack resolved for the visible playlist when possible.
- Banner ads every **10** masonry rows.

---

## Full-screen viewer

- Horizontal pager through the playlist that was opened (Home row, gallery, Saved, or My Designs).
- Pinch / double-tap zoom. **Swipe-down to close is off** (it fought zoom). Close with back.
- Two-finger gestures do **not** page; one-finger swipe pages when not zoomed.
- Header: back + page counter (centred). Footer: Save, Download, Rotate, Share.
- Save/unsave shows a toast inside the viewer modal.
- Download copies the image into the device gallery album **Mehandi724**, shows an in-app toast, a tick on the action bar, and a **system notification**. Tapping the notification opens that image (MediaStore `content://` on API 29+).
- After download, an interstitial may try at a natural break.
- Opening a full view may show a **once-per-session** interstitial (see Ads).

---

## Saved

- Device-only list of catalog (and any favorited custom) designs.
- Empty state if nothing is saved.
- Remove from the pin: toast **Removed from Saved** with **Undo**.
- First visit in a process may show a session interstitial.
- Pull-to-refresh reloads from local storage.

---

## My Designs (local only)

Separate from the public catalog. Nothing here is published to Home or Play packs.

- **Take Photo** or **Choose from Gallery** (Android Photo Picker; no broad gallery permission).
- Picker resizes to max **1600×2000**, JPEG quality **0.88**.
- User picks a built-in category, then **Save locally**. File is copied into app-private storage; metadata is `manifest.json`.
- List shows date + localized category name. Tap opens the same viewer. Delete removes the file, the manifest row, and any Saved entry for that id.
- These designs do **not** appear in Home collections.

**Note:** Take Photo needs `CAMERA` in the Android manifest. That permission is not declared today, so camera may fail until it is added. Gallery pick works.

---

## Settings (More)

- Appearance: system / light / dark.
- Language: EN / UR / AR (restart on RTL flip).
- Share app, rate on Play, Privacy, Terms, About Us, Support (email + phone from env).
- No account section.

---

## Ads (AdMob)

Debug builds use Google **test** units (`.env.debug`). Release uses `.env` production IDs.

**Banners:** Home (after scroll), category gallery (every 10 rows).

**Interstitials** (not on every tap):

- Need ~**15 s** session age and **2** engagement actions first.
- Natural-break interstitial: about **5** qualified full views, **8 s** dwell, **120 s** between shows.
- **Once per process:** first full view, first Home→design full view, first Saved visit. Those session ads are at least **30 s** apart.

---

## Notifications

- Daily reminder around **18:00** local, random copy, 14-day rolling window (Notifee). Asks for `POST_NOTIFICATIONS` on first launch.
- Download-complete notification on channel **Downloads**.

---

## What is not in the app anymore

Firebase, Google Sign-In, profiles, public upload/moderation, custom cloud categories, guidance sheets, camera-as-a-separate-screen (Vision Camera), trending-from-server, admin web.

---

# Updating catalog images

Public images are **not** fetched at runtime. Edit files on disk, then **rebuild** (debug APK or Play AAB).

## Layout on disk (must exist before Gradle)

```
catalog-packs/
  VERSION                         # e.g. 20260908
  tiles/{slug}.webp               # Home tiles → base APK
  thumbs/
    catalog.json                  # source of truth for ids, paths, sizes, translations
    designs/{slug}/{id}.thumb.webp
  full/
    designs/{slug}/{id}.webp
```

Slugs match `catalog.json` `category.slug` (`arabic`, `back-hand`, `eid-special`, …).

Encoding used for the current dump:

- Thumbnails: longest side **480 px**, WebP
- Full designs: longest side **1200 px**, WebP
- Tiles: WebP; `imageWidth` / `imageHeight` in `catalog.json` must match the tile file (Home masonry uses those numbers)

## 1. Replace one existing design

1. Find the design in `catalog-packs/thumbs/catalog.json` (`id`, `categorySlug`, `thumbPath`, `fullPath`, `width`, `height`).
2. Overwrite:
   - `catalog-packs/thumbs/{thumbPath}`
   - `catalog-packs/full/{fullPath}`
3. Update `width` and `height` in that JSON object to the **full** image pixel size.
4. Rebuild the app.

Example encode (needs `sharp`: `yarn add -D sharp` then remove it after, or `npx --yes sharp-cli`):

```bash
# thumbnail
npx --yes sharp-cli -i new.jpg -o catalog-packs/thumbs/designs/arabic/THE_ID.thumb.webp \
  resize 480 480 --fit inside --withoutEnlargement --webp

# full
npx --yes sharp-cli -i new.jpg -o catalog-packs/full/designs/arabic/THE_ID.webp \
  resize 1200 1200 --fit inside --withoutEnlargement --webp
```

Keep filenames **exactly** as in `catalog.json`.

## 2. Add a new design to an existing category

1. Choose a stable `id` (hex or UUID, unique in `catalog.json`).
2. Write thumb and full files under that category slug, same naming as neighbours:
   - `designs/{slug}/{id}.thumb.webp`
   - `designs/{slug}/{id}.webp`
3. Append an object to `catalog.json` `designs`:

```json
{
  "id": "YOUR_ID",
  "categoryId": "Arabic",
  "categorySlug": "arabic",
  "source": "curated-imageUrls",
  "thumbPath": "designs/arabic/YOUR_ID.thumb.webp",
  "fullPath": "designs/arabic/YOUR_ID.webp",
  "width": 900,
  "height": 1200
}
```

`categoryId` must be the English name (`Arabic`, not `arabic`).  
4. Increment `designCount` on that category and the root `designCount`.  
5. Rebuild.

## 3. Replace a Home category tile

1. Overwrite `catalog-packs/tiles/{slug}.webp`.
2. Set that category’s `imageWidth` and `imageHeight` in `catalog.json`.
3. Rebuild (tiles are copied into the Android base APK and iOS base app).

`tilePath` in JSON is documentation; the app loads `catalog/tiles/{slug}.webp` from the base APK.

## 4. Add a new category (rare)

Also requires **code**:

- `src/constants/categories.js` (`CATEGORY_NAMES`)
- `src/i18n/locales/{en,ur,ar}.json` (`home.categoryNames` / `categoryDescriptions`)
- New tile + folder `designs/{new-slug}/` in thumbs and full
- New object in `catalog.json` `categories` with `id`/`name` (English), `slug`, `translations`, `imageWidth`/`imageHeight`, `designCount`

Then rebuild.

## 5. Remove a design

Delete both WebP files and the JSON object. Fix counts. Rebuild. Saved items that still point at that `id` will simply not resolve.

## 6. Rebuild so the device sees the change

```bash
# Metro is not enough. Packs are copied at Gradle time.
yarn android
```

For Play:

```bash
cd android && ./gradlew bundleRelease
```

Bump `versionCode` in `android/app/build.gradle` before uploading if 14 is already on the store.

Play delivers new packs only with a **new app version**. Users do not get new photos until they update.

For iOS, open `ios/Mehandi724xONE.xcworkspace` and build/archive in Xcode.
Xcode reads the same `catalog-packs/` folders and creates the `thumbs` and
`full` On-Demand Resource asset packs. Upload the archive through Organizer;
the ODR packs are part of that App Store submission and are not uploaded
manually. Apple also delivers changed ODR resources only with a new app build.

## 7. Do not confuse with My Designs

Photos added in the **My Designs** tab never enter `catalog-packs/`. They stay on that phone. There is no step to “promote” them into the public catalog except the file/JSON process above, done on a developer machine.

---

## Local build reminders

- `catalog-packs/thumbs` and `catalog-packs/full` must exist or Gradle fails.
- iOS uses the same local folders through Xcode resource references; do not
  move or rename `catalog-packs/{tiles,thumbs,full}`.
- Release ads: project root **`.env`** (gitignored). Debug ads: **`.env.debug`**.
- Signed AAB needs `android/keystore.properties` (gitignored).
- After adding native modules (e.g. image picker), a full native rebuild is required, not only Metro.
