# AI Development Rules for Personal Branding Co-pilot

This document provides guidelines for the AI assistant to follow when developing and modifying this application. The goal is to maintain consistency, simplicity, and adhere to the established architecture.

## Tech Stack

The application is built with a modern, lightweight tech stack:

-   **Framework**: React 19 with TypeScript for robust, type-safe components.
-   **Build Tool**: Vite for fast development and optimized builds.
-   **Styling**: Tailwind CSS is used exclusively for styling. All components are styled with utility classes.
-   **AI Integration**: Google Gemini API (via `@google/genai`) is the core AI provider for all generative features.
-   **UI Components**: A custom-built component library in `src/components/ui`, heavily inspired by shadcn/ui, provides the building blocks for the user interface (e.g., `Card`, `Button`).
-   **State Management**: React's native Context API (`AppContext`) is used for managing global state, with `useState` and `useEffect` for local component state.
-   **Icons**: A local library of SVG components located in `src/components/icons/Icons.tsx`.
-   **Animation**: Framer Motion is included for complex animations, complemented by Tailwind's built-in transition utilities for simpler effects.
-   **3D Graphics**: Spline (`@splinetool/react-spline`) is used for the interactive 3D scene on the landing page.

## Library and Architecture Rules

### 1. UI and Styling

-   **Use Existing Components**: Always prioritize using the pre-built components from `src/components/ui` (e.g., `Button`, `Card`, `Spinner`).
-   **Styling with Tailwind CSS**: All styling **MUST** be done using Tailwind CSS utility classes. Do not add custom CSS files, CSS-in-JS libraries, or inline `style` attributes.
-   **Class Merging**: Use the `cn` utility function from `src/lib/utils.ts` to conditionally apply or merge Tailwind classes.
-   **No New UI Libraries**: Do not install or use other component libraries like Material-UI, Ant Design, or Chakra UI. Create new components in the existing style if needed.

### 2. Icons

-   **Use `Icons.tsx`**: All icons must be imported from `src/components/icons/Icons.tsx`.
-   **Adding New Icons**: If a new icon is required, add it as a new React component to `Icons.tsx`, following the existing format. Do not install external icon libraries like `lucide-react` or `react-icons`.

### 3. State Management

-   **Global State**: Use the existing `AppContext` for state that needs to be shared across multiple tabs or deep component trees (e.g., `brandDna`, `history`).
-   **Local State**: Use React's `useState` and `useEffect` hooks for state that is confined to a single component or its immediate children.
-   **No New State Libraries**: Do not introduce state management libraries such as Redux, Zustand, or MobX.

### 4. AI Integration

-   **Centralized Service**: All calls to the Google Gemini API **MUST** be made through the functions in `src/services/geminiService.ts`.
-   **Schema-Driven Generation**: For structured JSON responses from the API, use the `generateContentWithSchema` helper function.
-   **API Key Management**: The API key is stored in `localStorage`. Do not modify this mechanism. All service functions should retrieve the key from `localStorage` via the `getAiClient` function.

### 5. File Structure

-   **Pages/Tabs**: Main features (tabs) should be located in `src/components/tabs`.
-   **Reusable Components**: General-purpose, reusable UI components go in `src/components/ui`.
-   **Services**: External API interactions (like Gemini) are handled in `src/services`.
-   **Utilities**: Helper functions should be placed in `src/utils` or `src/lib`.
-   **Types**: All TypeScript types and interfaces should be defined in `src/types.ts`.