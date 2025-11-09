import React, { useEffect, useState } from "react";

const BACKEND_API_URL = import.meta.env.VITE_API_URL || "https://plantdexpro-backend.onrender.com";

export default function App() {
  const [health, setHealth] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    async function check() {
      try {
        const resp = await fetch(`${BACKEND_API_URL}/health`);
        const data = await resp.json();
        setHealth(data);
      } catch (e) {
        setErr(String(e));
      }
    }
    check();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <header className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">PlantDexPro — Frontend (local)</h1>
      </header>

      <main className="max-w-3xl mx-auto space-y-4">
        <section className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold">Backend health</h2>
          {health ? (
            <pre className="mt-2 bg-gray-100 dark:bg-gray-900 p-3 rounded">{JSON.stringify(health, null, 2)}</pre>
          ) : err ? (
            <div className="mt-2 text-red-500">Error: {err}</div>
          ) : (
            <div className="mt-2 text-sm">Checking backend…</div>
          )}
        </section>

        <section className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <p>This is a minimal UI used only to confirm the dev build and backend connectivity. Replace with your full App code once this works.</p>
        </section>
      </main>
    </div>
  );
}