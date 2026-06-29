export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "deadline" | "event" | "update" | "ai";
  timestamp: string;
  read: boolean;
}

// Play notification sound using browser Web Audio API
export const playNotificationSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play a premium dual-tone chime
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    playTone(587.33, now, 0.15); // D5
    playTone(880.00, now + 0.10, 0.35); // A5
  } catch (err) {
    console.error("Audio playback error:", err);
  }
};

export const getNotifications = (): NotificationItem[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("lifesaver_notifications");
  if (!stored) {
    // Seed initial notifications if empty
    const seed: NotificationItem[] = [
      {
        id: "1",
        title: "Submit Sprint Documentation",
        message: "Your sprint documentation is overdue. Shift schedule or write apology now.",
        type: "deadline",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      },
      {
        id: "2",
        title: "Weekly Review Meeting",
        message: "Starts in 15 minutes. Secure focus block in Focus Room.",
        type: "event",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false
      }
    ];
    localStorage.setItem("lifesaver_notifications", JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored);
};

export const addNotification = (title: string, message: string, type: NotificationItem["type"]) => {
  const current = getNotifications();
  const newItem: NotificationItem = {
    id: Math.random().toString(36).substring(7),
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false
  };
  const updated = [newItem, ...current];
  localStorage.setItem("lifesaver_notifications", JSON.stringify(updated));
  playNotificationSound();
  window.dispatchEvent(new Event("lifesaver_notification_update"));
};

export const markAsRead = (id: string) => {
  const current = getNotifications();
  const updated = current.map(item => item.id === id ? { ...item, read: true } : item);
  localStorage.setItem("lifesaver_notifications", JSON.stringify(updated));
  window.dispatchEvent(new Event("lifesaver_notification_update"));
};

export const markAllAsRead = () => {
  const current = getNotifications();
  const updated = current.map(item => ({ ...item, read: true }));
  localStorage.setItem("lifesaver_notifications", JSON.stringify(updated));
  window.dispatchEvent(new Event("lifesaver_notification_update"));
};

export const clearNotifications = () => {
  localStorage.setItem("lifesaver_notifications", JSON.stringify([]));
  window.dispatchEvent(new Event("lifesaver_notification_update"));
};
