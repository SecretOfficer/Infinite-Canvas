# Infinite Canvas

Welcome to the Infinite Canvas project. This is a Next.js application that lets you drag, drop, and organize items on an infinite board. It's built to be fast, persistent, and easy to use.

## Getting Started

If you want to run this locally, 

1.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn
    # or
    pnpm install
    ```

2.  **Run the dev server:**
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) and start.

---

## Approach & Design Decisions
Here is the thinking behind the tech stack and architecture.

### 1. State Management: Why Zustand?
I picked **Zustand** over React Context or Redux for a few reasons:
*   **Performance:** Canvas apps can get heavy. Zustand allows components to subscribe only to the specific slices of state they need (like just the `items` array), preventing unnecessary re-renders of the whole board when one tiny thing changes.
*   **Simplicity:** It’s way less complex than Redux. I just wanted a simple global store that works.

### 2. The annoying part (Undo/Redo)
Implementing undo/redo manually is usually a nightmare of edge cases. I used **Zundo**, which is middleware for Zustand.
*   It effectively gives us "time travel" for free.
*   It tracks the state history automatically, so I didn't have to write complex logic to push/pop history stacks myself.

### 3. The "Infinite" Z-Index
You might notice the logic for `bringToFront` in the store is a bit unique. Instead of sorting the array every time you click an item (which is expensive if you have thousands of items), I just keep a global `maxZIndex` counter.
*   When you click an item, I just increment `maxZIndex` and assign it to that item.
*   It’s a simple O(1) operation vs. O(n log n) sorting.

### 4. Persistence
I didn't want you to lose your work if you accidentally refreshed the tab.
*   I used `idb-keyval` with Zustand's `persist` middleware.
*   This saves the canvas state to IndexedDB (which handles larger data better than `localStorage`) and rehydrates it automatically when the app loads.

### 5. Styling
I'm using **Tailwind CSS v4** here. It keeps the CSS bundle small and lets me iterate on the UI really fast without context-switching to a separate CSS file.


