import vovo from "@/assets/avatars/vovo.png.asset.json";
import dj from "@/assets/avatars/dj.png.asset.json";
import detetive from "@/assets/avatars/detetive.png.asset.json";
import chef from "@/assets/avatars/chef.png.asset.json";
import piloto from "@/assets/avatars/piloto.png.asset.json";
import pirata from "@/assets/avatars/pirata.png.asset.json";
import cientista from "@/assets/avatars/cientista.png.asset.json";
import skatista from "@/assets/avatars/skatista.png.asset.json";
import diva from "@/assets/avatars/diva.png.asset.json";
import robo from "@/assets/avatars/robo.png.asset.json";

export type Personalidade = "sarcastico" | "brincalhao" | "competitivo" | "timido" | "confiante";

export interface Avatar {
  id: string;
  nome: string;
  url: string;
  cor: string;
  personalidade: Personalidade;
}

export const AVATARES: Avatar[] = [
  { id: "vovo",       nome: "Vovó Nice",     url: vovo.url,       cor: "#ffe86b", personalidade: "brincalhao" },
  { id: "dj",         nome: "DJ Kiko",       url: dj.url,         cor: "#4fc3f7", personalidade: "confiante" },
  { id: "detetive",   nome: "Detetive Zé",   url: detetive.url,   cor: "#ffb87a", personalidade: "sarcastico" },
  { id: "chef",       nome: "Chef Tuti",     url: chef.url,       cor: "#ff5a5f", personalidade: "brincalhao" },
  { id: "piloto",     nome: "Piloto Nina",   url: piloto.url,     cor: "#9bd4ff", personalidade: "competitivo" },
  { id: "pirata",     nome: "Pirata Rui",    url: pirata.url,     cor: "#94eec5", personalidade: "sarcastico" },
  { id: "cientista",  nome: "Cientista Bia", url: cientista.url,  cor: "#b8ef7f", personalidade: "confiante" },
  { id: "skatista",   nome: "Skatista Léo",  url: skatista.url,   cor: "#c9b3ff", personalidade: "timido" },
  { id: "diva",       nome: "Diva Duda",     url: diva.url,       cor: "#eaa8ff", personalidade: "confiante" },
  { id: "robo",       nome: "Robô Bit",      url: robo.url,       cor: "#82e9ff", personalidade: "timido" },
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
