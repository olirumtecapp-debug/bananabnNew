import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Home } from "./routes/index";
import { PartidaIA } from "./routes/jogar.ia";
import { Tutorial } from "./routes/tutorial";
import { Estatisticas } from "./routes/estatisticas";
import "./styles.css";

const queryClient = new QueryClient();

function AppRouter() {
  const [hash, setHash] = useState(() => window.location.hash.replace(/^#/, "") || "/");

  useEffect(() => {
    const onHashChange = () => {
      const current = window.location.hash.replace(/^#/, "") || "/";
      setHash(current);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  let Component = Home;
  if (hash === "/jogar/ia" || hash.startsWith("/jogar")) {
    Component = PartidaIA;
  } else if (hash === "/tutorial") {
    Component = Tutorial;
  } else if (hash === "/estatisticas") {
    Component = Estatisticas;
  }

  return (
    <>
      <div aria-hidden className="scene-layer" />
      <Component />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  </React.StrictMode>
);
