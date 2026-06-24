# Cameroon Real Estate Platform 🇨🇲

A fully-featured, responsive, and beautifully designed full-stack Real Estate Application tailored for the Cameroon market. The platform features realistic, high-quality listings from cities like Yaoundé, Douala, Buea, and Kribi, with listings displayed in Central African CFA Franc (FCFA).

---

##  Technology Stack

The application is built using a modern, high-performance, and secure full-stack architecture:

*   **Frontend (UI/UX)**:
    *   **React 19 (TypeScript)**: Standard functional components and hooks for quick, declarative rendering.
    *   **Tailwind CSS v4**: Utility-first CSS processing for pixel-perfect, responsive layout styling.
    *   **Motion**: Smooth, high-fidelity micro-interactions and transitions (e.g., drawer/modal entry and exit effects).
    *   **Lucide React**: Clean, modern iconography across the entire application interface.
*   **Backend (API Server)**:
    *   **Node.js & Express**: Handles application routing, authentication middleware, and robust API endpoints for listings.
    *   **tsx**: Next-generation TypeScript execution tool for hot-reloading dev servers.
    *   **esbuild**: Standard bundler used to pack the entire backend into a fast, portable `dist/server.cjs` file for production.
*   **Database & Storage**:
    *   **Local File-based JSON Database**: Stores real, non-AI-generated Cameroon property details, user database registries, and message records persistently under `/data`.

---

### 1. Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 18 or above) installed on your system. You can verify this by running:
```bash
node -v
npm -v
```


### 3. Install Dependencies

Open a new terminal window in VS Code (`Ctrl + ~` or `Cmd + ~`) and run:
```bash
npm install
```

### 4. Run the Dev Server

Start the interactive development server:
```bash
npm run dev
```
*The terminal will output the local dev URL (typically http://localhost:3000 ).
### 5. Build for Production

Compile both the frontend React client and bundle the Express server into optimized production-ready code:
```bash
npm run build
```
This script runs the static Vite compilation for the client and bundles the Node server using `esbuild` into a single, clean file at `dist/server.cjs`.

### 6. Run Production Server

Verify the compiled production build locally:
```bash
npm run start
```

---

## Project Structure

```
├── data/                 # Local JSON database files (properties, users, messages)
├── src/
│   ├── components/       # Reusable components (Navbar, PropertyCard, Footer, etc.)
│   ├── pages/            # View pages (Home, PropertyList, AddProperty, Dashboard, etc.)
│   ├── context/          # State managers (AuthContext, etc.)
│   ├── index.css         # Global Tailwind CSS configuration and theme definitions
│   └── main.tsx          # React client entrypoint
├── server.ts             # Express full-stack API server & asset server
├── package.json          # Dependencies, metadata and build configuration scripts
├── vite.config.ts        # Vite build tool configurations
└── README.md             # Project documentation (this file)
```

---

## How to Push to GitHub

To push your local code repository to GitHub, follow these step-by-step commands inside your VS Code terminal:

1.  **Initialize Git Repository**:
    ```bash
    git init
    ```

2.  **Add all files to staging**:
    ```bash
    git add .
    ```

3.  **Commit changes**:
    ```bash
    git commit -m "feat: complete full-stack Cameroon real estate platform"
    ```

4.  **Create a Repository on GitHub**:
    *   Go to [GitHub](https://github.com/) and sign in.
    *   Click the **New** button to create a new repository.
    *   Name your repository (e.g., `cameroon-real-estate`).
    *   **Do NOT** check the box for "Add a README file" (since we have already created this one).
    *   Click **Create repository**.

