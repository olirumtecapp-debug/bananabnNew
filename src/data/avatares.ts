export type Personalidade = "sarcastico" | "brincalhao" | "competitivo" | "timido" | "confiante";

export interface Avatar {
  id: string;
  nome: string;
  url: string;
  cor: string;
  personalidade: Personalidade;
}

export const AVATARES: Avatar[] = [
  { id: "vovo",       nome: "Vovó Nice",     url: "/avatars/vovo.png",       cor: "#ffe86b", personalidade: "brincalhao" },
  { id: "dj",         nome: "DJ Kiko",       url: "/avatars/dj.png",         cor: "#4fc3f7", personalidade: "confiante" },
  { id: "detetive",   nome: "Detetive Zé",   url: "/avatars/detetive.png",   cor: "#ffb87a", personalidade: "sarcastico" },
  { id: "chef",       nome: "Chef Tuti",     url: "/avatars/chef.png",       cor: "#ff5a5f", personalidade: "brincalhao" },
  { id: "piloto",     nome: "Piloto Nina",   url: "/avatars/piloto.png",     cor: "#9bd4ff", personalidade: "competitivo" },
  { id: "pirata",     nome: "Pirata Rui",    url: "/avatars/pirata.png",     cor: "#94eec5", personalidade: "sarcastico" },
  { id: "cientista",  nome: "Cientista Bia", url: "/avatars/cientista.png",  cor: "#b8ef7f", personalidade: "confiante" },
  { id: "skatista",   nome: "Skatista Léo",  url: "/avatars/skatista.png",   cor: "#c9b3ff", personalidade: "timido" },
  { id: "diva",       nome: "Diva Duda",     url: "/avatars/diva.png",       cor: "#eaa8ff", personalidade: "confiante" },
  { id: "robo",       nome: "Robô Bit",      url: "/avatars/robo.png",       cor: "#82e9ff", personalidade: "timido" },
];

export function getAvatar(id: string | undefined | null): Avatar {
  return AVATARES.find((a) => a.id === id) ?? AVATARES[0];
}

/** Retorna N avatares aleatórios diferentes do escolhido pelo jogador. */
export function pickBots(exceptId: string, n: number): Avatar[] {
  const pool = AVATARES.filter((a) => a.id !== exceptId).slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}
