import { onMounted } from 'vue'
import { useGridStore } from '../stores/gridStore'

export function useTelegram() {
  const store = useGridStore()
  const getTelegramWebApp = () => window.Telegram?.WebApp || null
  const isTelegramContext = () => {
    const tg = getTelegramWebApp()
    return Boolean(tg && typeof tg.initData === 'string' && tg.initData.length > 0)
  }
  
  onMounted(() => {
    const tg = getTelegramWebApp()
    if (tg) {
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
      
      console.log('Telegram Mini App initialized', { user, startParam })
    } else {
      console.log('Running outside Telegram - using fallback mode')
    }
  })
  
  const hapticFeedback = (style = 'light') => {
    try {
      if (isTelegramContext() && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style)
      } else {
        console.log('Haptic feedback (fallback):', style)
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }
  
  const showPopup = (message, title = 'Message') =>
    new Promise((resolve) => {
      try {
        if (isTelegramContext() && window.Telegram?.WebApp?.showPopup) {
          window.Telegram.WebApp.showPopup(
            {
              title,
              message,
              buttons: [{ type: 'ok', id: 'ok' }]
            },
            (buttonId) => {
              resolve(buttonId || 'ok')
            }
          )
        } else {
          window.alert(`${title}\n\n${message}`)
          resolve('ok')
        }
      } catch (error) {
        console.warn('Telegram popup failed, using alert fallback:', error)
        window.alert(`${title}\n\n${message}`)
        resolve('ok')
      }
    })

  const sendData = (payload) => {
    try {
      const tg = getTelegramWebApp()
      if (!isTelegramContext() || !tg?.sendData) {
        return false
      }

      const serializedPayload =
        typeof payload === 'string' ? payload : JSON.stringify(payload)
      tg.sendData(serializedPayload)
      return true
    } catch (error) {
      console.warn('Failed to send data to Telegram bot:', error)
      return false
    }
  }

  const closeMiniApp = () => {
    try {
      const tg = getTelegramWebApp()
      if (isTelegramContext() && tg?.close) {
        tg.close()
      }
    } catch (error) {
      console.warn('Failed to close Telegram Mini App:', error)
    }
  }
  
  return {
    hapticFeedback,
    showPopup,
    sendData,
    closeMiniApp
  }
}
