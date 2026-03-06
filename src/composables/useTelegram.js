import { onMounted } from "vue";
import { useGridStore } from "../stores/gridStore";

export function useTelegram() {
  const store = useGridStore();
  const getTelegramWebApp = () => window.Telegram?.WebApp || null;

  onMounted(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.ready();
      tg.expand();

      // Save user to store
      const user = tg.initDataUnsafe?.user;
      if (user) {
        store.setUser(user);
      }

      // Save start param to store
      const startParam = tg.initDataUnsafe?.start_param || "";
      if (startParam) {
        store.setStartParam(startParam);
      }

      // Apply Telegram theme
      const theme = tg.themeParams;
      if (theme) {
        Object.keys(theme).forEach((key) => {
          document.documentElement.style.setProperty(
            `--tg-theme-${key}`,
            theme[key],
          );
        });
      }

      console.log("Telegram Mini App initialized", { user, startParam });
    } else {
      console.log("Running outside Telegram - using fallback mode");
    }
  });

  const hapticFeedback = (style = "light") => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      } else {
        console.log("Haptic feedback (fallback):", style);
      }
    } catch (error) {
      console.warn("Haptic feedback failed:", error);
    }
  };

  const showPopup = (message, title = "Message") =>
    new Promise((resolve) => {
      try {
        if (window.Telegram?.WebApp?.showPopup) {
          window.Telegram.WebApp.showPopup(
            {
              title,
              message,
              buttons: [{ type: "ok", id: "ok" }],
            },
            (buttonId) => {
              resolve(buttonId || "ok");
            },
          );
        } else {
          window.alert(`${title}\n\n${message}`);
          resolve("ok");
        }
      } catch (error) {
        console.warn("Telegram popup failed, using alert fallback:", error);
        window.alert(`${title}\n\n${message}`);
        resolve("ok");
      }
    });

  const submitToBot = async (payload) => {
    try {
      const tg = getTelegramWebApp();
      const chatId = tg?.initDataUnsafe?.user?.id;

      if (!chatId) {
        console.warn("submitToBot: no chat_id available");
        return false;
      }

      // const res = await fetch(
      //   "https://middlingly-uncollapsible-samir.ngrok-free.dev/submit",
      //   {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ ...payload, chat_id: chatId }),
      //   },
      // );
      
      const res = await fetch(
        "https://middlingly-uncollapsible-samir.ngrok-free.dev/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ ...payload, chat_id: chatId }),
        },
      );

      const result = await res.json();
      return result.status === "ok";
    } catch (error) {
      console.warn("Failed to submit to bot:", error);
      return false;
    }
  };

  const closeMiniApp = () => {
    try {
      const tg = getTelegramWebApp();
      if (tg?.close) {
        tg.close();
      }
    } catch (error) {
      console.warn("Failed to close Telegram Mini App:", error);
    }
  };

  return {
    hapticFeedback,
    showPopup,
    submitToBot,
    closeMiniApp,
  };
}
