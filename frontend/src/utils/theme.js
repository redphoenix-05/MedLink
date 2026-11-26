// MedLink Design System — Clinical Editorial & Apothecary Tokens

export const colors = {
  canvas: '#F7F6F2',
  surface: '#FFFFFF',
  surfaceMuted: '#EFECE5',
  ink: '#121816',
  inkMuted: '#4E5B55',
  border: '#E4E1D8',
  primary: {
    main: '#0F4C3A',
    hover: '#16634C',
    light: '#E6F2EC',
    dark: '#081C16',
  },
  accent: {
    main: '#C85A32',
    hover: '#B84C27',
    light: '#FBECE6',
  },
  success: {
    main: '#157347',
    light: '#E6F4EC',
  },
  warning: {
    main: '#B45309',
    light: '#FEF3C7',
  },
  danger: {
    main: '#B91C1C',
    light: '#FEE2E2',
  },
};

export const cardSurface =
  'bg-white border border-[#E4E1D8] rounded-xl transition-all duration-200';
export const cardHover =
  'hover:border-[#C9C4B6] hover:shadow-[0_12px_32px_-12px_rgba(15,76,58,0.12)] hover:-translate-y-0.5';
export const buttonPrimary =
  'inline-flex items-center justify-center px-5 py-2.5 bg-[#0F4C3A] text-[#F7F6F2] rounded-lg font-semibold text-sm hover:bg-[#16634C] active:scale-[0.99] transition-all duration-150 cursor-pointer';
export const buttonSecondary =
  'inline-flex items-center justify-center px-5 py-2.5 bg-white border border-[#D4D0C5] text-[#121816] rounded-lg font-semibold text-sm hover:bg-[#F7F6F2] hover:border-[#0F4C3A]/40 transition-all duration-150 cursor-pointer';
export const inputClass =
  'w-full px-4 py-3 bg-white rounded-lg border border-[#D4D0C5] text-[#121816] placeholder-[#78857F] focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 transition outline-none text-sm';
export const labelClass =
  'block text-xs font-semibold uppercase tracking-wider text-[#4E5B55] mb-2';

export default {
  colors,
  cardSurface,
  cardHover,
  buttonPrimary,
  buttonSecondary,
  inputClass,
  labelClass,
};
