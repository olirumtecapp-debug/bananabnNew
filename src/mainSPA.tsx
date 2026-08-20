import React from "react";
import ReactDOM from "react-dom/client";
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  createHashHistory,
  Outlet,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route as IndexRoute } from "./routes/index";
import { Route as JogarIaRoute } from "./routes/jogar.ia";
import { Route as TutorialRoute } from "./routes/tutorial";
import { Route as EstatisticasRoute } from "./routes/estatisticas";
import "./styles.css";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <div aria-hidden className="scene-layer" />
      <Outlet />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexRoute.options.component,
});

const jogarIaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jogar/ia",
  component: JogarIaRoute.options.component,
});

const tutorialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tutorial",
  component: TutorialRoute.options.component,
});

const estatisticasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/estatisticas",
  component: EstatisticasRoute.options.component,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  jogarIaRoute,
  tutorialRoute,
  estatisticasRoute,
]);

const queryClient = new QueryClient();
const hashHistory = createHashHistory();

const router = createRouter({
  routeTree,
  history: hashHistory,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
