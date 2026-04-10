<template>
  <div
    style="
      min-height: 100vh;
      background: #0a0e14;
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
    "
  >
    <!-- Header -->
    <div
      style="
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        padding: 28px 20px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      "
    >
      <div>
        <h1
          style="
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: -0.03em;
            color: #e8edf5;
            margin: 0 0 4px;
            line-height: 1.2;
          "
        >
          AI assistant
        </h1>
        <p style="font-size: 0.75rem; color: #6b7a8d; margin: 0">
          Powered by Claude · Ask me anything
        </p>
      </div>
      <button
        v-if="agentStore.messages.length > 0"
        @click="clearChat"
        style="
          font-size: 0.75rem;
          color: #6b7a8d;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 10px;
          transition: color 0.15s;
        "
        @mouseenter="(e) => (e.currentTarget.style.color = '#ff5f5f')"
        @mouseleave="(e) => (e.currentTarget.style.color = '#6b7a8d')"
      >
        Clear chat
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesEl" style="flex: 1; overflow-y: auto; padding: 24px 20px">
      <!-- Welcome state -->
      <div
        v-if="agentStore.messages.length === 0"
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        "
      >
        <div
          style="
            width: 56px;
            height: 56px;
            background: rgba(0, 210, 190, 0.1);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00d2be"
            stroke-width="2"
            style="width: 26px; height: 26px"
          >
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            />
          </svg>
        </div>
        <p
          style="
            font-size: 1.1rem;
            font-weight: 700;
            color: #e8edf5;
            margin: 0 0 8px;
          "
        >
          Hello, I'm your Findr assistant
        </p>
        <p
          style="
            font-size: 0.875rem;
            color: #6b7a8d;
            margin: 0 0 28px;
            max-width: 260px;
            line-height: 1.5;
          "
        >
          Ask me to find places near you or anything about Findr
        </p>
        <div
          style="
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
            max-width: 360px;
          "
        >
          <button
            v-for="s in suggestions"
            :key="s"
            @click="sendSuggestion(s)"
            style="
              font-size: 0.875rem;
              color: #6b7a8d;
              background: #111720;
              border: 1px solid rgba(255, 255, 255, 0.07);
              border-radius: 14px;
              padding: 14px 16px;
              text-align: left;
              cursor: pointer;
              transition: all 0.15s;
              width: 100%;
            "
            @mouseenter="
              (e) => {
                e.currentTarget.style.borderColor = 'rgba(0,210,190,0.25)';
                e.currentTarget.style.background = '#1a2332';
                e.currentTarget.style.color = '#e8edf5';
              }
            "
            @mouseleave="
              (e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.background = '#111720';
                e.currentTarget.style.color = '#6b7a8d';
              }
            "
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-else style="display: flex; flex-direction: column; gap: 16px">
        <div
          v-for="(msg, i) in agentStore.messages"
          :key="i"
          style="display: flex"
          :style="
            msg.role === 'user'
              ? 'justify-content:flex-end;'
              : 'justify-content:flex-start;'
          "
        >
          <!-- Agent avatar -->
          <div
            v-if="msg.role === 'agent'"
            style="
              width: 32px;
              height: 32px;
              background: rgba(0, 210, 190, 0.15);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              margin-top: 4px;
              margin-right: 10px;
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00d2be"
              stroke-width="2"
              style="width: 15px; height: 15px"
            >
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              />
            </svg>
          </div>

          <!-- User bubble: plain text. Agent bubble: rendered markdown -->
          <div
            style="
              max-width: 78%;
              border-radius: 16px;
              padding: 14px 16px;
              font-size: 0.875rem;
              line-height: 1.6;
            "
            :style="
              msg.role === 'user'
                ? 'background:#00d2be; color:#0a0e14; border-radius:16px 16px 4px 16px; font-weight:500;'
                : 'background:#111720; border:1px solid rgba(255,255,255,0.07); color:#e8edf5; border-radius:4px 16px 16px 16px;'
            "
          >
            <!-- User messages: plain text -->
            <p
              v-if="msg.role === 'user'"
              style="margin: 0; white-space: pre-wrap"
            >
              {{ msg.content }}
            </p>
            <!-- Agent messages: rendered markdown -->
            <div
              v-else
              class="agent-message"
              v-html="renderMarkdown(msg.content)"
            ></div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div
          v-if="agentStore.isLoading"
          style="display: flex; justify-content: flex-start"
        >
          <div
            style="
              width: 32px;
              height: 32px;
              background: rgba(0, 210, 190, 0.15);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              margin-top: 4px;
              margin-right: 10px;
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00d2be"
              stroke-width="2"
              style="width: 15px; height: 15px"
            >
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              />
            </svg>
          </div>
          <div
            style="
              background: #111720;
              border: 1px solid rgba(255, 255, 255, 0.07);
              border-radius: 4px 16px 16px 16px;
              padding: 14px 16px;
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            <span class="dot"></span>
            <span class="dot" style="animation-delay: 150ms"></span>
            <span class="dot" style="animation-delay: 300ms"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input bar -->
    <div
      style="
        border-top: 1px solid rgba(255, 255, 255, 0.07);
        padding: 16px 20px 100px;
        flex-shrink: 0;
      "
    >
      <div style="display: flex; align-items: flex-end; gap: 12px">
        <div
          style="
            flex: 1;
            background: #111720;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 16px;
            padding: 14px 16px;
            transition: border-color 0.2s;
          "
          @focusin="(e) => (e.currentTarget.style.borderColor = '#00d2be')"
          @focusout="
            (e) =>
              (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')
          "
        >
          <textarea
            ref="textareaEl"
            v-model="message"
            placeholder="Ask me to find places near you..."
            rows="1"
            style="
              width: 100%;
              background: transparent;
              color: #e8edf5;
              font-size: 0.875rem;
              outline: none;
              border: none;
              font-family: inherit;
              resize: none;
              line-height: 1.6;
              max-height: 128px;
              display: block;
            "
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
          ></textarea>
        </div>
        <button
          @click="sendMessage"
          :disabled="!message.trim() || agentStore.isLoading"
          style="
            width: 48px;
            height: 48px;
            background: #00d2be;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: none;
            cursor: pointer;
            transition: opacity 0.15s;
          "
          :style="
            !message.trim() || agentStore.isLoading
              ? 'opacity:0.4; cursor:not-allowed;'
              : 'opacity:1;'
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0a0e14"
            stroke-width="2.5"
            style="width: 18px; height: 18px"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p
        style="
          font-size: 0.65rem;
          color: #3d4a5c;
          text-align: center;
          margin: 10px 0 0;
        "
      >
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { useAgentStore } from "@/stores/agent";
import { useGeolocation } from "@/composables/useGeolocation";
import { renderMarkdown } from "@/composables/useMarkdown";

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
.dot {
  width: 8px;
  height: 8px;
  background: #6b7a8d;
  border-radius: 50%;
  animation: bounce 1s infinite;
  display: inline-block;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
/* Agent message markdown styles */
.agent-message :deep(p) {
  margin: 0 0 8px;
}
.agent-message :deep(p:last-child) {
  margin-bottom: 0;
}
.agent-message :deep(strong) {
  color: #e8edf5;
  font-weight: 700;
}
.agent-message :deep(em) {
  color: #a0adb8;
  font-style: italic;
}
.agent-message :deep(ul) {
  margin: 8px 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.agent-message :deep(li) {
  padding-left: 16px;
  position: relative;
  font-size: 0.875rem;
  line-height: 1.5;
}
.agent-message :deep(li)::before {
  content: "·";
  position: absolute;
  left: 4px;
  color: #00d2be;
  font-weight: 700;
}
</style>