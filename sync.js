/* =====================================================================
 * FitLab — Sincronização entre aparelhos
 * Os dados vão para um arquivo num Gist secreto da conta GitHub do
 * usuário, CRIPTOGRAFADO no aparelho (AES-GCM 256, chave derivada da
 * senha com PBKDF2-SHA256). O GitHub só vê texto cifrado.
 *
 * Mescla em 3 vias por registro (base = último estado sincronizado neste
 * aparelho): novidades dos dois lados somam, edição mais recente vence,
 * exclusões viram "lápides" para não ressuscitar em outro aparelho.
 * Na primeira sincronização de um aparelho, a cópia da nuvem prevalece
 * para registros que existem nos dois lados.
 * Registros equivalentes criados em aparelhos diferentes (mesmo perfil,
 * mesma dieta/programa da planilha, mesmo dia do diário) são unificados.
 * Token e senha ficam só neste aparelho e nunca entram no backup.
 * ===================================================================== */
(function () {
  'use strict';
  const A = window.App;
  const K = { token: 'fitlab.sync.token', senha: 'fitlab.sync.senha', gist: 'fitlab.sync.gist', base: 'fitlab.sync.base', disp: 'fitlab.sync.dispositivo', ult: 'fitlab.sync.ultimo' };
  const ARQ = 'fitlab-sync.json', DESC = 'FitLab – sincronização (criptografado)';
  const COLECOES = ['perfis', 'avaliacoes', 'medidas', 'alimentosCustom', 'exerciciosCustom', 'dietas', 'diario', 'programas', 'ciclos', 'sessoes', 'aerobicos', 'suplementos', 'tomadas'];
  const CONFIG_LOCAL = ['tema', '_mod'];
  const ITER = 310000;

  const ls = { get: (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }, set: (k, v) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) { /* armazenamento bloqueado */ } } };
  const ativo = () => !!(ls.get(K.token) && ls.get(K.senha));
  const esc = A.h;

  /* ---------- utilidades ---------- */
  const b64 = (buf) => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  function estavel(v) { // JSON com chaves ordenadas, sem campos de controle
    if (Array.isArray(v)) return '[' + v.map(estavel).join(',') + ']';
    if (v && typeof v === 'object') return '{' + Object.keys(v).filter((k) => k !== '_mod' && k !== '_unif').sort().map((k) => JSON.stringify(k) + ':' + estavel(v[k])).join(',') + '}';
    return JSON.stringify(v === undefined ? null : v);
  }
  function hash(v) { const s = estavel(v); let h1 = 0x811c9dc5, h2 = 0x01000193; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822519); } return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36) + s.length.toString(36); }
  const agora = () => Date.now();
  const dispositivo = () => { let d = ls.get(K.disp); if (!d) { const ua = navigator.userAgent; d = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? 'Tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'Celular' : 'Computador'; ls.set(K.disp, d); } return d; };
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

  /* ---------- criptografia ---------- */
  let chaveCache = null; // { salt, senha, key }
  async function chave(senha, saltB64) {
    if (chaveCache && chaveCache.salt === saltB64 && chaveCache.senha === senha) return chaveCache.key;
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(saltB64), iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    chaveCache = { salt: saltB64, senha, key };
    return key;
  }
  async function cifrar(obj, senha, saltB64) {
    saltB64 = saltB64 || b64(crypto.getRandomValues(new Uint8Array(16)));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await chave(senha, saltB64), new TextEncoder().encode(JSON.stringify(obj)));
    return JSON.stringify({ app: 'fitlab', v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: saltB64, iv: b64(iv), dados: b64(ct) });
  }
  async function decifrar(texto, senha) {
    let env; try { env = JSON.parse(texto); } catch (e) { throw new Error('Arquivo de sincronização corrompido.'); }
    if (env.app !== 'fitlab' || !env.dados) throw new Error('O gist encontrado não é do FitLab.');
    try {
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, await chave(senha, env.salt), unb64(env.dados));
      return { dados: JSON.parse(new TextDecoder().decode(pt)), salt: env.salt };
    } catch (e) { chaveCache = null; const err = new Error('Senha de sincronização incorreta para os dados salvos no GitHub.'); err.senha = true; throw err; }
  }

  /* ---------- GitHub Gist ---------- */
  async function gh(caminho, opts) {
    opts = opts || {};
    let r;
    try {
      r = await fetch('https://api.github.com' + caminho, { method: opts.method || 'GET', headers: { Authorization: 'Bearer ' + ls.get(K.token), Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' }, body: opts.body ? JSON.stringify(opts.body) : undefined, cache: 'no-store' });
    } catch (e) { throw new Error('Sem conexão com o GitHub.'); }
    if (r.status === 401) throw new Error('Token do GitHub inválido ou expirado.');
    if (r.status === 403 || r.status === 404) {
      const j = await r.json().catch(() => ({}));
      if (/rate limit/i.test(j.message || '')) throw new Error('Limite de uso da API do GitHub atingido. Tente mais tarde.');
      if (r.status === 404 && caminho.startsWith('/gists/')) { ls.set(K.gist, ''); throw new Error('O gist de sincronização não existe mais. Sincronize de novo para criar outro.'); }
      throw new Error('O token não tem permissão para Gists (leitura e escrita).');
    }
    if (!r.ok) throw new Error(`Erro do GitHub (${r.status}).`);
    return r.json();
  }
  async function acharGist() {
    const id = ls.get(K.gist);
    if (id) return id;
    for (let pag = 1; pag <= 5; pag++) {
      const lista = await gh(`/gists?per_page=100&page=${pag}`);
      const g = lista.find((x) => x.files && x.files[ARQ]);
      if (g) { ls.set(K.gist, g.id); return g.id; }
      if (lista.length < 100) break;
    }
    return '';
  }
  async function lerGist(id) {
    const g = await gh('/gists/' + id);
    const f = g.files && g.files[ARQ];
    if (!f) return null;
    if (f.truncated && f.raw_url) { const r = await fetch(f.raw_url, { cache: 'no-store' }); return r.text(); }
    return f.content;
  }

  /* ---------- unificação de registros equivalentes ---------- */
  function lerBase() { try { return JSON.parse(ls.get(K.base)) || null; } catch (e) { return null; } }
  function configSinc(cfg) { const o = {}; Object.keys(cfg || {}).forEach((k) => { if (!CONFIG_LOCAL.includes(k)) o[k] = cfg[k]; }); return o; }

  /* Chaves naturais: o mesmo registro criado em dois aparelhos com ids diferentes */
  const CHAVES = {
    avaliacoes: (r) => r.origem ? r.perfilId + '|' + r.origem : null,
    dietas: (r) => r.origem ? r.perfilId + '|' + r.origem : null,
    programas: (r) => r.origem ? r.perfilId + '|' + r.origem : null,
    diario: (r) => r.perfilId + '|' + r.data,
    tomadas: (r) => r.perfilId + '|' + r.data + '|' + r.suplementoId,
    suplementos: (r) => r.catalogoId ? r.perfilId + '|' + r.catalogoId : null
  };
  function trocarId(lista, antigo, novo, campo) { (lista || []).forEach((x) => { if (x[campo] === antigo) x[campo] = novo; }); }
  function unificar(local, remoto) {
    const R = (col) => (remoto && remoto[col]) || [];
    // 1) perfis com o mesmo nome viram o mesmo perfil
    (local.perfis || []).forEach((p) => {
      const par = R('perfis').find((x) => x.id !== p.id && norm(x.nome) === norm(p.nome));
      if (!par || (local.perfis || []).some((x) => x.id === par.id)) return;
      const antigo = p.id; p.id = par.id; p._unif = true;
      COLECOES.forEach((col) => { if (col !== 'perfis') trocarId(local[col], antigo, par.id, 'perfilId'); });
      if (local.perfilAtivo === antigo) local.perfilAtivo = par.id;
    });
    // 2) demais coleções por chave natural (depois do ajuste de perfilId)
    Object.keys(CHAVES).forEach((col) => {
      const f = CHAVES[col];
      const mapa = new Map(); R(col).forEach((r) => { const k = f(r); if (k) mapa.set(k, r.id); });
      const idsLocais = new Set((local[col] || []).map((x) => x.id));
      (local[col] || []).forEach((r) => {
        const k = f(r); const idR = k && mapa.get(k);
        if (!idR || idR === r.id || idsLocais.has(idR)) return;
        const antigo = r.id; r.id = idR; r._unif = true;
        if (col === 'programas') { trocarId(local.sessoes, antigo, idR, 'programaId'); trocarId(local.ciclos, antigo, idR, 'programaId'); }
        if (col === 'suplementos') trocarId(local.tomadas, antigo, idR, 'suplementoId');
      });
    });
  }

  /* ---------- mescla ---------- */
  function mesclar(local, remoto, base, t) {
    const res = { colecoes: {}, apagados: {}, config: null, mudouLocal: false, mudouRemoto: false };
    const baseH = (base && base.h) || {};
    const primeira = !base;
    COLECOES.forEach((col) => {
      const L = new Map((local[col] || []).map((r) => [r.id, r]));
      const R = new Map(((remoto && remoto.colecoes && remoto.colecoes[col]) || []).map((r) => [r.id, r]));
      const B = baseH[col] || {};
      const lapides = Object.assign({}, (remoto && remoto.apagados && remoto.apagados[col]) || {});
      const out = [];
      const ids = new Set([...L.keys(), ...R.keys(), ...Object.keys(B)]);
      ids.forEach((id) => {
        const l = L.get(id), r = R.get(id);
        const localMudou = l && (!(id in B) || hash(l) !== B[id]);
        const localApagou = !l && id in B;
        // primeira vez neste aparelho ou registro unificado: a nuvem prevalece
        if (l && localMudou && !(r && (primeira || l._unif))) l._mod = t;
        if (l) delete l._unif;
        if (localApagou) {
          if (r && (r._mod || 0) > ((base && base.t) || 0)) { out.push(r); res.mudouLocal = true; } // editado em outro aparelho depois: mantém
          else { lapides[id] = t; if (r) res.mudouRemoto = true; }
          return;
        }
        const lap = lapides[id] || 0;
        let venc = null;
        if (l && r) venc = (l._mod || 0) > (r._mod || 0) ? l : (l._mod || 0) === (r._mod || 0) && hash(l) === hash(r) ? l : r;
        else venc = l || r;
        if (venc && lap && lap >= (venc._mod || 0)) { if (l) res.mudouLocal = true; return; }
        if (venc && lap) delete lapides[id];
        out.push(venc);
        if (venc !== l && (!l || hash(l) !== hash(venc))) res.mudouLocal = true;
        if (venc !== r && (!r || hash(r) !== hash(venc) || (r._mod || 0) !== (venc._mod || 0))) res.mudouRemoto = true;
      });
      res.colecoes[col] = out;
      res.apagados[col] = lapides;
    });
    // configurações: última alteração vence (tema fica em cada aparelho)
    const cL = configSinc(local.config), cR = (remoto && remoto.config) || null;
    const cLmudou = !base || hash(cL) !== base.cfg;
    const cLmod = cLmudou ? (primeira && cR ? 0 : t) : ((local.config && local.config._mod) || 0);
    if (!cR || cLmod >= (cR._mod || 0)) { res.config = Object.assign({}, cL, { _mod: cLmod || t }); if (!cR || hash(cR) !== hash(res.config)) res.mudouRemoto = true; }
    else { res.config = cR; if (hash(cR) !== hash(cL)) res.mudouLocal = true; }
    return res;
  }

  /* ---------- redesenho sem atrapalhar quem está digitando ---------- */
  let redesenhoPendente = false, redesenhoT = null;
  const ocupado = () => { const a = document.activeElement; return !!document.querySelector('#modal .modal-bg') || !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)); };
  function redesenhar() {
    if (!ocupado()) { redesenhoPendente = false; A.render(); return; }
    redesenhoPendente = true; clearTimeout(redesenhoT);
    redesenhoT = setTimeout(function tenta() { if (!redesenhoPendente) return; if (ocupado()) { redesenhoT = setTimeout(tenta, 2000); return; } redesenhoPendente = false; A.render(); }, 2000);
  }
  window.addEventListener('hashchange', () => { redesenhoPendente = false; });

  /* ---------- sincronizar ---------- */
  let rodando = null, pendente = false, ultimoErro = '', erroSenha = false;
  function status(msg, tipo) {
    const b = document.getElementById('btnSync');
    if (b) { b.hidden = !ativo(); b.textContent = tipo === 'sync' ? '⟳' : tipo === 'erro' ? '⚠' : '☁'; b.title = msg || 'Sincronizar'; b.classList.toggle('sync-erro', tipo === 'erro'); b.classList.toggle('sync-roda', tipo === 'sync'); }
    const el = document.getElementById('syncStatus'); if (el) el.textContent = msg;
  }
  async function sincronizar(opts) {
    opts = opts || {};
    if (!ativo()) return { ok: false, msg: 'Sincronização não configurada' };
    if (rodando) { pendente = true; return rodando; }
    rodando = (async () => {
      status('Sincronizando…', 'sync');
      try {
        const st = A.S, senha = ls.get(K.senha), t = agora();
        let id = await acharGist();
        let remoto = null, salt = null;
        if (id && !opts.recomecar) {
          const txt = await lerGist(id);
          if (txt) { const d = await decifrar(txt, senha); remoto = d.dados; salt = d.salt; }
        }
        const base = opts.recomecar ? null : lerBase();
        if (remoto) unificar(st, remoto.colecoes || {});
        const m = mesclar(st, remoto, base && base.gist === id ? base : null, t);
        // aplica localmente (mesmo objeto de estado do app)
        if (m.mudouLocal || !remoto) {
          COLECOES.forEach((col) => { st[col] = m.colecoes[col]; });
          const locais = {}; CONFIG_LOCAL.forEach((k) => { if (st.config && k in st.config) locais[k] = st.config[k]; });
          st.config = Object.assign({}, A.vazio().config, m.config, locais, { _mod: m.config._mod });
        } else st.config._mod = m.config._mod;
        if (!st.perfis.some((p) => p.id === st.perfilAtivo)) st.perfilAtivo = (st.perfis[0] || {}).id || null;
        const arquivo = { app: 'fitlab', v: 1, atualizadoEm: new Date(t).toISOString(), por: dispositivo(), colecoes: m.colecoes, apagados: m.apagados, config: m.config };
        if (!id) {
          const g = await gh('/gists', { method: 'POST', body: { description: DESC, public: false, files: { [ARQ]: { content: await cifrar(arquivo, senha) } } } });
          id = g.id; ls.set(K.gist, id);
        } else if (m.mudouRemoto || !remoto) {
          await gh('/gists/' + id, { method: 'PATCH', body: { files: { [ARQ]: { content: await cifrar(arquivo, senha, salt) } } } });
        }
        // nova base = estado mesclado
        const h = {}; COLECOES.forEach((col) => { h[col] = {}; m.colecoes[col].forEach((r) => { h[col][r.id] = hash(r); }); });
        ls.set(K.base, JSON.stringify({ gist: id, t, h, cfg: hash(configSinc(st.config)) }));
        ls.set(K.ult, new Date(t).toISOString());
        salvandoPorSync = true; A.saveNow(); salvandoPorSync = false;
        ultimoErro = ''; erroSenha = false;
        const quando = new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        status(`Sincronizado às ${quando}`, 'ok');
        if (m.mudouLocal && !opts.silencioso) A.toast('Dados atualizados de outro aparelho');
        if (m.mudouLocal) redesenhar();
        return { ok: true, recebeu: m.mudouLocal, enviou: m.mudouRemoto || !remoto };
      } catch (e) {
        ultimoErro = e.message || String(e); erroSenha = !!e.senha;
        status('Falha ao sincronizar: ' + ultimoErro, 'erro');
        if (!opts.silencioso) A.toast(ultimoErro, 3500);
        return { ok: false, msg: ultimoErro };
      } finally {
        rodando = null;
        if (pendente) { pendente = false; setTimeout(() => sincronizar({ silencioso: true }), 500); }
      }
    })();
    return rodando;
  }

  /* ---------- gatilhos automáticos ---------- */
  let salvandoPorSync = false, timer = null;
  A.hooks.salvo.push(() => { if (salvandoPorSync || !ativo()) return; clearTimeout(timer); timer = setTimeout(() => { timer = null; sincronizar({ silencioso: true }); }, 4000); });
  A.hooks.boot.push(() => {
    status(ativo() ? 'Sincronização ativa' : '', 'ok');
    const b = document.getElementById('btnSync'); if (b) b.onclick = async () => { const r = await sincronizar(); if (r && r.ok) A.toast(r.recebeu ? 'Dados recebidos de outro aparelho' : 'Sincronizado'); };
    if (ativo()) setTimeout(() => sincronizar({ silencioso: true }), 800);
  });
  document.addEventListener('visibilitychange', () => {
    if (!ativo()) return;
    if (document.visibilityState === 'visible') sincronizar({ silencioso: true });
    else if (timer) { clearTimeout(timer); timer = null; sincronizar({ silencioso: true }); }
  });
  window.addEventListener('online', () => { if (ativo()) sincronizar({ silencioso: true }); });

  /* ---------- tela de configuração ---------- */
  A.route('sync', () => {
    A.setTitle('Sincronização');
    const on = ativo(), ult = ls.get(K.ult), semPerfil = !A.perfil();
    const salvar = async (recomecar) => {
      const q = (s) => A.$(s);
      const tok = q('#syTok').value.trim(), sen = q('#sySenha').value.trim(), sen2 = q('#sySenha2').value.trim();
      if (sen) {
        if (sen.length < 8) { A.toast('Use uma senha com pelo menos 8 caracteres'); return; }
        if (sen !== sen2) { A.toast('As duas senhas não conferem'); return; }
      }
      if (tok) ls.set(K.token, tok);
      if (sen && sen !== ls.get(K.senha)) { ls.set(K.senha, sen); ls.set(K.base, ''); chaveCache = null; }
      ls.set(K.disp, q('#syDisp').value.trim() || dispositivo());
      if (!ativo()) { A.toast('Informe o token e a senha'); return; }
      A.toast(recomecar ? 'Recomeçando…' : 'Sincronizando…');
      const r = await sincronizar(recomecar ? { recomecar: true } : { silencioso: true });
      if (r && r.ok) {
        A.toast(recomecar ? 'Pronto! Use esta mesma senha nos outros aparelhos.' : r.recebeu ? 'Sincronizado: dados recebidos de outro aparelho' : 'Sincronização ativa', 3000);
        if (semPerfil && A.perfil()) { A.go('inicio'); return; }
      } else if (r && r.msg) A.toast(r.msg, 3500);
      A.render();
    };
    A.on('sySalvar', () => salvar(false));
    A.on('syRecomecar', () => A.confirmar('Substituir a cópia no GitHub pelos dados deste aparelho, com a senha atual? Os dados que estavam lá com a senha antiga não poderão ser recuperados.', () => salvar(true), { danger: true, ok: 'Recomeçar' }));
    A.on('syAgora', async () => { const r = await sincronizar(); if (r && r.ok) A.toast(r.recebeu ? 'Dados recebidos de outro aparelho' : 'Sincronizado'); A.render(); });
    A.on('syOff', () => A.confirmar('Desativar a sincronização neste aparelho? Os dados continuam aqui e no GitHub.', () => { [K.token, K.senha, K.gist, K.base, K.ult].forEach((k) => ls.set(k, '')); chaveCache = null; status('', 'ok'); A.toast('Sincronização desativada neste aparelho'); A.render(); }, { ok: 'Desativar' }));
    A.on('syVer', (el) => { A.$('#sySenha').type = A.$('#sySenha2').type = el.checked ? 'text' : 'password'; });
    const campoSenha = (id, ph) => `<input type="password" id="${id}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore placeholder="${ph}">`;
    return `${semPerfil ? '<div class="row mb"><a class="btn sm ghost" href="#/inicio">‹ Voltar e criar perfil</a></div>' : ''}
      <div class="card accent"><h2>☁ Sincronização entre aparelhos</h2>
      ${on ? `<p><span class="badge ok">Ativa neste aparelho</span> <small class="muted" id="syncStatus">${ult ? 'Última: ' + esc(A.fmtData(ult.slice(0, 10))) + ' ' + esc(new Date(ult).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })) : ''}${ultimoErro ? ' · ' + esc(ultimoErro) : ''}</small></p>` : ''}
      <p class="text-2">Celular, tablet e notebook compartilham os mesmos perfis, dietas, treinos e registros por um Gist secreto da sua conta do GitHub. Tudo é criptografado com a sua senha antes de sair do aparelho. Use o mesmo token e a mesma senha em cada aparelho. Token e senha ficam só em cada aparelho e não vão para o backup.</p>
      ${semPerfil ? '<p class="text-2"><b>Aparelho novo?</b> Conecte aqui antes de criar um perfil: os seus dados chegam da nuvem.</p>' : '<p class="help">Ao conectar um aparelho pela primeira vez, a cópia da nuvem prevalece para registros que existem nos dois lados; o que só existe neste aparelho é somado.</p>'}
      <div class="form-grid">
        <label class="field"><span class="lbl">Nome deste aparelho</span><input type="text" id="syDisp" value="${esc(dispositivo())}"></label>
        <label class="field"><span class="lbl">Token do GitHub ${ls.get(K.token) ? '<span class="badge ok">configurado</span>' : ''}</span><input type="password" id="syTok" autocomplete="off" placeholder="${ls.get(K.token) ? '•••••••• (em branco mantém)' : 'github_pat_… ou ghp_…'}"></label>
        <label class="field"><span class="lbl">Senha de criptografia ${ls.get(K.senha) ? '<span class="badge ok">configurada</span>' : ''}</span>${campoSenha('sySenha', ls.get(K.senha) ? '•••••••• (em branco mantém)' : 'a mesma em todos os aparelhos')}</label>
        <label class="field"><span class="lbl">Confirme a senha</span>${campoSenha('sySenha2', 'digite de novo')}</label>
      </div>
      <label class="check"><input type="checkbox" data-act="syVer" data-on="change"> Mostrar senha</label>
      <div class="help mb">Não aceite senha sugerida pelo navegador: digite a sua (mínimo 8 caracteres). Sem essa senha ninguém lê os dados, nem você. Se esquecer, use “Recomeçar com esta senha” para criar a cópia de novo a partir de um aparelho.</div>
      ${on && erroSenha ? `<div class="card soft mb" style="border:1px solid var(--danger)"><b>⚠ A senha deste aparelho não abre os dados salvos no GitHub.</b><p class="text-2 mt-s">Se você não lembra a senha usada antes, recomece: a cópia no GitHub será substituída pelos dados <b>deste aparelho</b>, criptografados com a senha configurada aqui. Faça isso no aparelho com os dados mais completos e depois use a mesma senha nos outros.</p><button class="btn sm danger" data-act="syRecomecar">Recomeçar com esta senha</button></div>` : ''}
      <div class="row"><button class="btn primary" data-act="sySalvar">${on ? 'Salvar e sincronizar' : semPerfil ? 'Conectar e baixar meus dados' : 'Ativar sincronização'}</button>${on ? '<button class="btn" data-act="syAgora">⟳ Sincronizar agora</button><button class="btn danger" data-act="syOff">Desativar neste aparelho</button>' : ''}</div>
      </div>
      <details class="lib mt"><summary>Como criar o token do GitHub</summary><div class="body"><ol style="padding-left:18px;margin:0">
        <li>No GitHub, abra <b>Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token</b>.</li>
        <li>Dê um nome (ex.: “FitLab”) e uma validade (até 1 ano).</li>
        <li>Em <b>Permissions → Account permissions</b>, ache <b>Gists</b> e escolha <b>Read and write</b>. Não precisa de mais nada.</li>
        <li>Gere, copie o token e cole aqui. Faça o mesmo (com o mesmo token) nos outros aparelhos.</li>
        <li>Alternativa: token <i>classic</i> marcando só o escopo <b>gist</b>.</li>
        <li>O mesmo token do Laboratório de Cafeteria funciona aqui: cada app usa o seu próprio arquivo.</li></ol></div></details>
      <details class="lib"><summary>Como funciona a mescla</summary><div class="body"><p>A sincronização roda ao abrir o app, alguns segundos depois de cada alteração, ao voltar para o app e ao reconectar à internet. O ícone ☁ no topo mostra o estado e sincroniza na hora.</p><p>Cada registro (perfil, avaliação, dieta, programa, sessão, dia do diário…) é comparado separadamente: novidades dos dois lados somam, a edição mais recente vence e exclusões não voltam. O mesmo perfil, a mesma dieta ou programa da planilha e o mesmo dia do diário criados em aparelhos diferentes são unificados. O tema claro/escuro fica em cada aparelho.</p></div></details>`;
  });

  window.FitSync = { sincronizar, cifrar, decifrar, mesclar, unificar, hash, ativo };
})();
