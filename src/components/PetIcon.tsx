import React from 'react';

interface PetIconProps {
  petId: string;
  size?: number;
  mood?: 'idle' | 'happy' | 'sad';
  accessoryId?: string | null;
  className?: string;
}

export function PetIcon({ petId, size = 64, mood = 'idle', accessoryId, className = '' }: PetIconProps) {
  // Renderizadores SVG pixel art puros, leves e originais
  const renderSvgContent = () => {
    switch (petId) {
      case 'pipoca_raposa':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Orelhas da Raposinha */}
            <rect x="4" y="4" width="6" height="8" fill="#e67e22" />
            <rect x="6" y="6" width="3" height="4" fill="#2c3e50" />
            <rect x="22" y="4" width="6" height="8" fill="#e67e22" />
            <rect x="23" y="6" width="3" height="4" fill="#2c3e50" />
            
            {/* Cabeça */}
            <rect x="4" y="10" width="24" height="16" fill="#e67e22" rx="2" />
            
            {/* Bochechas brancas fofas */}
            <rect x="4" y="18" width="7" height="8" fill="#f5f6fa" />
            <rect x="21" y="18" width="7" height="8" fill="#f5f6fa" />
            <rect x="11" y="22" width="10" height="4" fill="#f5f6fa" />
            
            {/* Olhos */}
            {mood === 'happy' ? (
              <>
                <path d="M8 17 Q10 14 12 17" stroke="#2c3e50" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M20 17 Q22 14 24 17" stroke="#2c3e50" strokeWidth="2" fill="none" strokeLinecap="round" />
              </>
            ) : mood === 'sad' ? (
              <>
                <rect x="8" y="16" width="4" height="4" fill="#2c3e50" />
                <rect x="20" y="16" width="4" height="4" fill="#2c3e50" />
                <rect x="8" y="21" width="3" height="4" fill="#54a0ff" />
              </>
            ) : (
              <>
                <rect x="8" y="15" width="4" height="4" fill="#2c3e50" />
                <rect x="20" y="15" width="4" height="4" fill="#2c3e50" />
                <rect x="9" y="15" width="2" height="2" fill="#ffffff" />
                <rect x="21" y="15" width="2" height="2" fill="#ffffff" />
              </>
            )}

            {/* Focinho e Boca */}
            <rect x="14" y="19" width="4" height="3" fill="#2c3e50" rx="1" />
            <rect x="15" y="23" width="2" height="1" fill="#c0392b" />

            {/* ACESSÓRIOS SOBREPOSTOS */}
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'bolha_slime':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Corpo Gelatinoso */}
            <rect x="6" y="10" width="20" height="16" fill="#2ed573" rx="4" />
            <rect x="4" y="14" width="24" height="10" fill="#2ed573" rx="3" />
            <rect x="8" y="8" width="6" height="4" fill="#7bed9f" rx="1" />
            <rect x="8" y="12" width="3" height="3" fill="#ffffff" />

            {/* Olhos e Bochechas */}
            {mood === 'happy' ? (
              <>
                <path d="M9 16 Q11 13 13 16" stroke="#0f5132" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M19 16 Q21 13 23 16" stroke="#0f5132" strokeWidth="2" fill="none" strokeLinecap="round" />
                <ellipse cx="16" cy="21" rx="3" ry="2" fill="#0f5132" />
              </>
            ) : mood === 'sad' ? (
              <>
                <rect x="9" y="16" width="3" height="3" fill="#0f5132" />
                <rect x="20" y="16" width="3" height="3" fill="#0f5132" />
                <path d="M14 22 Q16 20 18 22" stroke="#0f5132" strokeWidth="2" fill="none" />
              </>
            ) : (
              <>
                <circle cx="11" cy="17" r="2.5" fill="#0f5132" />
                <circle cx="10.5" cy="16.5" r="1" fill="#ffffff" />
                <circle cx="21" cy="17" r="2.5" fill="#0f5132" />
                <circle cx="20.5" cy="16.5" r="1" fill="#ffffff" />
                <path d="M14 20 Q16 23 18 20" stroke="#0f5132" strokeWidth="2" fill="none" strokeLinecap="round" />
              </>
            )}
            <rect x="6" y="19" width="3" height="2" fill="#ff7675" rx="1" opacity="0.8" />
            <rect x="23" y="19" width="3" height="2" fill="#ff7675" rx="1" opacity="0.8" />

            {renderAccessoryOverlay()}
          </svg>
        );

      case 'corujinha_pixel':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect x="6" y="5" width="4" height="5" fill="#4b6584" />
            <rect x="22" y="5" width="4" height="5" fill="#4b6584" />
            <rect x="6" y="8" width="20" height="18" fill="#778ca3" rx="3" />
            <rect x="10" y="15" width="12" height="10" fill="#d1d8e0" rx="2" />
            <rect x="7" y="11" width="7" height="6" fill="#f5f6fa" stroke="#f39c12" strokeWidth="1.5" />
            <rect x="18" y="11" width="7" height="6" fill="#f5f6fa" stroke="#f39c12" strokeWidth="1.5" />
            <rect x="14" y="13" width="4" height="2" fill="#f39c12" />
            <rect x="9" y="13" width="3" height="3" fill="#2c3e50" />
            <rect x="20" y="13" width="3" height="3" fill="#2c3e50" />
            <polygon points="16,17 14,21 18,21" fill="#e67e22" />

            {renderAccessoryOverlay()}
          </svg>
        );

      case 'raio_dragao':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <polygon points="7,4 10,10 5,9" fill="#f1c40f" />
            <polygon points="25,4 27,9 22,10" fill="#f1c40f" />
            <polygon points="3,13 7,16 4,21" fill="#e84118" />
            <polygon points="29,13 28,21 25,16" fill="#e84118" />
            <rect x="6" y="9" width="20" height="16" fill="#8c7ae6" rx="3" />
            <rect x="9" y="13" width="4" height="4" fill="#f5cd79" />
            <rect x="10" y="13" width="2" height="4" fill="#130f40" />
            <rect x="19" y="13" width="4" height="4" fill="#f5cd79" />
            <rect x="20" y="13" width="2" height="4" fill="#130f40" />
            <rect x="12" y="19" width="8" height="4" fill="#7158e2" rx="1" />
            <circle cx="14" cy="20" r="1" fill="#2f3542" />
            <circle cx="18" cy="20" r="1" fill="#2f3542" />

            {renderAccessoryOverlay()}
          </svg>
        );

      case 'astro_gatinho':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Orelhas de Gato com capacete espacial */}
            <polygon points="6,6 10,2 12,8" fill="#dcdde1" stroke="#718093" strokeWidth="1" />
            <polygon points="26,6 22,2 20,8" fill="#dcdde1" stroke="#718093" strokeWidth="1" />
            {/* Capacete de astronauta */}
            <circle cx="16" cy="16" r="12" fill="#f5f6fa" stroke="#718093" strokeWidth="2" />
            <ellipse cx="16" cy="16" rx="9" ry="7" fill="#2f3640" />
            <ellipse cx="16" cy="16" rx="8" ry="6" fill="#4bcffa" opacity="0.85" />
            {/* Olhos piscando */}
            <circle cx="13" cy="15" r="1.5" fill="#ffffff" />
            <circle cx="19" cy="15" r="1.5" fill="#ffffff" />
            <path d="M14 18 Q16 20 18 18" stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round" />
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'fenix_dourada':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Crista de chamas da fênix */}
            <polygon points="16,2 19,8 24,5 21,11 16,9 11,11 8,5 13,8" fill="#f39c12" />
            <circle cx="16" cy="16" r="11" fill="#f1c40f" />
            <circle cx="16" cy="17" r="9" fill="#e67e22" />
            <circle cx="12" cy="14" r="2" fill="#2c3e50" />
            <circle cx="20" cy="14" r="2" fill="#2c3e50" />
            <circle cx="11.5" cy="13.5" r="0.8" fill="#ffffff" />
            <circle cx="19.5" cy="13.5" r="0.8" fill="#ffffff" />
            <polygon points="16,16 13,19 19,19" fill="#c0392b" />
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'trovao_guepardo':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Orelhas arredondadas */}
            <circle cx="7" cy="7" r="4" fill="#f59e0b" />
            <circle cx="7" cy="7" r="2" fill="#78350f" />
            <circle cx="25" cy="7" r="4" fill="#f59e0b" />
            <circle cx="25" cy="7" r="2" fill="#78350f" />
            {/* Cabeça */}
            <rect x="5" y="9" width="22" height="17" rx="5" fill="#fbbf24" />
            {/* Manchas de guepardo */}
            <circle cx="8" cy="12" r="1.5" fill="#78350f" />
            <circle cx="24" cy="12" r="1.5" fill="#78350f" />
            <circle cx="7" cy="21" r="1.2" fill="#78350f" />
            <circle cx="25" cy="21" r="1.2" fill="#78350f" />
            {/* Raio elétrico na testa */}
            <polygon points="16,7 18,11 15,11 17,15 13,11 15,11" fill="#38bdf8" />
            {/* Olhos azul elétrico */}
            <circle cx="11" cy="16" r="2.5" fill="#0284c7" />
            <circle cx="21" cy="16" r="2.5" fill="#0284c7" />
            <circle cx="10.5" cy="15.5" r="1" fill="#ffffff" />
            <circle cx="20.5" cy="15.5" r="1" fill="#ffffff" />
            {/* Focinho */}
            <polygon points="16,19 14,21 18,21" fill="#78350f" />
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'gota_tartaruga':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Nadadeiras */}
            <ellipse cx="4" cy="16" rx="3" ry="5" fill="#14b8a6" />
            <ellipse cx="28" cy="16" rx="3" ry="5" fill="#14b8a6" />
            {/* Casco redondo */}
            <circle cx="16" cy="16" r="11" fill="#0d9488" stroke="#042f2e" strokeWidth="1.5" />
            <rect x="11" y="11" width="10" height="10" fill="#2dd4bf" rx="2" />
            {/* Cabeça no topo */}
            <circle cx="16" cy="8" r="5" fill="#14b8a6" />
            <circle cx="14" cy="7" r="1.5" fill="#042f2e" />
            <circle cx="18" cy="7" r="1.5" fill="#042f2e" />
            {/* Gota d'água no centro */}
            <path d="M16 13 C14 16 14 18 16 18 C18 18 18 16 16 13 Z" fill="#38bdf8" />
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'lupin_lobo':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Orelhas pontudas de lobo */}
            <polygon points="5,2 9,11 3,9" fill="#64748b" />
            <polygon points="27,2 29,9 23,11" fill="#64748b" />
            <polygon points="6,4 8,9 5,8" fill="#e2e8f0" />
            <polygon points="26,4 27,8 24,9" fill="#e2e8f0" />
            {/* Cabeça do lobo */}
            <rect x="5" y="9" width="22" height="17" rx="4" fill="#94a3b8" />
            <polygon points="16,14 10,24 22,24" fill="#f8fafc" />
            {/* Olhos azuis brilhantes */}
            <circle cx="11" cy="15" r="2" fill="#0284c7" />
            <circle cx="21" cy="15" r="2" fill="#0284c7" />
            <polygon points="16,19 14,22 18,22" fill="#0f172a" />
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'estelar_unicornio':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Chifre dourado espiral */}
            <polygon points="16,1 14,9 18,9" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
            {/* Orelhas */}
            <polygon points="8,6 11,11 6,10" fill="#f5d0fe" />
            <polygon points="24,6 26,10 21,11" fill="#f5d0fe" />
            {/* Cabeça de unicórnio */}
            <rect x="6" y="9" width="20" height="17" rx="5" fill="#fae8ff" />
            {/* Crina cósmica */}
            <rect x="4" y="10" width="3" height="12" fill="#f43f5e" rx="1" />
            <rect x="25" y="10" width="3" height="12" fill="#818cf8" rx="1" />
            {/* Olhos mágicos */}
            <circle cx="11" cy="16" r="2.5" fill="#701a75" />
            <circle cx="21" cy="16" r="2.5" fill="#701a75" />
            <polygon points="11,15 12,16 11,17 10,16" fill="#fde047" />
            <polygon points="21,15 22,16 21,17 20,16" fill="#fde047" />
            <circle cx="16" cy="22" r="1" fill="#f43f5e" />
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'tita_cristal':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Cabeça poligonal de Golem de Cristal */}
            <polygon points="16,4 27,9 27,23 16,28 5,23 5,9" fill="#0f766e" stroke="#14b8a6" strokeWidth="2" />
            <polygon points="16,8 23,12 23,20 16,24 9,20 9,12" fill="#115e59" />
            {/* Olhos de gema brilhante */}
            <rect x="10" y="14" width="4" height="2" fill="#2dd4bf" className="animate-pulse" />
            <rect x="18" y="14" width="4" height="2" fill="#2dd4bf" className="animate-pulse" />
            {/* Runa ancestral na testa */}
            <line x1="16" y1="9" x2="16" y2="13" stroke="#5eead4" strokeWidth="1.5" />
            <line x1="14" y1="11" x2="18" y2="11" stroke="#5eead4" strokeWidth="1.5" />
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'glub_polvo':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Cabeça do Polvo (Domo) */}
            <rect x="7" y="6" width="18" height="15" fill="#06b6d4" rx="7" />
            <rect x="9" y="8" width="14" height="12" fill="#22d3ee" rx="5" />
            {/* Manchinhas brilhantes */}
            <circle cx="11" cy="9" r="1" fill="#ec4899" />
            <circle cx="21" cy="9" r="1.2" fill="#ec4899" />
            <circle cx="16" cy="7" r="1" fill="#facc15" />
            {/* Tentáculos fofos */}
            <circle cx="8" cy="23" r="2.5" fill="#06b6d4" />
            <circle cx="13" cy="24" r="2.5" fill="#0891b2" />
            <circle cx="19" cy="24" r="2.5" fill="#0891b2" />
            <circle cx="24" cy="23" r="2.5" fill="#06b6d4" />
            {/* Olhos expressivos */}
            <circle cx="11" cy="14" r="2.5" fill="#0f172a" />
            <circle cx="11" cy="13.5" r="1" fill="#ffffff" />
            <circle cx="21" cy="14" r="2.5" fill="#0f172a" />
            <circle cx="21" cy="13.5" r="1" fill="#ffffff" />
            {/* Sorriso e bolhas */}
            <path d="M14 18 Q16 20 18 18" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="26" cy="6" r="1.5" fill="#67e8f9" opacity="0.7" />
            <circle cx="28" cy="3" r="1" fill="#67e8f9" opacity="0.6" />
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'atena_coruja':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Tufos de Penas / Orelhinhas */}
            <polygon points="6,6 10,12 5,13" fill="#6366f1" />
            <polygon points="26,6 22,12 27,13" fill="#6366f1" />
            {/* Corpo / Cabeça arredondada */}
            <rect x="5" y="9" width="22" height="19" fill="#4338ca" rx="7" />
            {/* Peito de penas claras */}
            <ellipse cx="16" cy="21" rx="6" ry="6" fill="#e0e7ff" />
            <path d="M14 19 Q16 21 18 19" stroke="#6366f1" strokeWidth="1" />
            <path d="M14 22 Q16 24 18 22" stroke="#6366f1" strokeWidth="1" />
            {/* Olhos grandes e sábios */}
            <circle cx="11" cy="14" r="4.5" fill="#fbbf24" stroke="#1e1b4b" strokeWidth="1" />
            <circle cx="21" cy="14" r="4.5" fill="#fbbf24" stroke="#1e1b4b" strokeWidth="1" />
            <circle cx="11" cy="14" r="2" fill="#0f172a" />
            <circle cx="21" cy="14" r="2" fill="#0f172a" />
            <circle cx="10" cy="13" r="1" fill="#ffffff" />
            <circle cx="20" cy="13" r="1" fill="#ffffff" />
            {/* Bico nobre */}
            <polygon points="16,16 14,19 18,19" fill="#f59e0b" />
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'ignis_dragao':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Chifres de Dragão */}
            <polygon points="7,4 10,11 6,10" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
            <polygon points="25,4 22,11 26,10" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
            {/* Asinhas cósmicas */}
            <polygon points="2,14 7,12 6,20" fill="#dc2626" />
            <polygon points="30,14 25,12 26,20" fill="#dc2626" />
            {/* Cabeça do Dragãozinho */}
            <rect x="6" y="9" width="20" height="17" fill="#ef4444" rx="4" />
            <rect x="9" y="11" width="14" height="14" fill="#f87171" rx="3" />
            {/* Olhos dourados */}
            <circle cx="11" cy="15" r="2.5" fill="#fde047" stroke="#7f1d1d" strokeWidth="0.8" />
            <circle cx="21" cy="15" r="2.5" fill="#fde047" stroke="#7f1d1d" strokeWidth="0.8" />
            <circle cx="11" cy="15" r="1" fill="#1e1b4b" />
            <circle cx="21" cy="15" r="1" fill="#1e1b4b" />
            {/* Narinas e sorriso de fogo */}
            <circle cx="14" cy="21" r="0.8" fill="#7f1d1d" />
            <circle cx="18" cy="21" r="0.8" fill="#7f1d1d" />
            <circle cx="23" cy="21" r="1.5" fill="#fbbf24" opacity="0.9" className="animate-pulse" />
            {renderAccessoryOverlay()}
          </svg>
        );

      case 'flora_preguica':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Pelagem Macia da Preguicinha */}
            <rect x="5" y="8" width="22" height="18" fill="#78350f" rx="6" />
            <rect x="8" y="10" width="16" height="15" fill="#d97706" rx="5" />
            {/* Máscara facial da espécie */}
            <ellipse cx="16" cy="17" rx="7" ry="5.5" fill="#fef3c7" />
            <ellipse cx="11" cy="16" rx="2" ry="3.5" fill="#92400e" opacity="0.8" />
            <ellipse cx="21" cy="16" rx="2" ry="3.5" fill="#92400e" opacity="0.8" />
            {/* Olhos serenos e fechadinhos zen */}
            <path d="M10 16 Q11 18 12 16" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M20 16 Q21 18 22 16" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
            {/* Focinho e sorriso doce */}
            <ellipse cx="16" cy="18" rx="1.8" ry="1.2" fill="#451a03" />
            <path d="M14 20 Q16 21.5 18 20" stroke="#451a03" strokeWidth="1" strokeLinecap="round" />
            {/* Coroinha de Florzinhas da Natureza */}
            <circle cx="12" cy="7" r="2" fill="#ec4899" />
            <circle cx="16" cy="6" r="2" fill="#facc15" />
            <circle cx="20" cy="7" r="2" fill="#a855f7" />
            <circle cx="16" cy="6" r="0.8" fill="#ffffff" />
            {renderAccessoryOverlay()}
          </svg>
        );

      default:
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect x="6" y="6" width="20" height="20" fill="#fbc531" rx="4" />
            <circle cx="11" cy="14" r="2" fill="#2f3542" />
            <circle cx="21" cy="14" r="2" fill="#2f3542" />
            <path d="M13 19 Q16 22 19 19" stroke="#2f3542" strokeWidth="2" fill="none" strokeLinecap="round" />
            {renderAccessoryOverlay()}
          </svg>
        );
    }
  };

  // Renderiza sobreposição do acessório em pixel art
  const renderAccessoryOverlay = () => {
    switch (accessoryId) {
      case 'chapeu_formatura':
        return (
          <g>
            <polygon points="16,2 6,7 16,11 26,7" fill="#1e272e" />
            <polygon points="16,2 6,7 16,11 26,7" stroke="#f1c40f" strokeWidth="0.8" />
            <rect x="12" y="8" width="8" height="4" fill="#1e272e" />
            <line x1="26" y1="7" x2="27" y2="14" stroke="#f1c40f" strokeWidth="1.2" />
            <circle cx="27" cy="14" r="1.5" fill="#f1c40f" />
          </g>
        );

      case 'coroa_ouro_pixel':
        return (
          <g>
            <polygon points="8,4 10,9 16,2 22,9 24,4 26,11 6,11" fill="#f1c40f" stroke="#b7950b" strokeWidth="0.8" />
            <circle cx="16" cy="7" r="1.5" fill="#e74c3c" />
            <circle cx="9" cy="8" r="1" fill="#3498db" />
            <circle cx="23" cy="8" r="1" fill="#2ecc71" />
          </g>
        );

      case 'boina_artista':
        return (
          <g>
            <ellipse cx="14" cy="6" rx="9" ry="4" fill="#e74c3c" stroke="#922b21" strokeWidth="0.8" />
            <rect x="13" y="1" width="2" height="3" fill="#922b21" />
          </g>
        );

      case 'cachecol_inverno':
        return (
          <g>
            <rect x="6" y="22" width="20" height="5" fill="#e11d48" rx="2" stroke="#9f1239" strokeWidth="1" />
            <rect x="18" y="24" width="4" height="7" fill="#e11d48" rx="1" />
            <line x1="18" y1="26" x2="22" y2="26" stroke="#ffffff" strokeWidth="1" />
            <line x1="18" y1="29" x2="22" y2="29" stroke="#ffffff" strokeWidth="1" />
          </g>
        );

      case 'oculos_detetive':
        return (
          <g>
            <circle cx="10" cy="16" r="4" fill="none" stroke="#f39c12" strokeWidth="1.8" />
            <circle cx="21" cy="16" r="4" fill="none" stroke="#f39c12" strokeWidth="1.8" />
            <line x1="14" y1="16" x2="17" y2="16" stroke="#f39c12" strokeWidth="2" />
            <line x1="25" y1="18" x2="29" y2="22" stroke="#d35400" strokeWidth="2" />
          </g>
        );

      case 'oculos_sol_pixel':
        return (
          <g>
            <rect x="7" y="14" width="7" height="5" fill="#1e272e" rx="1" />
            <rect x="17" y="14" width="7" height="5" fill="#1e272e" rx="1" />
            <rect x="14" y="15" width="3" height="2" fill="#1e272e" />
            <line x1="8" y1="15" x2="12" y2="15" stroke="#f1c40f" strokeWidth="1" />
            <line x1="18" y1="15" x2="22" y2="15" stroke="#f1c40f" strokeWidth="1" />
          </g>
        );

      case 'oculos_vr':
        return (
          <g>
            <rect x="5" y="13" width="22" height="7" rx="2" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
            <line x1="8" y1="16" x2="24" y2="16" stroke="#22d3ee" strokeWidth="2" />
            <circle cx="6" cy="16" r="1" fill="#ec4899" />
            <circle cx="26" cy="16" r="1" fill="#ec4899" />
          </g>
        );

      case 'tiara_louros':
        return (
          <g>
            <path d="M7 11 Q16 6 25 11" stroke="#eab308" strokeWidth="2" fill="none" />
            <circle cx="8" cy="11" r="1.5" fill="#16a34a" />
            <circle cx="12" cy="8" r="1.5" fill="#16a34a" />
            <circle cx="16" cy="6" r="1.8" fill="#eab308" />
            <circle cx="20" cy="8" r="1.5" fill="#16a34a" />
            <circle cx="24" cy="11" r="1.5" fill="#16a34a" />
          </g>
        );

      case 'capa_estelar':
        return (
          <polygon points="4,16 0,30 28,30 24,16" fill="#e74c3c" stroke="#c0392b" strokeWidth="1" />
        );

      case 'asas_borboleta':
        return (
          <g opacity="0.85">
            <ellipse cx="2" cy="14" rx="4" ry="7" fill="#c084fc" stroke="#7e22ce" strokeWidth="1" />
            <ellipse cx="30" cy="14" rx="4" ry="7" fill="#c084fc" stroke="#7e22ce" strokeWidth="1" />
            <circle cx="2" cy="14" r="1.5" fill="#fdf4ff" />
            <circle cx="30" cy="14" r="1.5" fill="#fdf4ff" />
          </g>
        );

      case 'aura_estrelar':
        return (
          <g>
            <circle cx="4" cy="6" r="1.5" fill="#f1c40f" className="animate-ping" />
            <circle cx="28" cy="8" r="1.5" fill="#f1c40f" className="animate-pulse" />
            <circle cx="16" cy="1" r="1.5" fill="#f1c40f" />
          </g>
        );

      case 'fogo_fatuo':
        return (
          <g>
            <circle cx="3" cy="8" r="2.5" fill="#06b6d4" className="animate-pulse" opacity="0.8" />
            <circle cx="29" cy="6" r="2" fill="#8b5cf6" className="animate-bounce" opacity="0.8" />
            <circle cx="16" cy="0" r="2" fill="#38bdf8" className="animate-ping" opacity="0.9" />
          </g>
        );

      case 'coroa_dragao':
        return (
          <g>
            <polygon points="6,7 10,2 14,7 16,3 18,7 22,2 26,7 24,10 8,10" fill="#dc2626" stroke="#b91c1c" strokeWidth="0.8" />
            <polygon points="10,2 16,3 22,2 20,7 12,7" fill="#fbbf24" />
            <circle cx="16" cy="7" r="1.8" fill="#facc15" className="animate-pulse" />
            <circle cx="16" cy="7" r="0.8" fill="#ffffff" />
          </g>
        );

      case 'monoculo_retro':
        return (
          <g>
            <circle cx="21" cy="14" r="4" stroke="#d97706" strokeWidth="1.2" fill="none" />
            <circle cx="21" cy="14" r="3.5" fill="#38bdf8" opacity="0.3" />
            <path d="M25 15 Q26 21 23 25" stroke="#d97706" strokeWidth="0.8" fill="none" strokeDasharray="1,1" />
          </g>
        );

      case 'manto_nebulosa':
        return (
          <g opacity="0.85">
            <polygon points="5,14 0,31 32,31 27,14" fill="#312e81" stroke="#4338ca" strokeWidth="1" />
            <circle cx="7" cy="22" r="1" fill="#c084fc" />
            <circle cx="25" cy="24" r="1" fill="#38bdf8" />
            <circle cx="16" cy="28" r="1" fill="#fef08a" />
          </g>
        );

      case 'aura_cristais':
        return (
          <g>
            <polygon points="3,6 5,3 7,6 5,9" fill="#06b6d4" stroke="#0891b2" strokeWidth="0.6" className="animate-bounce" />
            <polygon points="25,5 27,2 29,5 27,8" fill="#ec4899" stroke="#be185d" strokeWidth="0.6" className="animate-pulse" />
            <polygon points="14,1 16,-2 18,1 16,4" fill="#facc15" stroke="#ca8a04" strokeWidth="0.6" className="animate-ping" />
          </g>
        );

      default:
        return null;
    }
  };

  return <div className="inline-block transition-transform hover:scale-105">{renderSvgContent()}</div>;
}
