import React from 'react';

interface PetIconProps {
  petId: string;
  size?: number;
  mood?: 'idle' | 'happy' | 'sad';
  className?: string;
}

export function PetIcon({ petId, size = 64, mood = 'idle', className = '' }: PetIconProps) {
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

            {/* Focinho */}
            <rect x="14" y="19" width="4" height="3" fill="#2c3e50" rx="1" />
            {/* Boquinha */}
            <rect x="15" y="23" width="2" height="1" fill="#c0392b" />
          </svg>
        );

      case 'bolha_slime':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Corpo Gelatinoso */}
            <rect x="6" y="10" width="20" height="16" fill="#2ed573" rx="4" />
            <rect x="4" y="14" width="24" height="10" fill="#2ed573" rx="3" />
            {/* Brilho Gel */}
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
            {/* Blush rosa */}
            <rect x="6" y="19" width="3" height="2" fill="#ff7675" rx="1" opacity="0.8" />
            <rect x="23" y="19" width="3" height="2" fill="#ff7675" rx="1" opacity="0.8" />
          </svg>
        );

      case 'corujinha_pixel':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Orelhas / Peninhas */}
            <rect x="6" y="5" width="4" height="5" fill="#4b6584" />
            <rect x="22" y="5" width="4" height="5" fill="#4b6584" />
            {/* Corpo */}
            <rect x="6" y="8" width="20" height="18" fill="#778ca3" rx="3" />
            {/* Barriguinha */}
            <rect x="10" y="15" width="12" height="10" fill="#d1d8e0" rx="2" />
            {/* Óculos Pixel */}
            <rect x="7" y="11" width="7" height="6" fill="#f5f6fa" stroke="#f39c12" strokeWidth="1.5" />
            <rect x="18" y="11" width="7" height="6" fill="#f5f6fa" stroke="#f39c12" strokeWidth="1.5" />
            <rect x="14" y="13" width="4" height="2" fill="#f39c12" />
            {/* Olhos nos óculos */}
            <rect x="9" y="13" width="3" height="3" fill="#2c3e50" />
            <rect x="20" y="13" width="3" height="3" fill="#2c3e50" />
            {/* Bico */}
            <polygon points="16,17 14,21 18,21" fill="#e67e22" />
          </svg>
        );

      case 'raio_dragao':
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Chifres Dourados */}
            <polygon points="7,4 10,10 5,9" fill="#f1c40f" />
            <polygon points="25,4 27,9 22,10" fill="#f1c40f" />
            {/* Asinhas */}
            <polygon points="3,13 7,16 4,21" fill="#e84118" />
            <polygon points="29,13 28,21 25,16" fill="#e84118" />
            {/* Cabeça */}
            <rect x="6" y="9" width="20" height="16" fill="#8c7ae6" rx="3" />
            {/* Olhos de Dragão */}
            <rect x="9" y="13" width="4" height="4" fill="#f5cd79" />
            <rect x="10" y="13" width="2" height="4" fill="#130f40" />
            <rect x="19" y="13" width="4" height="4" fill="#f5cd79" />
            <rect x="20" y="13" width="2" height="4" fill="#130f40" />
            {/* Focinho e vaporzinho */}
            <rect x="12" y="19" width="8" height="4" fill="#7158e2" rx="1" />
            <circle cx="14" cy="20" r="1" fill="#2f3542" />
            <circle cx="18" cy="20" r="1" fill="#2f3542" />
          </svg>
        );

      default:
        // Padrão astronauta / fênix
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect x="6" y="6" width="20" height="20" fill="#fbc531" rx="4" />
            <circle cx="11" cy="14" r="2" fill="#2f3542" />
            <circle cx="21" cy="14" r="2" fill="#2f3542" />
            <path d="M13 19 Q16 22 19 19" stroke="#2f3542" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return <div className="inline-block transition-transform hover:scale-105">{renderSvgContent()}</div>;
}
