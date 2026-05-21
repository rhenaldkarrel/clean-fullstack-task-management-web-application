import { APP_NAME } from "@task-app/shared";

export default function App() {
  return (
    <main className="app-shell">
      <section className="card">
        <h1>{APP_NAME}</h1>
        <p>Frontend workspace is ready.</p>
      </section>
    </main>
  );
}
