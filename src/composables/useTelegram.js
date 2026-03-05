import { onMounted } from 'vue'
import { useGridStore } from '../stores/gridStore'

export function useTelegram() {
  const store = useGridStore()
  
  onMounted(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      
      // Save user to store
      const user = tg.initDataUnsafe?.user
      if (user) {
        store.setUser(user)
      }
      
      // Save start param to store
      const startParam = tg.initDataUnsafe?.start_param || ''
      if (startParam) {
        store.setStartParam(startParam)
      }
      
      // Apply Telegram theme
      const theme = tg.themeParams
      if (theme) {
        Object.keys(theme).forEach(key => {
          document.documentElement.style.setProperty(`--tg-theme-${key}`, theme[key])
        })
      }
      
      // Load saved selections
      store.loadFromStorage()
      
      console.log('Telegram Mini App initialized', { user, startParam })
    } else {
      console.log('Running outside Telegram - using fallback mode')
    }
  })
  
  const hapticFeedback = (style = 'light') => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style)
      } else {
        console.log('Haptic feedback (fallback):', style)
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }
  
  const showPopup = (message, title = 'Message') => {
    try {
      if (window.Telegram?.WebApp?.showPopup) {
        window.Telegram.WebApp.showPopup({
          title: title,
          message: message,
          buttons: [{ type: 'ok' }]
        })
      } else {
        window.alert(`${title}\n\n${message}`)
      }
    } catch (error) {
      console.warn('Telegram popup failed, using alert fallback:', error)
      window.alert(`${title}\n\n${message}`)
    }
  }
  
  return {
    hapticFeedback,
    showPopup
  }
}
