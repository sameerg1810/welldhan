This folder is the web app's public assets directory.

Please copy the following from the React Native `frontend/assets` folder into the corresponding locations here:

- `frontend/assets/images/*` -> `public/images/`
- `frontend/assets/fonts/*` -> `public/fonts/`

Notes:

- Some images and icons used by the Expo app may need resizing for web (favicon, logo, splash).
- The repository contains original assets at `frontend/assets` — copy them into this folder before running the web dev server.

Example:

mkdir -p public/images public/fonts
cp -r ../../frontend/assets/images/_ public/images/
cp -r ../../frontend/assets/fonts/_ public/fonts/
