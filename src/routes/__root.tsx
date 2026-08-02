import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { RotateLock } from "../components/RotateLock";

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 felt-bg">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black gold-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Este caminho não existe. Volte ao menu para jogar Banana.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-gold)] text-[var(--color-primary-foreground)] px-5 py-2 text-sm font-bold hover:brightness-110"
          >
            Ir para o menu
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 felt-bg">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">A partida travou</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Algo deu errado. Tente novamente ou volte ao menu.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-[var(--color-gold)] text-[var(--color-primary-foreground)] px-4 py-2 text-sm font-bold"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="rounded-full border border-[var(--color-gold)]/40 px-4 py-2 text-sm"
          >
            Ir para o menu
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1c4a3a" },
      { title: "Banana — Menu principal" },
      {
        name: "description",
        content:
          "Escolha um modo de jogo: vs IA, criar sala online ou entrar em sala com código.",
      },
      { name: "author", content: "Banana Game" },
      { property: "og:title", content: "Banana — Menu principal" },
      {
        property: "og:description",
        content: "Escolha um modo de jogo: vs IA, criar sala online ou entrar em sala com código.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Banana — Menu principal" },
      { name: "twitter:description", content: "Escolha um modo de jogo: vs IA, criar sala online ou entrar em sala com código." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/48022934-9abf-43c8-8c97-0e0dee42213d/id-preview-79b0d403--ab064cb8-d410-4adb-a5b4-10144239f9ea.lovable.app-1784280744437.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/48022934-9abf-43c8-8c97-0e0dee42213d/id-preview-79b0d403--ab064cb8-d410-4adb-a5b4-10144239f9ea.lovable.app-1784280744437.png" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    scripts: [
      { src: "https://projetoij.lovable.app/api/public/pij.js", defer: true },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      {/* Cenário HQ do ambiente atual, fixado atrás de tudo. */}
      <div aria-hidden className="scene-layer" />
      <Outlet />
      <RotateLock />
    </QueryClientProvider>
  );
}
