# NPP 3D Power Dashboard

A standalone 3D reinterpretation of the public National Power Portal CP map dashboard:

https://npp.gov.in/dashBoard/cp-map-dashboard

The app keeps the recognizable dashboard structure: national metric strip, India power map, region filter, energy-type capacity cards, transmission emphasis, and historical capacity growth. The original site depends on server-side endpoints and ArcGIS/Highcharts runtime assets, so this repository uses static sample data and a Three.js scene that can deploy cleanly on GitHub Pages.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy on GitHub Pages

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. After pushing to GitHub, enable Pages with `GitHub Actions` as the source. Every push to `main` will publish the Vite build.
