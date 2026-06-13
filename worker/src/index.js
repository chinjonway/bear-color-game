const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const BEARS = ["honey", "polar", "panda", "grizzly", "red", "blue"];
const SLOTS = 4;

function newSecret() {
  return Array.from({ length: SLOTS }, () => BEARS[Math.floor(Math.random() * BEARS.length)]);
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getBearCounts(secret) {
  const counts = {};
  for (const id of secret) counts[id] = (counts[id] || 0) + 1;
  return counts;
}

export class BearRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this._code = null;
    this._secret = null;
    this._gameState = "lobby";
  }

  async loadState() {
    const stored = await this.state.storage.get(["code", "secret", "gameState"]);
    // Preserve code set from URL before storage load (critical — do not revert)
    this._code = this._code || stored.get("code") || null;
    this._secret = stored.get("secret") || null;
    this._gameState = stored.get("gameState") || "lobby";
  }

  async saveState() {
    await this.state.storage.put({
      code: this._code,
      secret: this._secret,
      gameState: this._gameState,
    });
  }

  getPlayers() {
    return this.state.getWebSockets().map(ws => ({
      ws,
      ...(ws.deserializeAttachment() || {}),
    }));
  }

  broadcast(msg, exclude = null) {
    const str = JSON.stringify(msg);
    for (const ws of this.state.getWebSockets()) {
      if (ws !== exclude) ws.send(str);
    }
  }

  async fetch(request) {
    await this.loadState();
    const url = new URL(request.url);
    const code = url.pathname.split("/").pop();

    if (!this._code) {
      this._code = code;
      await this.saveState();
    }

    const role = url.searchParams.get("role") || "player";
    const nickname = decodeURIComponent(url.searchParams.get("nickname") || "Player");

    const [client, server] = Object.values(new WebSocketPair());
    this.state.acceptWebSocket(server);

    server.serializeAttachment({
      nickname,
      role,
      guesses: [],
      finished: false,
      finishedAt: null,
      joinedAt: Date.now(),
    });

    const existingPlayers = this.getPlayers()
      .filter(p => p.ws !== server)
      .map(p => ({ nickname: p.nickname, role: p.role, finished: p.finished || false }));

    server.send(JSON.stringify({
      type: "joined",
      role,
      nickname,
      playerCount: existingPlayers.length + 1,
      gameState: this._gameState,
      bearCounts: this._secret ? getBearCounts(this._secret) : null,
      secret: this._gameState === "finished" ? this._secret : null,
      players: [
        ...existingPlayers,
        { nickname, role, finished: false },
      ],
    }));

    this.broadcast(
      {
        type: "player_joined",
        nickname,
        playerCount: existingPlayers.length + 1,
        players: [
          ...existingPlayers,
          { nickname, role, finished: false },
        ],
      },
      server,
    );

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    await this.loadState();
    let data;
    try { data = JSON.parse(message); } catch { return; }
    const att = ws.deserializeAttachment() || {};

    if (data.type === "ping") {
      ws.send(JSON.stringify({ type: "pong" }));
      return;
    }

    if (data.type === "start_game" && att.role === "host" && (this._gameState === "lobby" || this._gameState === "finished")) {
      this._secret = newSecret();
      this._gameState = "playing";
      await this.saveState();

      // Reset all player attachments for new round
      for (const playerWs of this.state.getWebSockets()) {
        const a = playerWs.deserializeAttachment() || {};
        playerWs.serializeAttachment({ ...a, guesses: [], finished: false, finishedAt: null });
      }

      this.broadcast({
        type: "game_started",
        bearCounts: getBearCounts(this._secret),
      });
      return;
    }

    if (data.type === "guess" && this._gameState === "playing") {
      if (att.finished) return;
      const slots = data.slots;
      if (!Array.isArray(slots) || slots.length !== SLOTS) return;

      const score = slots.filter((id, i) => id === this._secret[i]).length;
      const newGuesses = [...(att.guesses || []), { slots, score }];
      const finished = score === SLOTS;
      const finishedAt = finished ? Date.now() : att.finishedAt;

      ws.serializeAttachment({ ...att, guesses: newGuesses, finished, finishedAt });

      ws.send(JSON.stringify({
        type: "guess_result",
        slots,
        score,
        guessNumber: newGuesses.length,
        finished,
      }));

      if (finished) {
        this.broadcast(
          { type: "player_finished", nickname: att.nickname, guessCount: newGuesses.length },
          ws,
        );

        const allDone = this.getPlayers().every(p => (p.ws.deserializeAttachment() || {}).finished);
        if (allDone) await this.endGame();
      }
      return;
    }

    if (data.type === "end_game" && att.role === "host" && this._gameState === "playing") {
      await this.endGame();
    }
  }

  async endGame() {
    this._gameState = "finished";
    await this.saveState();

    const leaderboard = this.getPlayers()
      .map(p => {
        const a = p.ws.deserializeAttachment() || {};
        return {
          nickname: a.nickname,
          role: a.role,
          guessCount: a.guesses?.length || 0,
          finished: a.finished || false,
          finishedAt: a.finishedAt || null,
        };
      })
      .sort((a, b) => {
        if (a.finished && b.finished) return a.finishedAt - b.finishedAt;
        if (a.finished) return -1;
        if (b.finished) return 1;
        return 0;
      });

    this.broadcast({ type: "game_over", secret: this._secret, leaderboard });
  }

  async webSocketClose(ws) {
    const att = ws.deserializeAttachment() || {};
    const remaining = this.getPlayers().filter(p => p.ws !== ws);
    this.broadcast({
      type: "player_left",
      nickname: att.nickname || "?",
      playerCount: remaining.length,
      players: remaining.map(p => ({ nickname: p.nickname, role: p.role, finished: p.finished || false })),
    });
  }

  async webSocketError() {}
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    if (request.method === "POST" && url.pathname === "/create") {
      const code = genCode();
      return new Response(JSON.stringify({ code }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const wsMatch = url.pathname.match(/^\/ws\/([A-Z0-9]{6})$/i);
    if (wsMatch && request.headers.get("Upgrade") === "websocket") {
      const code = wsMatch[1].toUpperCase();
      const id = env.BEAR_ROOM.idFromName(code);
      const stub = env.BEAR_ROOM.get(id);
      return stub.fetch(request);
    }

    return new Response("Not found", { status: 404, headers: CORS });
  },
};
