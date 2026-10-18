'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { PixelButton } from '../../components/PixelButton';
import { Sparkles, KeyRound, UserCheck, AlertCircle } from 'lucide-react';
import { sounds } from '../../lib/sound-effects';

export default function LoginPage() {
  const router = useRouter();
  const { loginStudent, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const res = await loginStudent(email, password);
    if (res.success) {
      sounds.playSuccess();
      router.push('/jogos');
    } else {
      sounds.playGentleBoop();
      setErrorMsg(res.error || 'Não foi possível entrar. Verifique os dados!');
      setLoading(false);
    }
  };

  const handleDemoLogin = (grade: 3 | 4) => {
    sounds.playLevelUp();
    loginAsDemo(`Herói do ${grade}º Ano`, grade);
    router.push('/jogos');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="pixel-box bg-slate-900/95 p-6 sm:p-8 border-indigo-500">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center text-amber-300 border-2 border-amber-400 mb-3 shadow-md">
            <KeyRound size={24} />
          </div>
          <h1 className="font-pixel text-lg sm:text-xl text-white mb-1">
            ENTRAR NO KIDS-PLAYER
          </h1>
          <p className="text-xs text-slate-300">
            Digite os dados da sua conta para continuar sua jornada
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              E-mail do Responsável
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Senha de Acesso
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha secreta"
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-500 rounded-lg text-rose-300 text-xs flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <PixelButton
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR NO GAME 🚀'}
          </PixelButton>
        </form>

        {/* Divisor */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Ou Modo de Teste Rápido
          </span>
        </div>

        {/* Acesso Demo Instantâneo */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleDemoLogin(3)}
            className="w-full py-2.5 px-3 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/50 rounded-xl text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 transition-colors"
          >
            <UserCheck size={16} />
            Entrar como Aluno do 3º Ano (Demo)
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin(4)}
            className="w-full py-2.5 px-3 bg-pink-900/40 hover:bg-pink-800/60 border border-pink-500/50 rounded-xl text-xs font-bold text-pink-300 flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles size={16} />
            Entrar como Aluno do 4º Ano (Demo)
          </button>
        </div>

        <div className="text-center mt-6 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Ainda não tem conta?{' '}
            <Link href="/cadastro" className="text-amber-400 font-bold hover:underline">
              Cadastre-se grátis aqui!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
