
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Enhanced semantic colors for workflow nodes
				node: {
					start: {
						DEFAULT: '#22c55e',
						light: '#dcfce7',
						dark: '#15803d'
					},
					agent: {
						DEFAULT: '#10b981',
						light: '#d1fae5',
						dark: '#047857'
					},
					tool: {
						DEFAULT: '#3b82f6',
						light: '#dbeafe',
						dark: '#1e40af'
					},
					function: {
						DEFAULT: '#8b5cf6',
						light: '#ede9fe',
						dark: '#6d28d9'
					},
					conditional: {
						DEFAULT: '#f59e0b',
						light: '#fef3c7',
						dark: '#d97706'
					},
					parallel: {
						DEFAULT: '#06b6d4',
						light: '#cffafe',
						dark: '#0891b2'
					},
					end: {
						DEFAULT: '#ef4444',
						light: '#fee2e2',
						dark: '#dc2626'
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Enhanced border radius system
				'node': '12px',
				'node-lg': '16px',
				'panel': '8px'
			},
			boxShadow: {
				// Enhanced shadow system for depth
				'node': '0 2px 8px rgba(0, 0, 0, 0.08)',
				'node-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
				'node-selected': '0 4px 16px rgba(59, 130, 246, 0.2)',
				'panel': '0 4px 16px rgba(0, 0, 0, 0.04)',
				'panel-hover': '0 8px 24px rgba(0, 0, 0, 0.08)',
				'edge': '0 2px 4px rgba(0, 0, 0, 0.1)'
			},
			spacing: {
				// Enhanced spacing system
				'node-padding': '12px',
				'panel-padding': '16px',
				'section-gap': '24px'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// Enhanced animations
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(4px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'node-pulse': {
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
					'50%': { boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'node-pulse': 'node-pulse 2s infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
