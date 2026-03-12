/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './App.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1A3C5E',
                    light: '#2563A8',
                    dark: '#0F2440',
                },
                accent: {
                    DEFAULT: '#00C896',
                    light: '#4DDFB4',
                },
                warning: '#F59E0B',
                danger: '#EF4444',
                success: '#10B981',
                bg: {
                    DEFAULT: '#F0F4F8',
                    card: '#FFFFFF',
                    dark: '#1A3C5E',
                },
                app: {
                    text: '#1E293B',
                    secondary: '#64748B',
                    light: '#94A3B8',
                    border: '#E2E8F0',
                    borderLight: '#F1F5F9',
                }
            },
        },
    },
    plugins: [],
};
