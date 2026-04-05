<template>
  <div
    class="min-h-screen bg-base max-w-[680px] mx-auto flex flex-col px-5 py-8"
  >
    <!-- Header -->
    <div
      class="border-b border-border pb-5 mb-6 flex items-center justify-between shrink-0"
    >
      <div>
        <h1
          class="text-xl font-bold text-content mb-1 leading-tight tracking-tight"
        >
          AI assistant
        </h1>
        <p class="text-xs text-subtle m-0">
          Powered by Claude · Ask me anything
        </p>
      </div>
      <button
        v-if="agentStore.messages.length > 0"
        @click="clearChat"
        class="text-xs text-subtle bg-transparent border-none cursor-pointer font-semibold px-3 py-2 rounded-xl transition-colors hover:text-error"
      >
        Clear chat
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto pb-6">
      <!-- Welcome state -->
      <div
        v-if="agentStore.messages.length === 0"
        class="flex flex-col items-center justify-center min-h-[50vh] text-center"
      >
        <div
          class="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-5"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="w-7 h-7 text-accent"
          >
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            />
          </svg>
        </div>
        <p class="text-lg font-bold text-content mb-2">
          Hello, I'm your Findr assistant
        </p>
        <p class="text-sm text-subtle mb-7 max-w-[260px] leading-relaxed">
          Ask me to find places near you or anything about Findr
        </p>
        <div class="flex flex-col gap-3 w-full max-w-[360px]">
          <button
            v-for="s in suggestions"
            :key="s"
            @click="sendSuggestion(s)"
            class="text-sm text-subtle bg-card border border-border rounded-2xl px-4 py-4 text-left cursor-pointer transition-all duration-150 hover:bg-hover hover:border-border-hover hover:text-content"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="(msg, i) in agentStore.messages"
          :key="i"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            v-if="msg.role === 'agent'"
            class="w-8 h-8 bg-accent/15 rounded-full flex items-center justify-center shrink-0 mt-1 mr-2.5"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="w-3.5 h-3.5 text-accent"
            >
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              />
            </svg>
          </div>
          <div
            class="max-w-[78%] rounded-2xl px-4 py-4 text-sm leading-relaxed"
            :class="
              msg.role === 'user'
                ? 'bg-accent text-base rounded-2xl rounded-br-md font-medium'
                : 'bg-card border border-border text-content rounded-md rounded-tl-md'
            "
          >
            <p class="m-0 whitespace-pre-wrap">{{ msg.content }}</p>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="agentStore.isLoading" class="flex justify-start">
          <div
            class="w-8 h-8 bg-accent/15 rounded-full flex items-center justify-center shrink-0 mt-1 mr-2.5"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="w-3.5 h-3.5 text-accent"
            >
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              />
            </svg>
          </div>
          <div
            class="bg-card border border-border rounded-md rounded-tl-md px-4 py-4 flex items-center gap-1.5"
          >
            <span class="w-2 h-2 bg-subtle rounded-full animate-bounce"></span>
            <span
              class="w-2 h-2 bg-subtle rounded-full animate-bounce"
              style="animation-delay: 150ms"
            ></span>
            <span
              class="w-2 h-2 bg-subtle rounded-full animate-bounce"
              style="animation-delay: 300ms"
            ></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-border pt-4 shrink-0">
      <div class="flex items-end gap-3">
        <div
          class="flex-1 flex items-end gap-3 bg-card border border-border rounded-2xl px-4 py-4 focus-within:border-accent transition-colors"
        >
          <textarea
            ref="textareaEl"
            v-model="message"
            placeholder="Ask me to find places near you..."
            rows="1"
            class="flex-1 bg-transparent text-content text-sm outline-none border-none resize-none leading-relaxed max-h-32 font-sans"
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
          ></textarea>
        </div>
        <button
          @click="sendMessage"
          :disabled="!message.trim() || agentStore.isLoading"
          class="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shrink-0 border-none cursor-pointer transition-opacity disabled:opacity-40"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="w-4.5 h-4.5 text-base"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p class="text-[0.65rem] text-faint text-center mt-2.5 mb-0">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { useAgentStore } from "@/stores/agent";
import { useGeolocation } from "@/composables/useGeolocation";

const agentStore = useAgentStore();
const geo = useGeolocation();
const message = ref("");
const messagesEl = ref(null);
const textareaEl = ref(null);

const suggestions = [
  "Find me a mosque near me",
  "What hospitals are close by?",
  "Find an ATM within 2km",
  "What can Findr help me with?",
];

function autoResize() {
  const el = textareaEl.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}
async function scrollToBottom() {
  await nextTick();
  if (messagesEl.value)
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
}
async function sendMessage() {
  if (!message.value.trim() || agentStore.isLoading) return;
  const text = message.value.trim();
  message.value = "";
  await nextTick();
  if (textareaEl.value) textareaEl.value.style.height = "auto";
  await agentStore.sendMessage(text, geo.latitude.value, geo.longitude.value);
  scrollToBottom();
}
async function sendSuggestion(s) {
  message.value = s;
  await sendMessage();
}
async function clearChat() {
  await agentStore.clearSession();
}
onMounted(async () => {
  try {
    await geo.getCurrentPosition();
  } catch {}
});
</script>

<style scoped>
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>