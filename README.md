# DSCC Mental Health — Mobile

React Native app built with [Expo](https://expo.dev) (SDK 57) and
[Expo Router](https://docs.expo.dev/router/introduction/).

This repo previously held a React Router web app. That version is preserved on the
`web-archive` branch — `git checkout web-archive` to get it back.

## Getting started

```bash
npm install
npx expo start
```

Then press `i` for the iOS Simulator, `a` for Android, or `w` for web.

## Layout

```
src/
  app/            # Expo Router routes — file name = route
    _layout.tsx   # root Stack, headers hidden
    index.tsx     # login screen
  constants/      # design tokens
  hooks/          # shared hooks
assets/images/    # app icon, splash, favicon
```

## Backend

The API lives in the sibling [`backend`](https://github.com/DSCC-Mental-Health/backend)
repo (Express + Supabase). The login screen is presentational for now; wiring it to
`POST /api/login` is tracked as follow-up work.
