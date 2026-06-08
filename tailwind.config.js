import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        secondary: '#4F46E5'
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans]
      },
      boxShadow: {
        glow: '0 18px 60px rgba(124, 58, 237, 0.28)',
        panel: '0 18px 50px rgba(15, 23, 42, 0.08)'
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 15% 15%, rgba(124,58,237,.22), transparent 28%), radial-gradient(circle at 85% 8%, rgba(79,70,229,.18), transparent 30%), linear-gradient(135deg, rgba(255,255,255,.96), rgba(248,250,252,.9))',
        'mesh-dark': 'radial-gradient(circle at 15% 15%, rgba(124,58,237,.18), transparent 28%), radial-gradient(circle at 85% 8%, rgba(79,70,229,.16), transparent 30%), linear-gradient(135deg, rgba(9,9,11,.98), rgba(15,23,42,.96))'
      }
    }
  },
  plugins: []
}
