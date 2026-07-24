import type { Personalidade } from "./avatares";

export type EventoDialogo =
  | "inicio"
  | "meuTurno"        // é a vez desse bot
  | "vaoMePuxar"     // humano vai puxar do bot
  | "formeiPar"      // bot formou par
  | "peguei_mico"    // bot terminou com a banana
  | "passei_mico"    // bot passou a banana adiante
  | "vitoria_humano"
  | "vitoria_bot";

type Pool = Partial<Record<EventoDialogo, string[]>>;

const BASE: Pool = {
  inicio: [
    "Bora começar essa!",
    "Prometo ir devagar… talvez.",
    "Sente aí que hoje o bicho pega.",
    "Cadê a coragem?",
  ],
  meuTurno: [
    "Deixa comigo…",
    "Hmmm, qual será…",
    "Vou pensar com carinho.",
    "Essa vai ser boa.",
  ],
  vaoMePuxar: [
    "Escolhe com carinho, hein?",
    "Cuidado com a bananinha 🍌",
    "Vai fundo, corajoso!",
    "Não tô nervoso, você que tá.",
  ],
  formeiPar: [
    "Tô só esquentando 😎",
    "Fácil, fácil.",
    "Segue o jogo!",
    "Dois de uma vez, valeu!",
  ],
  peguei_mico: [
    "Ai não, essa foi maldade!",
    "Tá rindo por quê?!",
    "Só doeu o orgulho.",
    "A banana escolheu errado hoje.",
  ],
  passei_mico: [
    "HA! Aceita que dói menos.",
    "Boa sorte com essa aí 🍌",
    "Divirta-se!",
    "Manda um oi pra banana.",
  ],
  vitoria_humano: [
    "Beleza, hoje o dia é seu.",
    "Sorte de principiante 😉",
    "Revanche já!",
    "Tá contratado como parceiro.",
  ],
  vitoria_bot: [
    "Tamo junto, foi por pouco!",
    "Aceita um chá? Ajuda a pensar.",
    "Xeque-mate frutal 🍓",
    "Quer aula? Cobro barato.",
  ],
};

const EXTRA: Record<Personalidade, Pool> = {
  sarcastico: {
    meuTurno: ["Ai que preguiça de ganhar…", "Vou fingir que penso.", "Deixa eu escolher a mais podre pra você."],
    vaoMePuxar: ["Estuda um pouco antes, vai.", "Escolhe rápido, tenho compromisso.", "Chuta que é tiro certo (não é)."],
    vitoria_bot: ["Uau. Que susto. NÃO.", "Foi mal, foi mal mesmo 😌"],
  },
  brincalhao: {
    meuTurno: ["Vamo brincar! 🎉", "Ui, essa é gostosa."],
    formeiPar: ["PA-PUM! 💥", "Combinou combinou!"],
    passei_mico: ["Tchauzinho, banana 👋"],
  },
  competitivo: {
    inicio: ["Vim pra ganhar. Simples."],
    meuTurno: ["Foco. Estratégia. Vitória."],
    vitoria_bot: ["Como eu disse: vim pra ganhar."],
    peguei_mico: ["Isso não vai se repetir."],
  },
  timido: {
    inicio: ["Oi… vamos jogar?"],
    meuTurno: ["Vou tentar…", "Espero não errar."],
    vaoMePuxar: ["Vai com calma, tá?"],
    vitoria_humano: ["Parabéns! Foi bem legal."],
  },
  confiante: {
    inicio: ["Podem chegar."],
    meuTurno: ["Como eu imaginei."],
    formeiPar: ["Textbook."],
    vitoria_bot: ["Já era esperado."],
  },
};

export function fala(evento: EventoDialogo, personalidade: Personalidade): string | null {
  const pool = [
    ...(BASE[evento] ?? []),
    ...(EXTRA[personalidade]?.[evento] ?? []),
    ...(EXTRA[personalidade]?.[evento] ?? []), // dobra o peso da personalidade
  ];
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Rola um dado — retorna true com a probabilidade dada (0..1). */
export function chance(p: number): boolean {
  return Math.random() < p;
}
