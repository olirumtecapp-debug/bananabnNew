import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/game/TopBar";

export const Route = createFileRoute("/tutorial")({
  head: () => ({
    meta: [
      { title: "Como jogar Mico — Regras" },
      {
        name: "description",
        content:
          "Aprenda as regras do Mico (Old Maid): distribuição, pares, escolha da carta e como vencer.",
      },
    ],
  }),
  component: Tutorial,
});

const steps = [
  {
    title: "1. O baralho",
    body:
      "Usa-se um baralho comum de 52 cartas, do qual se removem 3 valetes — sobra apenas 1, que é o Mico. Nenhuma outra carta terá par para ele.",
  },
  {
    title: "2. Distribuição",
    body:
      "As cartas são distribuídas igualmente entre todos os jogadores. Alguns podem ficar com uma carta a mais — não faz diferença.",
  },
  {
    title: "3. Descarte inicial",
    body:
      "Cada jogador olha sua mão e joga na mesa todos os pares que já tiver (mesmo valor, ex.: dois 7). Fica só com cartas soltas.",
  },
  {
    title: "4. A vez",
    body:
      "Na sua vez, você puxa 1 carta da mão do jogador à sua esquerda — sem ver de frente. Aqui você escolhe qual carta virada quer arriscar.",
  },
  {
    title: "5. Formou par?",
    body:
      "Se a carta puxada formar par com alguma que você já tem, o par vai para a mesa. Os pares de todos aparecem no centro para acompanhar o jogo.",
  },
  {
    title: "6. Fim do jogo",
    body:
      "Quem termina sem cartas sai vencedor. O último jogador, que ficou com o Mico, perde a rodada. Boa sorte — e cuidado ao puxar a última carta!",
  },
];

function Tutorial() {
  return (
    <div className="min-h-screen felt-bg">
      <TopBar title="Como jogar" showBack />
      <main className="max-w-2xl mx-auto px-4 pb-16">
        <div className="text-center mb-6">
          <div className="text-5xl">🐒</div>
          <h1 className="font-display text-3xl sm:text-4xl gold-text">Regras do Mico</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
            Rápido de aprender, viciante de jogar.
          </p>
        </div>
        <ol className="space-y-3">
          {steps.map((s) => (
            <li
              key={s.title}
              className="rounded-xl bg-[var(--color-felt-deep)]/70 border border-[var(--color-gold)]/25 p-4"
            >
              <h2 className="font-semibold text-[var(--color-gold)] mb-1">{s.title}</h2>
              <p className="text-sm text-[var(--color-paper)]/90">{s.body}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
