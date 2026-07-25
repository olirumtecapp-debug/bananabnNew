import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Home, Copy, Check } from "lucide-react";
import { useState } from "react";
import { TopBar } from "@/components/game/TopBar";
import { sfx } from "@/lib/sound";
import qrAsset from "@/assets/qrcode-c6.png.asset.json";

export const Route = createFileRoute("/doacao")({
  head: () => ({
    meta: [
      { title: "Doação — Banana!" },
      {
        name: "description",
        content:
          "Curtiu o Banana? Apoie o desenvolvedor com uma doação via Pix. Qualquer valor ajuda a manter o projeto vivo!",
      },
      { property: "og:title", content: "Apoie o Banana!" },
      {
        property: "og:description",
        content:
          "Se você gostou do jogo, considere fazer uma doação. Toda ajuda faz diferença!",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Apoie o Banana!" },
      {
        name: "twitter:description",
        content: "Doe via Pix e ajude o projeto Banana a crescer.",
      },
    ],
  }),
  component: DoacaoPage,
});

function DoacaoPage() {
  const [copied, setCopied] = useState(false);

  const copyName = async () => {
    try {
      await navigator.clipboard.writeText("Murilo Ferreira da Silva");
      sfx.pick();
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const panelStyle = {
    background: "var(--hq-panel)",
    color: "var(--ink)",
    border: "2.5px solid var(--ink)",
    boxShadow: "5px 5px 0 var(--ink)",
    borderRadius: "12px",
  } as const;

  return (
    <div className="min-h-screen felt-bg">
      <TopBar title="DOAÇÃO" showBack />
      <main className="max-w-3xl mx-auto px-4 pb-16">
        <motion.section
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="relative overflow-hidden p-6 sm:p-8 mb-6"
          style={panelStyle}
        >
          <div
            className="hidden sm:block absolute top-4 right-6 rotate-[10deg] pointer-events-none select-none opacity-40"
            aria-hidden
          >
            <div
              className="hq-title-sm text-3xl"
              style={{ color: "var(--hq-accent)" }}
            >
              OBRIGADO!
            </div>
          </div>

          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-4"
            style={{
              background: "var(--hq-accent)",
              color: "#fff",
              border: "2.5px solid var(--ink)",
              boxShadow: "3px 3px 0 var(--ink)",
              borderRadius: "8px",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.06em",
              fontSize: "0.75rem",
            }}
          >
            <Heart className="w-3.5 h-3.5 fill-current" /> APOIE O PROJETO
          </div>

          <h1 className="hq-title text-4xl sm:text-6xl leading-[0.95]">
            FAÇA UMA
            <br />
            DOAÇÃO 🍌
          </h1>

          <p
            className="mt-4 max-w-lg text-sm sm:text-base"
            style={{
              color: "var(--ink)",
              fontFamily: "Comic Neue, sans-serif",
              fontWeight: 700,
            }}
          >
            Se você curtiu o{" "}
            <span
              style={{
                textDecoration: "underline",
                textDecorationColor: "var(--hq-accent)",
                textDecorationThickness: "3px",
              }}
            >
              Banana!
            </span>{" "}
            e acha que tem potencial, considere fazer uma doação pro
            desenvolvedor. Qualquer valor ajuda a manter o projeto vivo e trazer
            novidades! 🚀
          </p>
        </motion.section>

        <div className="grid gap-5 md:grid-cols-[auto_1fr] items-start">
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-3 mx-auto md:mx-0 w-full max-w-[260px]"
            style={panelStyle}
          >
            <div
              className="p-3"
              style={{
                background: "#fff",
                border: "2.5px solid var(--ink)",
                borderRadius: "8px",
              }}
            >
              <img
                src={qrAsset.url}
                alt="QR Code Pix C6 Bank — Murilo Ferreira da Silva"
                className="w-full h-auto block"
              />
            </div>
            <div
              className="mt-3 text-center hq-title-sm text-base"
              style={{ letterSpacing: "0.1em" }}
            >
              PIX · APONTE A CÂMERA
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="p-5 space-y-4"
            style={panelStyle}
          >
            <div>
              <div
                className="hq-title-sm text-sm"
                style={{ opacity: 0.7, letterSpacing: "0.1em" }}
              >
                BANCO
              </div>
              <div
                className="font-bold text-xl"
                style={{ fontFamily: "Comic Neue, sans-serif", color: "var(--ink)" }}
              >
                C6 Bank
              </div>
            </div>

            <div>
              <div
                className="hq-title-sm text-sm"
                style={{ opacity: 0.7, letterSpacing: "0.1em" }}
              >
                FAVORECIDO
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="font-bold text-xl"
                  style={{
                    fontFamily: "Comic Neue, sans-serif",
                    color: "var(--ink)",
                  }}
                >
                  Murilo Ferreira da Silva
                </div>
                <button
                  onClick={copyName}
                  className="p-1.5 transition-colors"
                  style={{
                    background: "var(--hq-panel)",
                    border: "2.5px solid var(--ink)",
                    boxShadow: "2px 2px 0 var(--ink)",
                    borderRadius: "6px",
                    color: "var(--ink)",
                  }}
                  title="Copiar nome"
                  aria-label="Copiar nome"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div
                className="text-sm mt-1 italic"
                style={{
                  color: "var(--ink)",
                  opacity: 0.7,
                  fontFamily: "Comic Neue, sans-serif",
                  fontWeight: 700,
                }}
              >
                Motorista &amp; desenvolvedor 🚗💻
              </div>
            </div>

            <div
              className="pt-3"
              style={{ borderTop: "2.5px dashed var(--ink)", opacity: 0.9 }}
            >
              <p
                className="text-sm"
                style={{
                  color: "var(--ink)",
                  fontFamily: "Comic Neue, sans-serif",
                  fontWeight: 700,
                }}
              >
                💛 Obrigado por chegar até aqui! Seu apoio faz uma diferença
                enorme.
              </p>
            </div>

            <Link
              to="/"
              onClick={() => sfx.pick()}
              className="hq-btn hq-btn-primary inline-flex items-center gap-2 px-4 py-2 text-white"
            >
              <Home className="w-4 h-4" /> VOLTAR PRO JOGO
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
