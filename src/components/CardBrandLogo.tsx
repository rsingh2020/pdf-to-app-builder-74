interface CardBrandLogoProps {
  brand: string;
  className?: string;
}

export const CardBrandLogo = ({ brand, className = "h-8" }: CardBrandLogoProps) => {
  const brandLower = brand.toLowerCase();

  // Visa logo representation
  if (brandLower.includes('visa')) {
    return (
      <svg viewBox="0 0 60 20" className={className} fill="currentColor">
        <text x="0" y="16" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="18">VISA</text>
      </svg>
    );
  }

  // Mastercard logo representation (two circles)
  if (brandLower.includes('mastercard')) {
    return (
      <svg viewBox="0 0 48 30" className={className} fill="none">
        <circle cx="15" cy="15" r="12" fill="#EB001B" opacity="0.9" />
        <circle cx="33" cy="15" r="12" fill="#FF5F00" opacity="0.9" />
      </svg>
    );
  }

  // American Express logo representation
  if (brandLower.includes('american express') || brandLower.includes('amex')) {
    return (
      <svg viewBox="0 0 60 20" className={className} fill="currentColor">
        <rect x="0" y="0" width="60" height="20" rx="2" fill="white" opacity="0.2" />
        <text x="30" y="14" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="10" textAnchor="middle" fill="white">AMEX</text>
      </svg>
    );
  }

  // Discover logo representation
  if (brandLower.includes('discover')) {
    return (
      <svg viewBox="0 0 60 20" className={className} fill="currentColor">
        <text x="0" y="16" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="12">Discover</text>
      </svg>
    );
  }

  // Apple Cash logo representation
  if (brandLower.includes('apple')) {
    return (
      <svg viewBox="0 0 30 30" className={className} fill="currentColor">
        <path d="M22.5 14c0-3.5 2.8-5.2 2.9-5.3-1.6-2.3-4-2.6-4.9-2.6-2.1-.2-4 1.2-5.1 1.2-1 0-2.7-1.2-4.4-1.2-2.3 0-4.4 1.3-5.5 3.4-2.4 4.1-.6 10.2 1.7 13.5 1.1 1.6 2.5 3.4 4.3 3.4 1.7-.1 2.4-1.1 4.4-1.1s2.6 1.1 4.4 1.1c1.8 0 3.1-1.7 4.3-3.3 1.3-1.9 1.9-3.7 1.9-3.8 0-.1-3.7-1.4-3.7-5.5zM19.5 5c.9-1.1 1.5-2.7 1.4-4.2-1.3.1-2.9.9-3.8 2-.8.9-1.5 2.5-1.3 4 1.4.1 2.8-.7 3.7-1.8z" />
      </svg>
    );
  }

  // Generic card icon for others
  return (
    <svg viewBox="0 0 40 30" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="36" height="26" rx="3" />
      <line x1="2" y1="10" x2="38" y2="10" />
    </svg>
  );
};
