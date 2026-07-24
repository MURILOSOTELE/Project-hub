import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USUARIOS_SEED, PROJETOS_SEED } from '../data/mockData';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  USUARIOS: '@conecta:usuarios',
  PROJETOS: '@conecta:projetos',
  SESSAO: '@conecta:sessao',
  CHATS: '@conecta:chats',
};

// Credenciais do EmailJS (dashboard.emailjs.com) — usadas pra mandar
// o código de verificação de e-mail de verdade. A Public Key é
// segura de deixar no app (é feita pra isso), só a Private Key que
// NUNCA deve entrar aqui.
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_kkh4mpd',
  TEMPLATE_ID: 'template_2wujhhb',
  PUBLIC_KEY: 'IYdcJZVSo17GpmkT4',
};

export function AppProvider({ children }) {
  const [usuarios, setUsuarios] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [chats, setChats] = useState({});
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [carregando, setCarregando] = useState(true);
  // Guarda o código de verificação enquanto o usuário está no meio da
  // troca de e-mail. Fica só em memória (não precisa persistir).
  const [verificacaoEmail, setVerificacaoEmail] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        //USO TEMPORÁRIO APENAS SE NÃO ESTIVER FUNCIONANDO
        /* await AsyncStorage.clear(); */ // APAGA TODOS OS DADOS SALVOS

        const [u, p, s, c] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USUARIOS),
          AsyncStorage.getItem(STORAGE_KEYS.PROJETOS),
          AsyncStorage.getItem(STORAGE_KEYS.SESSAO),
          AsyncStorage.getItem(STORAGE_KEYS.CHATS),
        ]);

        const usuariosIniciais = u ? JSON.parse(u) : USUARIOS_SEED;
        const projetosIniciais = p ? JSON.parse(p) : PROJETOS_SEED;

        setUsuarios(usuariosIniciais);
        setProjetos(projetosIniciais);

        setChats(c ? JSON.parse(c) : {});
        if (s) setUsuarioAtual(JSON.parse(s));

        if (!u)
          await AsyncStorage.setItem(
            STORAGE_KEYS.USUARIOS,
            JSON.stringify(usuariosIniciais)
          );
        if (!p)
          await AsyncStorage.setItem(
            STORAGE_KEYS.PROJETOS,
            JSON.stringify(projetosIniciais)
          );
      } catch (e) {
        console.warn('Erro ao carregar dados', e);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const persistUsuarios = useCallback(async (novaLista) => {
    setUsuarios(novaLista);
    await AsyncStorage.setItem(
      STORAGE_KEYS.USUARIOS,
      JSON.stringify(novaLista)
    );
  }, []);

  const persistProjetos = useCallback(async (novaLista) => {
    setProjetos(novaLista);
    await AsyncStorage.setItem(
      STORAGE_KEYS.PROJETOS,
      JSON.stringify(novaLista)
    );
  }, []);

  const persistChats = useCallback(async (novoChats) => {
    setChats(novoChats);
    await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(novoChats));
  }, []);

  // ---------- AUTENTICAÇÃO ----------
  const login = useCallback(
    async (email, senha) => {
      const encontrado = usuarios.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
      );
      if (!encontrado) {
        return { sucesso: false, erro: 'E-mail ou senha inválidos.' };
      }
      setUsuarioAtual(encontrado);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSAO,
        JSON.stringify(encontrado)
      );
      return { sucesso: true };
    },
    [usuarios]
  );

  const cadastrar = useCallback(
    async (dados) => {
      const jaExiste = usuarios.some(
        (u) => u.email.toLowerCase() === dados.email.toLowerCase()
      );
      if (jaExiste) {
        return { sucesso: false, erro: 'Já existe uma conta com esse e-mail.' };
      }

      const novoUsuario = {
        id: 'u' + Date.now(),
        avatar: null,
        bio: '',
        salvos: [],
        verificado: false,
        ...dados,
      };

      const novaLista = [...usuarios, novoUsuario];
      await persistUsuarios(novaLista);

      setUsuarioAtual(novoUsuario);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSAO,
        JSON.stringify(novoUsuario)
      );

      return { sucesso: true };
    },
    [usuarios, persistUsuarios]
  );

  const logout = useCallback(async () => {
    setUsuarioAtual(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSAO);
  }, []);

  // ---------- PROJETOS ----------

  // Verifica se o usuário pode postar um novo projeto do tipo informado
  const podePublicar = useCallback(
    (tipo) => {
      if (!usuarioAtual) return false;

      const umDiaEmMs = 24 * 60 * 60 * 1000;
      const agora = Date.now();

      const ultimoDoTipo = projetos
        .filter((p) => p.autorId === usuarioAtual.id && p.tipo === tipo)
        .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

      if (!ultimoDoTipo) return true;

      const dataUltimo = new Date(ultimoDoTipo.data).getTime();
      return agora - dataUltimo >= umDiaEmMs;
    },
    [usuarioAtual, projetos]
  );

  const publicarProjeto = useCallback(
    async (dadosProjeto) => {
      if (!usuarioAtual)
        return { sucesso: false, erro: 'Você precisa estar logado.' };

      if (!podePublicar(dadosProjeto.tipo)) {
        return {
          sucesso: false,
          erro: 'Você só pode publicar um projeto desse tipo por dia.',
        };
      }

      const novoProjeto = {
        id: 'p' + Date.now(),
        autorId: usuarioAtual.id,
        data: new Date().toISOString(),
        interessados: [],
        ...dadosProjeto,
      };

      const novaLista = [...projetos, novoProjeto];
      await persistProjetos(novaLista);

      return { sucesso: true, projeto: novoProjeto };
    },
    [usuarioAtual, projetos, podePublicar, persistProjetos]
  );

  const editarProjeto = useCallback(
    async (projetoId, dadosNovos) => {
      if (!usuarioAtual)
        return { sucesso: false, erro: 'Você precisa estar logado.' };

      const projeto = projetos.find((p) => p.id === projetoId);
      if (!projeto) return { sucesso: false, erro: 'Projeto não encontrado.' };
      if (projeto.autorId !== usuarioAtual.id) {
        return {
          sucesso: false,
          erro: 'Você não tem permissão para editar esse projeto.',
        };
      }

      const novaLista = projetos.map((p) =>
        p.id === projetoId ? { ...p, ...dadosNovos } : p
      );

      await persistProjetos(novaLista);
      return { sucesso: true };
    },
    [usuarioAtual, projetos, persistProjetos]
  );

  const demonstrarInteresse = useCallback(
    async (projetoId) => {
      if (!usuarioAtual) return;

      const novaLista = projetos.map((proj) => {
        if (proj.id !== projetoId) return proj;
        const jaTemInteresse = proj.interessados.includes(usuarioAtual.id);
        const novosInteressados = jaTemInteresse
          ? proj.interessados.filter((id) => id !== usuarioAtual.id)
          : [...proj.interessados, usuarioAtual.id];
        return { ...proj, interessados: novosInteressados };
      });

      await persistProjetos(novaLista);
    },
    [usuarioAtual, projetos, persistProjetos]
  );

  const salvarProjeto = useCallback(
    async (projetoId) => {
      if (!usuarioAtual) return;

      const jaSalvo = usuarioAtual.salvos.includes(projetoId);
      const novosSalvos = jaSalvo
        ? usuarioAtual.salvos.filter((id) => id !== projetoId)
        : [...usuarioAtual.salvos, projetoId];

      const usuarioAtualizado = { ...usuarioAtual, salvos: novosSalvos };

      const novaListaUsuarios = usuarios.map((u) =>
        u.id === usuarioAtual.id ? usuarioAtualizado : u
      );

      await persistUsuarios(novaListaUsuarios);
      setUsuarioAtual(usuarioAtualizado);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSAO,
        JSON.stringify(usuarioAtualizado)
      );
    },
    [usuarioAtual, usuarios, persistUsuarios]
  );

  // ---------- CHAT ----------
  const gerarChaveChat = (projetoId, idA, idB) => {
    const [menor, maior] = [idA, idB].sort();
    return `${projetoId}__${menor}-${maior}`;
  };

  const getMensagens = useCallback(
    (projetoId, outroUsuarioId) => {
      if (!usuarioAtual) return [];
      const chave = gerarChaveChat(projetoId, usuarioAtual.id, outroUsuarioId);
      return chats[chave] || [];
    },
    [usuarioAtual, chats]
  );

  const enviarMensagem = useCallback(
    async (projetoId, outroUsuarioId, texto) => {
      if (!usuarioAtual || !texto.trim()) return;

      const chave = gerarChaveChat(projetoId, usuarioAtual.id, outroUsuarioId);
      const mensagensAtuais = chats[chave] || [];

      const novaMensagem = {
        de: usuarioAtual.id,
        texto: texto.trim(),
        hora: new Date().toISOString(),
      };

      const novosChats = {
        ...chats,
        [chave]: [...mensagensAtuais, novaMensagem],
      };
      await persistChats(novosChats);
    },
    [usuarioAtual, chats, persistChats]
  );

  const listarMinhasConversas = useCallback(() => {
    if (!usuarioAtual) return [];

    return Object.keys(chats)
      .filter((chave) => chave.includes(usuarioAtual.id))
      .map((chave) => {
        const [projetoId, par] = chave.split('__');
        const [id1, id2] = par.split('-');
        const outroUsuarioId = id1 === usuarioAtual.id ? id2 : id1;
        const mensagens = chats[chave];
        return {
          chave,
          projetoId,
          outroUsuarioId,
          ultimaMensagem: mensagens[mensagens.length - 1],
        };
      })
      .sort(
        (a, b) =>
          new Date(b.ultimaMensagem.hora) - new Date(a.ultimaMensagem.hora)
      );
  }, [usuarioAtual, chats]);

  // ---------- PERFIL ----------
  const editarPerfil = useCallback(
    async (dadosNovos) => {
      if (!usuarioAtual)
        return { sucesso: false, erro: 'Você precisa estar logado.' };

      if (dadosNovos.email) {
        const emailEmUso = usuarios.some(
          (u) =>
            u.id !== usuarioAtual.id &&
            u.email.toLowerCase() === dadosNovos.email.toLowerCase()
        );
        if (emailEmUso) {
          return {
            sucesso: false,
            erro: 'Esse e-mail já está em uso por outra conta.',
          };
        }
      }

      const usuarioAtualizado = { ...usuarioAtual, ...dadosNovos };

      const novaListaUsuarios = usuarios.map((u) =>
        u.id === usuarioAtual.id ? usuarioAtualizado : u
      );

      await persistUsuarios(novaListaUsuarios);
      setUsuarioAtual(usuarioAtualizado);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSAO,
        JSON.stringify(usuarioAtualizado)
      );

      return { sucesso: true };
    },
    [usuarioAtual, usuarios, persistUsuarios]
  );

  const getUsuarioPorId = useCallback(
    (id) => {
      return usuarios.find((u) => u.id === id) || null;
    },
    [usuarios]
  );

  // ---------- TROCA DE E-MAIL COM CÓDIGO ----------
  // Fluxo em 2 passos: 1) pede um código pro novo e-mail, 2) confirma
  // o código para então efetivar a troca. Como este projeto não tem
  // um servidor de e-mail de verdade, o código é "entregue" na própria
  // tela (simulando o SMS/e-mail) — numa versão em produção ele seria
  // enviado por um serviço de e-mail e nunca voltaria pro app.
  const solicitarCodigoEmail = useCallback(
    async (novoEmail) => {
      if (!usuarioAtual)
        return { sucesso: false, erro: 'Você precisa estar logado.' };

      const emailFormatado = novoEmail.trim().toLowerCase();
      if (!emailFormatado)
        return { sucesso: false, erro: 'Digite o novo e-mail.' };
      if (emailFormatado === usuarioAtual.email.toLowerCase()) {
        return { sucesso: false, erro: 'Esse já é o seu e-mail atual.' };
      }
      const emailEmUso = usuarios.some(
        (u) =>
          u.id !== usuarioAtual.id && u.email.toLowerCase() === emailFormatado
      );
      if (emailEmUso)
        return {
          sucesso: false,
          erro: 'Esse e-mail já está em uso por outra conta.',
        };

      const codigo = String(Math.floor(100000 + Math.random() * 900000));
      setVerificacaoEmail({ novoEmail: emailFormatado, codigo });

      try {
        const resposta = await fetch(
          'https://api.emailjs.com/api/v1.0/email/send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: EMAILJS_CONFIG.SERVICE_ID,
              template_id: EMAILJS_CONFIG.TEMPLATE_ID,
              user_id: EMAILJS_CONFIG.PUBLIC_KEY,
              template_params: {
                to_email: emailFormatado,
                email_destino: emailFormatado,
                codigo,
              },
            }),
          }
        );

        if (!resposta.ok) {
          // a API do EmailJS recusou o envio (ex: variável do template
          // não bate) — devolve o código junto pra tela mostrar como
          // plano B, sem travar o teste/apresentação. Também devolve
          // o motivo real (status + texto) só pra fins de debug.
          const textoErro = await resposta.text().catch(() => '');
          return {
            sucesso: true,
            codigo,
            emailReal: false,
            debug: `HTTP ${resposta.status}: ${textoErro}`,
          };
        }

        return { sucesso: true, emailReal: true };
      } catch (erro) {
        // sem internet ou API fora do ar — mesmo plano B de cima.
        return {
          sucesso: true,
          codigo,
          emailReal: false,
          debug: `Falha de rede: ${erro?.message || erro}`,
        };
      }
    },
    [usuarioAtual, usuarios]
  );

  const confirmarCodigoEmail = useCallback(
    async (codigoDigitado) => {
      if (!verificacaoEmail)
        return { sucesso: false, erro: 'Solicite um novo código primeiro.' };
      if (codigoDigitado.trim() !== verificacaoEmail.codigo) {
        return {
          sucesso: false,
          erro: 'Código incorreto. Confira e tente de novo.',
        };
      }

      const resultado = await editarPerfil({
        email: verificacaoEmail.novoEmail,
      });
      if (resultado.sucesso) setVerificacaoEmail(null);
      return resultado;
    },
    [verificacaoEmail, editarPerfil]
  );

  const cancelarVerificacaoEmail = useCallback(() => {
    setVerificacaoEmail(null);
  }, []);

  // ---------- NOTIFICAÇÕES ----------
  // Não temos um servidor de notificações push — então elas são
  // "derivadas" na hora, a partir dos dados que já existem: quem
  // demonstrou interesse ou salvou os MEUS projetos, e conversas com
  // mensagens que não foram enviadas por mim.
  const getNotificacoes = useCallback(() => {
    if (!usuarioAtual) return [];
    const notificacoes = [];

    projetos
      .filter((p) => p.autorId === usuarioAtual.id)
      .forEach((projeto) => {
        projeto.interessados.forEach((idInteressado) => {
          if (idInteressado === usuarioAtual.id) return;
          const pessoa = getUsuarioPorId(idInteressado);
          notificacoes.push({
            id: `interesse-${projeto.id}-${idInteressado}`,
            tipo: 'interesse',
            texto: `${
              pessoa?.nome || 'Alguém'
            } demonstrou interesse no seu projeto "${projeto.titulo}"`,
          });
        });
      });

    usuarios.forEach((outro) => {
      if (outro.id === usuarioAtual.id) return;
      (outro.salvos || []).forEach((projetoId) => {
        const projeto = projetos.find(
          (p) => p.id === projetoId && p.autorId === usuarioAtual.id
        );
        if (projeto) {
          notificacoes.push({
            id: `salvo-${projeto.id}-${outro.id}`,
            tipo: 'salvo',
            texto: `${outro.nome} salvou seu projeto "${projeto.titulo}"`,
          });
        }
      });
    });

    listarMinhasConversas().forEach((conversa) => {
      if (conversa.ultimaMensagem.de === usuarioAtual.id) return;
      const outroUsuario = getUsuarioPorId(conversa.outroUsuarioId);
      notificacoes.push({
        id: `chat-${conversa.chave}`,
        tipo: 'chat',
        texto: `Nova mensagem de ${
          outroUsuario?.nome || 'alguém'
        } para conversar`,
      });
    });

    return notificacoes;
  }, [
    usuarioAtual,
    usuarios,
    projetos,
    listarMinhasConversas,
    getUsuarioPorId,
  ]);

  return (
    <AppContext.Provider
      value={{
        podePublicar,
        editarProjeto,
        usuarios,
        projetos,
        chats,
        usuarioAtual,
        carregando,
        login,
        cadastrar,
        logout,
        publicarProjeto,
        demonstrarInteresse,
        salvarProjeto,
        getMensagens,
        enviarMensagem,
        listarMinhasConversas,
        editarPerfil,
        getUsuarioPorId,
        solicitarCodigoEmail,
        confirmarCodigoEmail,
        cancelarVerificacaoEmail,
        verificacaoEmail,
        getNotificacoes,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp precisa ser usado dentro de um <AppProvider>');
  }
  return context;
}