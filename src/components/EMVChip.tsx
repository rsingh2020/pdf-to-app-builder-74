interface EMVChipProps {
  className?: string;
}

export const EMVChip = ({ className = "w-12 h-10" }: EMVChipProps) => {
  return (
    <svg 
      viewBox="0 0 48 40" 
      className={className}
      fill="none"
    >
      {/* Chip outer frame */}
      <rect 
        x="2" 
        y="2" 
        width="44" 
        height="36" 
        rx="4" 
        fill="url(#chipGradient)"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
      
      {/* Chip contact pattern */}
      <g opacity="0.6">
        {/* Horizontal lines */}
        <line x1="10" y1="12" x2="38" y2="12" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
        <line x1="10" y1="20" x2="38" y2="20" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
        <line x1="10" y1="28" x2="38" y2="28" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
        
        {/* Vertical lines */}
        <line x1="16" y1="8" x2="16" y2="32" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
        <line x1="24" y1="8" x2="24" y2="32" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
        <line x1="32" y1="8" x2="32" y2="32" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
      </g>
      
      {/* Contact pads */}
      <g fill="rgba(0,0,0,0.2)">
        <rect x="14" y="10" width="6" height="6" rx="1" />
        <rect x="22" y="10" width="6" height="6" rx="1" />
        <rect x="30" y="10" width="6" height="6" rx="1" />
        
        <rect x="14" y="18" width="6" height="6" rx="1" />
        <rect x="22" y="18" width="6" height="6" rx="1" />
        <rect x="30" y="18" width="6" height="6" rx="1" />
        
        <rect x="14" y="26" width="6" height="6" rx="1" />
        <rect x="22" y="26" width="6" height="6" rx="1" />
        <rect x="30" y="26" width="6" height="6" rx="1" />
      </g>
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(218, 165, 32, 0.9)" />
          <stop offset="50%" stopColor="rgba(255, 215, 0, 0.95)" />
          <stop offset="100%" stopColor="rgba(184, 134, 11, 0.9)" />
        </linearGradient>
      </defs>
    </svg>
  );
};
