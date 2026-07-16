/**
 * Server functions do multiplayer do Mico.
 *
 * Não usamos autenticação: cada cliente envia seu `playerId` (uuid gerado
 * localmente). O servidor é a autoridade do estado do jogo — só o jogador da
 * vez pode agir e só sobre o alvo correto. O estado inteiro fica na coluna
 * `state` (jsonb) da tabela `rooms` e é sincronizado por Realtime.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createGame, playTurn, type GameState } from "@/game/mico";

function code6(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

interface LobbyPlayer {
  id: string;
  name: string;
  online: boolean;
}

interface RoomStateJSON {
  phase: "lobby" | "playing" | "finished";
  players: LobbyPlayer[];
  hostId: string;
  game: GameState | null;
}

async function loadRoom(code: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("rooms")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function saveRoom(code: string, state: RoomStateJSON, status: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("rooms")
    .update({ state: state as never, status, updated_at: new Date().toISOString() })
    .eq("code", code);
  if (error) throw new Error(error.message);
}

/** Cria uma sala nova e insere o host como primeiro jogador. */
export const createRoomFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ name: z.string().min(1).max(20), playerId: z.string().uuid().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const playerId = data.playerId ?? crypto.randomUUID();
    // Tenta até encontrar código único
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = code6();
      const state: RoomStateJSON = {
        phase: "lobby",
        hostId: playerId,
        players: [{ id: playerId, name: data.name, online: true }],
        game: null,
      };
      const { error } = await supabaseAdmin.from("rooms").insert({
        code,
        host_id: playerId,
        state: state as never,
        status: "lobby",
      });
      if (!error) return { code, playerId };
      if (!/duplicate|unique/i.test(error.message)) throw new Error(error.message);
    }
    throw new Error("Não foi possível gerar um código único");
  });

/** Entra em uma sala existente (ou reconecta). */
export const joinRoomFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        code: z.string().min(4).max(8),
        name: z.string().min(1).max(20),
        playerId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const playerId = data.playerId ?? crypto.randomUUID();
    const room = await loadRoom(data.code);
    if (!room) throw new Error("Sala não encontrada");
    const state = room.state as unknown as RoomStateJSON;

    const existing = state.players.find((p) => p.id === playerId);
    if (existing) {
      existing.online = true;
      existing.name = data.name;
    } else {
      if (state.phase !== "lobby") throw new Error("Partida já iniciada");
      if (state.players.length >= 4) throw new Error("Sala cheia (máx. 4)");
      state.players.push({ id: playerId, name: data.name, online: true });
    }
    await saveRoom(data.code, state, room.status);
    return { code: data.code, playerId };
  });

/** Host inicia a partida. Distribui as cartas. */
export const startGameFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ code: z.string(), playerId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const room = await loadRoom(data.code);
    if (!room) throw new Error("Sala não encontrada");
    const state = room.state as unknown as RoomStateJSON;
    if (state.hostId !== data.playerId) throw new Error("Apenas o host pode começar");
    if (state.players.length < 2) throw new Error("Precisa de pelo menos 2 jogadores");
    state.phase = "playing";
    state.game = createGame(state.players.map((p) => ({ id: p.id, name: p.name, isBot: false })));
    await saveRoom(data.code, state, "playing");
    return { ok: true };
  });

/** Jogador da vez puxa uma carta do alvo pelo índice. */
export const playCardFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        code: z.string(),
        playerId: z.string().uuid(),
        cardIndex: z.number().int().min(0).max(51),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const room = await loadRoom(data.code);
    if (!room) throw new Error("Sala não encontrada");
    const state = room.state as unknown as RoomStateJSON;
    if (state.phase !== "playing" || !state.game) throw new Error("Partida não está em andamento");
    const g = state.game;
    if (g.players[g.turnIndex].id !== data.playerId) throw new Error("Não é sua vez");
    state.game = playTurn(g, data.cardIndex);
    if (state.game.status === "finished") state.phase = "finished";
    await saveRoom(data.code, state, state.phase);
    return { ok: true };
  });

/** Volta pro lobby para uma nova partida. */
export const resetGameFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ code: z.string(), playerId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const room = await loadRoom(data.code);
    if (!room) throw new Error("Sala não encontrada");
    const state = room.state as unknown as RoomStateJSON;
    if (state.hostId !== data.playerId) throw new Error("Apenas o host pode reiniciar");
    state.phase = "lobby";
    state.game = null;
    await saveRoom(data.code, state, "lobby");
    return { ok: true };
  });

export type { RoomStateJSON, LobbyPlayer };
