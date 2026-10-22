// Termos de Uso e Privacidade do Kids-Player (LGPD v2 / ECA Digital)
// A versão é registrada no cadastro do responsável (guardians.accepted_terms_version)
// e a re-aceitação é solicitada no painel da família quando uma nova versão entra no ar.

export const TERMS_VERSION = 2;
export const TERMS_UPDATED_AT = '22/10/2026';

export interface TermsSection {
  title: string;
  text: string;
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: '1. Dados que coletamos (o mínimo possível)',
    text: 'Coletamos apenas o e-mail e o nome do responsável legal, o apelido de fantasia da criança (moderado, sem sobrenomes), a série escolar e o progresso nos jogos. Nunca pedimos telefone no cadastro infantil nem dados sensíveis.',
  },
  {
    title: '2. Modo Foco é dado de saúde protegido',
    text: 'As configurações e sessões do Modo Foco (apoio pedagógico para atenção) são visíveis apenas para o próprio aluno e o seu responsável — garantido por Row Level Security no banco de dados, bloqueando qualquer outra conta.',
  },
  {
    title: '3. Zero publicidade e zero dinheiro real',
    text: 'Nenhum anúncio, rastreador comercial ou microtransação. As moedas do jogo são obtidas exclusivamente jogando e estudando, e as chances de todos os baús surpresa são públicas e permanentes.',
  },
  {
    title: '4. Sem chat aberto entre crianças',
    text: 'A plataforma não possui conversas diretas entre menores. As únicas intertações sociais são rankings por apelido moderado e visitas somente-leitura à vila dos pets, sem troca de mensagens.',
  },
  {
    title: '5. Seus direitos (LGPD e ECA Digital)',
    text: 'O responsável pode exportar todos os dados da família em formato JSON a qualquer momento no painel, e solicitar a exclusão definitiva da conta por e-mail, com apagação em cascata de perfis, progresso e moedas.',
  },
];
