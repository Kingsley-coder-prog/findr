import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";

export const useAgentStore = defineStore("agent", () => {
  const messages = ref([]);
  const sessionId = ref(null);
  const isLoading = ref(false);

  async function sendMessage(message, latitude = null, longitude = null) {
    // Add user message immediately to UI
    messages.value.push({ role: "user", content: message });
    isLoading.value = true;

    try {
      const { data } = await api.post("/agent/chat", {
        message,
        latitude,
        longitude,
        sessionId: sessionId.value,
      });

      sessionId.value = data.sessionId;

      // Add agent reply
      messages.value.push({ role: "agent", content: data.reply });
      return data;
    } catch (err) {
      messages.value.push({
        role: "agent",
        content: "Sorry, I ran into an issue. Please try again.",
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function clearSession() {
    if (sessionId.value) {
      await api.delete(`/agent/session/${sessionId.value}`);
    }
    messages.value = [];
    sessionId.value = null;
  }

  return { messages, sessionId, isLoading, sendMessage, clearSession };
});
