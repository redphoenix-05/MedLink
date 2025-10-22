// MedLink Design System - Consistent Theme Configuration

export const colors = {
  primary: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    main: '#667eea',
    dark: '#764ba2',
  },
  secondary: {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    main: '#f093fb',
    dark: '#f5576c',
  },
  tertiary: {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    main: '#4facfe',
    dark: '#00f2fe',
  },
  success: {
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    main: '#11998e',
    light: '#38ef7d',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)',
    main: '#f2994a',
    light: '#f2c94c',
  },
  danger: {
    gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
    main: '#eb3349',
    light: '#f45c43',
  },
  info: {
    gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    main: '#2193b0',
    light: '#6dd5ed',
  },
};

export const gradients = {
  primary: 'bg-gradient-to-r from-purple-600 to-purple-800',
  secondary: 'bg-gradient-to-r from-pink-500 to-red-500',
  tertiary: 'bg-gradient-to-r from-blue-400 to-cyan-400',
  success: 'bg-gradient-to-r from-teal-600 to-green-500',
  warning: 'bg-gradient-to-r from-orange-500 to-yellow-500',
  danger: 'bg-gradient-to-r from-red-600 to-red-500',
  info: 'bg-gradient-to-r from-blue-600 to-cyan-400',
  hero: 'bg-gradient-to-br from-purple-600 via-purple-800 to-pink-500',
  card: 'bg-gradient-to-br from-white to-gray-50',
};

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  none: 'shadow-none',
};

export const borderRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

export const spacing = {
  section: 'py-24',
  card: 'p-8',
  container: 'container mx-auto px-6',
};

// Reusable CSS classes
export const glassCard = 'bg-white/70 backdrop-blur-xl border border-white/30';
export const cardHover = 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-2';
export const buttonPrimary = 'px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition';
export const buttonSecondary = 'px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition';
export const inputClass = 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition outline-none';
export const labelClass = 'block text-sm font-semibold text-gray-700 mb-2';

// Animation classes
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  float: 'animate-float',
};

// Typography
export const typography = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
  h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
  h3: 'text-2xl md:text-3xl font-bold',
  h4: 'text-xl md:text-2xl font-bold',
  body: 'text-base md:text-lg',
  small: 'text-sm',
  gradientText: 'bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent',
};

export default {
  colors,
  gradients,
  shadows,
  borderRadius,
  spacing,
  glassCard,
  cardHover,
  buttonPrimary,
  buttonSecondary,
  inputClass,
  labelClass,
  animations,
  typography,
};
