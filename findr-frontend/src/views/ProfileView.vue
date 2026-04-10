<template>
  <div
    style="
      min-height: 100vh;
      background: #0a0e14;
      max-width: 680px;
      margin: 0 auto;
      padding: 32px 20px 0;
    "
  >
    <!-- Profile header -->
    <div
      style="display: flex; align-items: center; gap: 16px; margin-bottom: 28px"
    >
      <div
        style="
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(0, 210, 190, 0.15);
          border: 1px solid rgba(0, 210, 190, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        "
      >
        <span
          style="
            color: #00d2be;
            font-size: 1.5rem;
            font-weight: 700;
            text-transform: uppercase;
          "
          >{{ userInitial }}</span
        >
      </div>
      <div style="flex: 1; min-width: 0">
        <h1
          style="
            font-size: 1.25rem;
            font-weight: 700;
            color: #e8edf5;
            margin: 0 0 2px;
            letter-spacing: -0.02em;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          "
        >
          {{ auth.user?.name }}
        </h1>
        <p
          style="
            font-size: 0.78rem;
            color: #6b7a8d;
            margin: 0 0 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          "
        >
          {{ auth.user?.email }}
        </p>
        <span
          style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.65rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          "
          :style="
            isPremium
              ? 'background:rgba(0,210,190,0.15); color:#00d2be;'
              : 'background:#1a2332; color:#6b7a8d; border:1px solid rgba(255,255,255,0.07);'
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            style="width: 10px; height: 10px"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
          {{ isPremium ? "Premium" : "Free plan" }}
        </span>
      </div>
    </div>

    <!-- Upgrade banner -->
    <div
      v-if="!isPremium"
      style="
        background: rgba(0, 210, 190, 0.06);
        border: 1px solid rgba(0, 210, 190, 0.15);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 24px;
      "
    >
      <div style="display: flex; align-items: flex-start; gap: 14px">
        <div
          style="
            width: 38px;
            height: 38px;
            background: rgba(0, 210, 190, 0.1);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="#00d2be"
            style="width: 18px; height: 18px"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </div>
        <div style="flex: 1">
          <p
            style="
              font-size: 0.875rem;
              font-weight: 700;
              color: #e8edf5;
              margin: 0 0 4px;
            "
          >
            Upgrade to Premium
          </p>
          <p
            style="
              font-size: 0.75rem;
              color: #6b7a8d;
              margin: 0 0 14px;
              line-height: 1.5;
            "
          >
            Unlimited saved places and priority search results for $5/month
          </p>
          <button
            style="
              background: #00d2be;
              color: #0a0e14;
              font-size: 0.78rem;
              font-weight: 700;
              padding: 10px 20px;
              border-radius: 12px;
              border: none;
              cursor: pointer;
              transition: opacity 0.15s;
            "
            @mouseenter="(e) => (e.currentTarget.style.opacity = '0.9')"
            @mouseleave="(e) => (e.currentTarget.style.opacity = '1')"
          >
            Upgrade for $5/month
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div
      style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 24px;
      "
    >
      <div
        style="
          background: #111720;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 20px 18px;
        "
      >
        <p
          style="
            font-size: 2rem;
            font-weight: 700;
            color: #00d2be;
            margin: 0 0 4px;
          "
        >
          {{ stats.searches }}
        </p>
        <p style="font-size: 0.75rem; color: #6b7a8d; margin: 0">
          Total searches
        </p>
      </div>
      <div
        style="
          background: #111720;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 20px 18px;
        "
      >
        <p
          style="
            font-size: 2rem;
            font-weight: 700;
            color: #00d2be;
            margin: 0 0 4px;
          "
        >
          {{ stats.saved }}
        </p>
        <p style="font-size: 0.75rem; color: #6b7a8d; margin: 0">
          Saved places
        </p>
      </div>
    </div>

    <!-- Account section -->
    <div
      style="
        background: #111720;
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 10px;
      "
    >
      <div
        style="
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        "
      >
        <p
          style="
            font-size: 0.7rem;
            font-weight: 700;
            color: #6b7a8d;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin: 0;
          "
        >
          Account
        </p>
      </div>
      <div>
        <div
          style="
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          "
        >
          <div
            style="
              width: 36px;
              height: 36px;
              background: #1a2332;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7a8d"
              stroke-width="2"
              style="width: 16px; height: 16px"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div style="flex: 1; min-width: 0">
            <p style="font-size: 0.7rem; color: #6b7a8d; margin: 0 0 2px">
              Name
            </p>
            <p
              style="
                font-size: 0.875rem;
                font-weight: 600;
                color: #e8edf5;
                margin: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              "
            >
              {{ auth.user?.name }}
            </p>
          </div>
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          "
        >
          <div
            style="
              width: 36px;
              height: 36px;
              background: #1a2332;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7a8d"
              stroke-width="2"
              style="width: 16px; height: 16px"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div style="flex: 1; min-width: 0">
            <p style="font-size: 0.7rem; color: #6b7a8d; margin: 0 0 2px">
              Email
            </p>
            <p
              style="
                font-size: 0.875rem;
                font-weight: 600;
                color: #e8edf5;
                margin: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              "
            >
              {{ auth.user?.email }}
            </p>
          </div>
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 16px 18px;
          "
        >
          <div style="display: flex; align-items: center; gap: 14px">
            <div
              style="
                width: 36px;
                height: 36px;
                background: #1a2332;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7a8d"
                stroke-width="2"
                style="width: 16px; height: 16px"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div>
              <p style="font-size: 0.7rem; color: #6b7a8d; margin: 0 0 2px">
                Plan
              </p>
              <p
                style="
                  font-size: 0.875rem;
                  font-weight: 600;
                  color: #e8edf5;
                  margin: 0;
                  text-transform: capitalize;
                "
              >
                {{ auth.user?.plan }}
              </p>
            </div>
          </div>
          <span
            style="
              font-size: 0.72rem;
              font-weight: 700;
              color: #00d2be;
              background: rgba(0, 210, 190, 0.1);
              padding: 4px 10px;
              border-radius: 8px;
              text-transform: capitalize;
            "
            >{{ auth.user?.plan }}</span
          >
        </div>
      </div>
    </div>

    <!-- Navigate section -->
    <div
      style="
        background: #111720;
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 10px;
      "
    >
      <div
        style="
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        "
      >
        <p
          style="
            font-size: 0.7rem;
            font-weight: 700;
            color: #6b7a8d;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin: 0;
          "
        >
          Navigate
        </p>
      </div>
      <div>
        <RouterLink
          v-for="item in navLinks"
          :key="item.to"
          :to="item.to"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 16px 18px;
            text-decoration: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
            transition: background 0.15s;
          "
          @mouseenter="(e) => (e.currentTarget.style.background = '#1a2332')"
          @mouseleave="(e) => (e.currentTarget.style.background = '')"
        >
          <div style="display: flex; align-items: center; gap: 14px">
            <div
              style="
                width: 36px;
                height: 36px;
                background: #1a2332;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7a8d"
                stroke-width="2"
                style="width: 16px; height: 16px"
                v-html="item.icon"
              ></svg>
            </div>
            <p
              style="
                font-size: 0.875rem;
                font-weight: 600;
                color: #e8edf5;
                margin: 0;
              "
            >
              {{ item.label }}
            </p>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3d4a5c"
            stroke-width="2"
            style="width: 15px; height: 15px; flex-shrink: 0"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </RouterLink>
      </div>
    </div>

    <!-- Sign out -->
    <button
      @click="handleLogout"
      style="
        width: 100%;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        background: #111720;
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.15s;
        margin-bottom: 8px;
      "
      @mouseenter="
        (e) => {
          e.currentTarget.style.borderColor = 'rgba(255,95,95,0.3)';
          e.currentTarget.style.background = 'rgba(255,95,95,0.05)';
        }
      "
      @mouseleave="
        (e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
          e.currentTarget.style.background = '#111720';
        }
      "
    >
      <div
        style="
          width: 36px;
          height: 36px;
          background: #1a2332;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b7a8d"
          stroke-width="2"
          style="width: 16px; height: 16px"
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </div>
      <p
        style="font-size: 0.875rem; font-weight: 600; color: #6b7a8d; margin: 0"
      >
        Sign out
      </p>
    </button>

    <p
      style="
        text-align: center;
        font-size: 0.72rem;
        color: #3d4a5c;
        margin: 20px 0 120px;
      "
    >
      Findr v1.0.0
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSearchStore } from "@/stores/search";

const auth = useAuthStore();
const searchStore = useSearchStore();
const stats = ref({ searches: 0, saved: 0 });
const userInitial = computed(
  () => auth.user?.name?.charAt(0)?.toUpperCase() || "U"
);
const isPremium = computed(() => auth.user?.plan === "premium");

const navLinks = [
  {
    to: "/search",
    label: "Search places",
    icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  },
  {
    to: "/saved",
    label: "Saved places",
    icon: '<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>',
  },
  {
    to: "/agent",
    label: "AI assistant",
    icon: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
  },
];

async function handleLogout() {
  await auth.logout();
}

onMounted(async () => {
  try {
    const [historyData, savedData] = await Promise.all([
      searchStore.fetchHistory(),
      searchStore.getSavedPlaces(),
    ]);
    stats.value.searches = historyData.total || 0;
    stats.value.saved = savedData.total || 0;
  } catch {}
});
</script>