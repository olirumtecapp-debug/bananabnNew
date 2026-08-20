import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/game/TopBar";

export const Route = createFileRoute("/tutorial")({
  head: () => ({
    meta: [
      { title: "Como jogar Banana — Regras" },
      {
        name: "description",
        content:
          "Aprenda as regras da Banana (Old Maid): distribuição, pares, escolha da carta e como vencer.",
      },
    ],
  }),
  component: Tutorial,
});

const steps = [
  {
    title: "O BARALHO",
    body:
      "Usa-se um baralho comum de 52 cartas, do qual se removem 3 valetes — sobra apenas 1, que é a Banana. Nenhuma outra carta terá par para ele.",
  },
  {
    title: "DISTRIBUIÇÃO",
    body:
      "As cartas são distribuídas igualmente entre todos os jogadores. Alguns podem ficar com uma carta a mais — não faz diferença.",
  },
  {
    title: "DESCARTE INICIAL",
    body:
      "Cada jogador olha sua mão e joga na mesa todos os pares que já tiver (mesmo valor, ex.: dois 7). Fica só com cartas soltas.",
  },
  {
    title: "A VEZ",
    body:
      "Na sua vez, você puxa 1 carta da mão do jogador à sua esquerda — sem ver de frente. Aqui você escolhe qual carta virada quer arriscar.",
  },
  {
    title: "FORMOU PAR?",
    body:
      "Se a carta puxada formar par com alguma que você já tem, o par vai para a mesa. Os pares de todos aparecem no centro para acompanhar o jogo.",
  },
  {
    title: "FIM DO JOGO",
    body:
      "Quem termina sem cartas sai vencedor. O último jogador, que ficou com a Banana, perde a rodada. Boa sorte — e cuidado ao puxar a última carta!",
  },
];

export function Tutorial() {
  return (
    <div className="min-h-screen felt-bg">
      <TopBar title="COMO JOGAR" showBack />
      <main className="max-w-2xl mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <div
            className="text-6xl inline-block"
            style={{ filter: "drop-shadow(3px 3px 0 var(--ink))" }}
          >
            🍌
          </div>
          <h1 className="hq-title text-4xl sm:text-5xl mt-2">REGRAS DA BANANA</h1>
          <div className="mt-3 inline-block burst text-sm">RÁPIDO!</div>
        </div>
        <ol className="grid sm:grid-cols-2 gap-4">
          {steps.map((s, i) => (
            <li key={s.title} className="hq-panel p-4 relative">
              <span
                className="absolute -top-4 -left-3 w-10 h-10 flex items-center justify-center rounded-full"
                style={{
                  background: "var(--hq-secondary)",
                  color: "#fff",
                  border: "2.5px solid var(--ink)",
                  boxShadow: "3px 3px 0 var(--ink)",
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                }}
              >
                {i + 1}
              </span>
              <h2 className="hq-title-sm text-xl mb-1 mt-1">{s.title}</h2>
              <p
                className="text-sm"
                style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
              >
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
