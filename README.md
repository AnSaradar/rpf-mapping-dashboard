# Reparameterize Evaluation Dashboard

This project is a React frontend implementation based on the Kepler.gl interface mockups. It includes a responsive UI with map visualization, data filtering, and analysis components.

## Project Structure

- `src/` - Source code
  - `components/` - React components
    - `chatbot/` - Chatbot interface
    - `filters/` - Filter controls
    - `kpi/` - KPI table and metrics
    - `layout/` - Header and layout components
    - `map/` - Map placeholder (for Kepler.gl integration)
    - `sidebar/` - Information sidebar
  - `App.tsx` - Main application component
  - `index.css` - Global styles
  - `main.tsx` - Application entry point

- `public/` - Static assets
- `dist/` - Production build

## Getting Started

### Development

1. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

2. Start the development server:
```bash
npm run dev
# or
pnpm run dev
# or
yarn dev
```

3. Open your browser to http://localhost:5173

### Production Build

The `dist/` folder contains a production-ready build that can be deployed to any static hosting service.

To create a new production build:

```bash
npm run build
# or
pnpm run build
# or
yarn build
```

## Future Integration with Kepler.gl

This frontend is designed to be integrated with Kepler.gl for advanced mapping capabilities. The current implementation includes placeholders for the map component that can be replaced with actual Kepler.gl components.

To integrate with Kepler.gl:

1. Install Kepler.gl dependencies
2. Replace the MapPlaceholder component with Kepler.gl components
3. Connect your data sources to Kepler.gl

## Responsive Design

The UI is fully responsive and works on both desktop and mobile devices. The layout automatically adjusts based on screen size.
