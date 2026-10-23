'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { AVATAR_PRESETS, PET_CATALOG } from '../../lib/content-data';
import { validateNickname } from '../../lib/nickname-moderator';
import { PixelButton } from '../../components/PixelButton';
import { PetIcon } from '../../components/PetIcon';
import { SchoolGrade } from '../../lib/types';
import { ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../lib/sound-effects';

export default function CadastroPage() {
  const router = useRouter();
  const { signUpStudent } = useAuth();

  // Dados do Responsável
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPassword, setGuardianPassword] = useState('');
  const [guardianTermsAccepted, setGuardianTermsAccepted] = useState(false);

  // Dados do Aluno
  const [nickname, setNickname] = useState('');
  const [grade, setGrade] = useState<SchoolGrade>(3);
  const [selectedAvatar, setSelectedAvatar] = useState('astro_kid');
  const [selectedPet, setSelectedPet] = useState('pipoca_raposa');

  // Modo Foco (Apoio à Atenção / TDAH - Opcional)
  const [focusModeConsent, setFocusModeConsent] = useState(false);

  // Estados de submissão
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validação dinâmica do Nickname
  const nicknameValidation = validateNickname(nickname);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!guardianTermsAccepted) {
      setErrorMsg('O responsável legal precisa autorizar o cadastro para a segurança do aluno.');
      sounds.playGentleBoop();
      return;
    }

    if (!nicknameValidation.isValid) {
      setErrorMsg(nicknameValidation.message || 'Verifique o apelido escolhido.');
      sounds.playGentleBoop();
      return;
    }

    setIsSubmitting(true);

    const result = await signUpStudent({
      guardianName,
      guardianEmail,
      password: guardianPassword,
      nickname,
      grade,
      avatarPreset: selectedAvatar,
      selectedPetId: selectedPet,
      focusModeConsent,
    });

    if (result.success) {
      sounds.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      router.push('/jogos');
    } else {
      setErrorMsg(result.error || 'Não foi possível concluir o cadastro.');
      sounds.playGentleBoop();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-bold mb-3">
          <Sparkles size={14} className="text-pink-400" />
          <span>Portal do Herói • Novo Jogador</span>
        </div>
        <h1 className="font-pixel text-xl sm:text-3xl text-white mb-2">
          CRIE SEU CADASTRO
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm">
          Um ambiente seguro, sem anúncios e com foco no reforço escolar do 3º e 4º ano.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ============================================================== */}
        {/* SEÇÃO 1: RESPONSÁVEL LEGAL (LGPD & ECA DIGITAL) */}
        {/* ============================================================== */}
        <div className="pixel-box bg-slate-900/90 p-5 sm:p-6 border-indigo-500">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <ShieldCheck className="text-indigo-400 w-5 h-5" />
            <h2 className="font-pixel text-xs sm:text-sm text-indigo-300">
              1. AUTORIZAÇÃO DO RESPONSÁVEL LEGAL
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nome completo do Responsável *
              </label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={e => setGuardianName(e.target.value)}
                placeholder="Ex: Maria dos Santos"
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                E-mail do Responsável *
              </label>
              <input
                type="email"
                required
                value={guardianEmail}
                onChange={e => setGuardianEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Senha de acesso seguro (opcional se modo teste)
            </label>
            <input
              type="password"
              value={guardianPassword}
              onChange={e => setGuardianPassword(e.target.value)}
              placeholder="Pelo menos 6 dígitos"
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Consentimento Legal LGPD */}
          <label className="flex items-start gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={guardianTermsAccepted}
              onChange={e => setGuardianTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-300 leading-relaxed">
              Declaro que sou o responsável legal pela criança e autorizo a criação da conta no Kids-Player para fins educativos de reforço escolar, com coleta mínima de dados e total proteção da privacidade (LGPD).
            </span>
          </label>
        </div>

        {/* ============================================================== */}
        {/* SEÇÃO 2: DADOS DO ALUNO E APELIDO MODERADO */}
        {/* ============================================================== */}
        <div className="pixel-box bg-slate-900/90 p-5 sm:p-6 border-amber-500">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <Sparkles className="text-amber-400 w-5 h-5" />
            <h2 className="font-pixel text-xs sm:text-sm text-amber-300">
              2. PERSONAGEM DO ALUNO
            </h2>
          </div>

          {/* Nickname com verificação ativa */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-300">
                Apelido de Herói no Jogo (Nickname) *
              </label>
              {nickname && (
                <span className={`text-[11px] font-bold flex items-center gap-1 ${nicknameValidation.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {nicknameValidation.isValid ? (
                    <>
                      <CheckCircle2 size={13} />
                      Apelido Seguro!
                    </>
                  ) : (
                    <>
                      <AlertCircle size={13} />
                      {nicknameValidation.message}
                    </>
                  )}
                </span>
              )}
            </div>

            <input
              type="text"
              required
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Ex: AstroGamer, Estrela99, SuperMega"
              maxLength={20}
              className={`w-full bg-slate-800 border-2 rounded-lg px-3 py-2.5 text-sm text-white font-bold focus:outline-none ${
                nickname && !nicknameValidation.isValid
                  ? 'border-rose-500 focus:border-rose-400'
                  : 'border-slate-700 focus:border-amber-400'
              }`}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dica amigável: use nomes inventados de games. Não use sobrenome real ou telefone.
            </p>
          </div>

          {/* Seleção do Ano Escolar */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Ano Escolar do Aluno:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setGrade(3);
                }}
                className={`py-3 px-4 rounded-xl border-3 font-pixel text-xs transition-all ${
                  grade === 3
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_4px_0_#0284c7]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                🎒 3º ANO DO FUNDAMENTAL
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setGrade(4);
                }}
                className={`py-3 px-4 rounded-xl border-3 font-pixel text-xs transition-all ${
                  grade === 4
                    ? 'bg-pink-500 text-white border-pink-300 shadow-[0_4px_0_#be185d]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                🚀 4º ANO DO FUNDAMENTAL
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setGrade(5);
                }}
                className={`py-3 px-4 rounded-xl border-3 font-pixel text-xs transition-all ${
                  grade === 5
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_4px_0_#b45309]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                ⭐ 5º ANO DO FUNDAMENTAL
              </button>
            </div>
          </div>

          {/* Escolha do Avatar Pré-definido */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Escolha seu Avatar de Herói:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {AVATAR_PRESETS.map(av => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedAvatar(av.id);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center border-2 transition-all ${
                    selectedAvatar === av.id
                      ? 'bg-amber-500/20 border-amber-400 scale-105 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl mb-1">{av.icon_name}</span>
                  <span className="text-[10px] text-slate-300 font-bold truncate max-w-full">
                    {av.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Escolha do PET Inicial */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Escolha seu PET Inicial (Amigo de Aventuras):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PET_CATALOG.slice(0, 4).map(pet => (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedPet(pet.id);
                  }}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center transition-all ${
                    selectedPet === pet.id
                      ? 'bg-amber-400/20 border-amber-400 shadow-md scale-102'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <PetIcon petId={pet.id} size={48} mood={selectedPet === pet.id ? 'happy' : 'idle'} />
                  <span className="font-pixel text-[11px] text-white mt-1">{pet.name}</span>
                  <span className="text-[10px] text-slate-400">{pet.species}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SEÇÃO 3: MODO FOCO (APOIO À ATENÇÃO - LGPD DADO SENSÍVEL) */}
        {/* ============================================================== */}
        <div className="pixel-box bg-slate-900/90 p-5 sm:p-6 border-emerald-500">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
            <Heart className="text-emerald-400 w-5 h-5" />
            <h2 className="font-pixel text-xs sm:text-sm text-emerald-300">
              3. MODO FOCO — APOIO PARA ATENÇÃO (OPCIONAL)
            </h2>
          </div>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Uma jornada adaptada para alunos com dificuldade de atenção ou TDAH. 
            Não exige laudo nem diagnóstico: é um recurso de acessibilidade pedagógica para quem se beneficia de um ritmo mais calmo.
          </p>

          <label className="flex items-start gap-3 p-3.5 bg-emerald-950/40 rounded-xl border-2 border-emerald-500/50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={focusModeConsent}
              onChange={e => {
                sounds.playClick();
                setFocusModeConsent(e.target.checked);
              }}
              className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="text-xs text-slate-200">
              <span className="font-bold text-emerald-300 block mb-1">
                Ativar o Modo Foco para este aluno
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                <li>Microsessões de 3 a 5 minutos com pausas guiadas pelo PET.</li>
                <li>Uma tarefa por tela com botões grandes e sem elementos competindo pela atenção.</li>
                <li>Menos estímulos e sem contagem regressiva punitiva.</li>
                <li>Leitura em voz alta ativada por padrão e reforço positivo frequente.</li>
              </ul>
            </div>
          </label>
        </div>

        {/* Mensagem de Erro se houver */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border-2 border-rose-500 rounded-xl text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Botão de Finalizar */}
        <div className="text-center pt-2">
          <PixelButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[280px]"
          >
            {isSubmitting ? 'CRIANDO HEROI...' : 'COMEÇAR A JOGAR! 🚀'}
          </PixelButton>
        </div>
      </form>
    </div>
  );
}
