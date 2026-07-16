
# Jogo do Mico — Plano de Construção

Web app completo em português, jogável no navegador (celular, tablet e desktop), com visual "cassino moderno escuro" (feltro verde + dourado + cartas claras).

## O que será entregue

**Modos de jogo**
- **Vs IA** (1 humano + 1 a 3 bots), jogável offline no navegador
- **Multiplayer online por código de sala** (2 a 4 jogadores). Criar sala gera um código curto (ex.: `MICO-4F7K`). Amigos entram digitando o código. Funciona em qualquer rede — dentro da mesma Wi-Fi ou pela internet.
- Reconexão: se o jogador cair, ao voltar com o mesmo código a partida é retomada.

**Regras (Mico tradicional)**
- Baralho de 52 cartas menos um Valete (fica 1 carta sem par = o Mico)
- Distribuição igualitária, restos automáticos
- **Descarte automático de pares** na mão inicial e após cada jogada
- Na sua vez, você **escolhe visualmente qual carta puxar** do adversário (cartas ficam viradas para baixo, você toca na que quiser) — inclusive na rodada final com risco real de pegar o Mico
- **Mesa central mostra os pares já formados** por cada jogador (com avatar/nome) para ficar realista
- Vence quem termina sem o Mico; perdedor recebe o "Mico" com animação

**Interface e UX**
- Layout responsivo (retrato e paisagem), respeita safe-area (notch)
- Animações suaves: distribuição, descarte de par, puxar carta, virar carta
- Tutorial interativo das regras (modal com passos)
- **Tema claro e escuro** com alternância
- Sons opcionais (embaralhar, pegar carta, formar par, vitória) + toggle mudo
- Estatísticas e ranking local (partidas jogadas, vitórias, derrotas, streak) salvos no navegador

**Monetização (adaptada para web)**
- Como AdMob e Play Billing são exclusivos Android nativo, na web fica assim:
  - Sem anúncios no MVP (posso adicionar Google AdSense depois se você quiser, banner só no menu)
  - Compra "Remover anúncios" fica para uma iteração futura via Stripe se você quiser habilitar

## Arquitetura técnica

**Frontend**: React 19 + TanStack Start + Tailwind v4, animações com Framer Motion.

**Backend em tempo real** (multiplayer): Lovable Cloud (Postgres + Realtime).
- Tabela `rooms` (código, estado do jogo em JSON, host, status)
- Tabela `room_players` (sala, user_id, nome, ordem, cartas em JSON, online)
- Realtime subscription para sincronizar estado entre jogadores
- Autenticação anônima (o jogador escolhe um nome, recebe um id anônimo)
- RLS: jogador só vê a própria mão; mesa (pares descartados) e "quantas cartas cada um tem" são públicos da sala

**Motor do jogo** (`src/game/mico.ts`): funções puras — criar baralho, distribuir, detectar pares, executar "puxar carta", detectar fim. Mesmo motor usado no modo IA e no online.

**IA**: escolha uniformemente aleatória de qual carta do humano puxar (o Mico se camufla naturalmente entre as outras — é assim que o jogo real funciona).

## Rotas

```text
/                     Menu principal (Jogar vs IA / Criar sala / Entrar em sala / Tutorial / Estatísticas / Tema)
/tutorial             Regras passo a passo
/jogar/ia             Partida contra IA
/sala/:codigo         Sala multiplayer (lobby + partida)
/estatisticas         Ranking local
```

## Etapas de entrega

1. Design system (tokens verde-feltro + dourado + cartas), tema claro/escuro, layout base responsivo
2. Motor puro do jogo + testes mentais das regras
3. Componentes de UI: Carta, Mão (leque), Mesa (pares por jogador), Avatar, Contador
4. Modo vs IA completo com animações e escolha manual de carta
5. Ativar Lovable Cloud, criar tabelas e RLS
6. Multiplayer: criar/entrar em sala, lobby, sincronia realtime, escolha de carta pelo adversário
7. Reconexão, fim de jogo, animação do "Mico"
8. Tutorial, estatísticas locais, sons, toggle de tema/som
9. SEO, sitemap, robots, meta tags em português

## Detalhes técnicos importantes

- Multiplayer usa Lovable Cloud (Supabase por baixo). Não usamos Bluetooth nem LAN pura — em vez disso, código de sala funciona em qualquer rede (inclusive na mesma Wi-Fi), o que é mais confiável e cobre todos os cenários que você descreveu.
- AdMob/Play Billing/Bluetooth/Jetpack Compose não existem em web e ficam de fora.
- Estado do jogo vive no servidor (JSON na tabela `rooms`), atualizado por server functions autenticadas. Isso evita trapaça no cliente.
- Cartas do adversário são sempre enviadas como "N cartas viradas" — o cliente nunca recebe os valores; ao escolher qual pegar, o servidor decide e revela apenas essa.
