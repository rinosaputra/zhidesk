import { Monitor, Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@renderer/lib/utils'
import { Themes } from './types'
import useThemeStore from './store'

const themes = [
  {
    key: Themes.system,
    icon: Monitor,
    label: 'System theme'
  },
  {
    key: Themes.light,
    icon: Sun,
    label: 'Light theme'
  },
  {
    key: Themes.dark,
    icon: Moon,
    label: 'Dark theme'
  }
]

export const ThemeSwitcher: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => {
  const { theme, setTheme } = useThemeStore()
  return (
    <div
      {...props}
      className={cn(
        'relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border',
        className
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key

        return (
          <button
            aria-label={label}
            className="relative h-6 w-6 rounded-full"
            key={key}
            onClick={() => setTheme(key as Themes)}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary"
                layoutId="activeTheme"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 m-auto h-4 w-4',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
