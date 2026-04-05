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
    <!-- Greeting -->
    <div
      style="
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 24px;
      "
    >
      <div>
        <p style="font-size: 0.875rem; color: #6b7a8d; margin: 0 0 4px">
          {{ greeting }},
        </p>
        <h1
          style="
            font-size: 1.75rem;
            font-weight: 700;
            letter-spacing: -0.03em;
            color: #e8edf5;
            margin: 0;
            line-height: 1.2;
          "
        >
          {{ firstName }} 👋
        </h1>
      </div>
      <div
        style="
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(0, 210, 190, 0.15);
          border: 1px solid rgba(0, 210, 190, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 4px;
        "
      >
        <span
          style="
            color: #00d2be;
            font-weight: 700;
            font-size: 0.9rem;
            text-transform: uppercase;
          "
          >{{ userInitial }}</span
        >
      </div>
    </div>

    <!-- Location bar -->
    <div
      @click="requestLocation"
      :style="
        locationReady
          ? 'display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:16px; background:rgba(0,210,190,0.08); border:1px solid rgba(0,210,190,0.2); cursor:pointer; margin-bottom:12px;'
          : 'display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:16px; background:#111720; border:1px solid rgba(255,255,255,0.07); cursor:pointer; margin-bottom:12px; transition: border-color 0.2s;'
      "
    >
      <div
        :style="
          locationReady
            ? 'width:36px; height:36px; border-radius:10px; background:rgba(0,210,190,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;'
            : 'width:36px; height:36px; border-radius:10px; background:#1a2332; display:flex; align-items:center; justify-content:center; flex-shrink:0;'
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          :style="
            locationReady
              ? 'width:16px; height:16px; color:#00d2be;'
              : 'width:16px; height:16px; color:#6b7a8d;'
          "
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      </div>
      <div style="flex: 1; min-width: 0">
        <p
          :style="
            locationReady
              ? 'font-size:0.875rem; font-weight:600; color:#00d2be; margin:0 0 2px;'
              : 'font-size:0.875rem; font-weight:600; color:#e8edf5; margin:0 0 2px;'
          "
        >
          {{ locationReady ? "Location active" : "Enable location" }}
        </p>
        <p
          style="
            font-size: 0.75rem;
            color: #6b7a8d;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          "
        >
          {{
            locationReady
              ? `${geo.latitude.value?.toFixed(
                  4
                )}, ${geo.longitude.value?.toFixed(4)}`
              : "Tap to allow location access"
          }}
        </p>
      </div>
      <div
        v-if="locationLoading"
        style="
          width: 16px;
          height: 16px;
          border: 2px solid #00d2be;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        "
      ></div>
      <div
        v-else-if="locationReady"
        style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00d2be;
          flex-shrink: 0;
          animation: pulse 2s infinite;
        "
      ></div>
      <svg
        v-else
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6b7a8d"
        stroke-width="2"
        style="width: 16px; height: 16px; flex-shrink: 0"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>

    <!-- Search shortcut -->
    <RouterLink
      to="/search"
      style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 16px;
        background: #111720;
        border: 1px solid rgba(255, 255, 255, 0.07);
        text-decoration: none;
        margin-bottom: 28px;
        transition: border-color 0.2s;
      "
      @mouseenter="
        (e) => (e.currentTarget.style.borderColor = 'rgba(0,210,190,0.3)')
      "
      @mouseleave="
        (e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')
      "
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6b7a8d"
        stroke-width="2"
        style="width: 18px; height: 18px; flex-shrink: 0"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span style="font-size: 0.875rem; color: #6b7a8d; flex: 1"
        >Search for places near you...</span
      >
      <span
        style="
          font-size: 0.7rem;
          color: #3d4a5c;
          background: #1a2332;
          padding: 3px 8px;
          border-radius: 6px;
          font-family: monospace;
        "
        >⌘K</span
      >
    </RouterLink>

    <!-- Quick find -->
    <div style="margin-bottom: 28px">
      <p
        style="
          font-size: 0.7rem;
          font-weight: 700;
          color: #6b7a8d;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 14px;
        "
      >
        Quick find
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
        <RouterLink
          v-for="cat in categories"
          :key="cat.query"
          :to="`/search?q=${cat.query}`"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border-radius: 14px;
            background: #111720;
            border: 1px solid rgba(255, 255, 255, 0.07);
            text-decoration: none;
            transition: all 0.15s;
          "
          @mouseenter="
            (e) => {
              e.currentTarget.style.borderColor = 'rgba(0,210,190,0.25)';
              e.currentTarget.style.background = '#1a2332';
            }
          "
          @mouseleave="
            (e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.background = '#111720';
            }
          "
        >
          <span style="font-size: 1.5rem; line-height: 1; flex-shrink: 0">{{
            cat.emoji
          }}</span>
          <div>
            <p
              style="
                font-size: 0.875rem;
                font-weight: 600;
                color: #e8edf5;
                margin: 0 0 1px;
              "
            >
              {{ cat.label }}
            </p>
            <p style="font-size: 0.72rem; color: #6b7a8d; margin: 0">
              Find nearby
            </p>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- Recent searches -->
    <div style="margin-bottom: 28px">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
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
          Recent searches
        </p>
        <RouterLink
          to="/search"
          style="
            font-size: 0.78rem;
            color: #00d2be;
            text-decoration: none;
            font-weight: 500;
          "
          >See all</RouterLink
        >
      </div>

      <!-- Skeleton loading -->
      <div
        v-if="historyLoading"
        style="display: flex; flex-direction: column; gap: 8px"
      >
        <div
          v-for="i in 3"
          :key="i"
          style="
            height: 62px;
            background: #111720;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 14px;
            animation: pulse 1.5s infinite;
          "
        ></div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="recentHistory.length === 0"
        style="
          background: #111720;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 32px 20px;
          text-align: center;
        "
      >
        <div
          style="
            width: 40px;
            height: 40px;
            background: #1a2332;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3d4a5c"
            stroke-width="2"
            style="width: 20px; height: 20px"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <p
          style="
            font-size: 0.875rem;
            font-weight: 600;
            color: #e8edf5;
            margin: 0 0 4px;
          "
        >
          No searches yet
        </p>
        <p style="font-size: 0.78rem; color: #6b7a8d; margin: 0">
          Start exploring places near you
        </p>
      </div>

      <!-- History items -->
      <div v-else style="display: flex; flex-direction: column; gap: 8px">
        <RouterLink
          v-for="item in recentHistory"
          :key="item.id"
          :to="`/search?q=${item.query}`"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            background: #111720;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 14px;
            text-decoration: none;
            transition: all 0.15s;
          "
          @mouseenter="
            (e) => {
              e.currentTarget.style.borderColor = 'rgba(0,210,190,0.2)';
              e.currentTarget.style.background = '#1a2332';
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
              style="width: 15px; height: 15px"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div style="flex: 1; min-width: 0">
            <p
              style="
                font-size: 0.875rem;
                font-weight: 600;
                color: #e8edf5;
                margin: 0 0 2px;
                text-transform: capitalize;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ item.raw_query }}
            </p>
            <p style="font-size: 0.72rem; color: #6b7a8d; margin: 0">
              {{ item.radius_km }}km · {{ item.results_count }} result{{
                item.results_count !== 1 ? "s" : ""
              }}
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

    <!-- Explore -->
    <div style="margin-bottom: 32px">
      <p
        style="
          font-size: 0.7rem;
          font-weight: 700;
          color: #6b7a8d;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 14px;
        "
      >
        Explore
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
        <RouterLink
          to="/saved"
          style="
            background: #111720;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 16px;
            padding: 20px 18px;
            text-decoration: none;
            display: block;
            transition: all 0.15s;
          "
          @mouseenter="
            (e) => {
              e.currentTarget.style.borderColor = 'rgba(0,210,190,0.2)';
              e.currentTarget.style.background = '#1a2332';
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
              width: 38px;
              height: 38px;
              background: rgba(0, 210, 190, 0.1);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 14px;
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00d2be"
              stroke-width="2"
              style="width: 18px; height: 18px"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </div>
          <p
            style="
              font-size: 0.875rem;
              font-weight: 700;
              color: #e8edf5;
              margin: 0 0 3px;
            "
          >
            Saved places
          </p>
          <p style="font-size: 0.75rem; color: #6b7a8d; margin: 0">
            Your bookmarks
          </p>
        </RouterLink>

        <RouterLink
          to="/agent"
          style="
            background: #111720;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 16px;
            padding: 20px 18px;
            text-decoration: none;
            display: block;
            transition: all 0.15s;
          "
          @mouseenter="
            (e) => {
              e.currentTarget.style.borderColor = 'rgba(0,210,190,0.2)';
              e.currentTarget.style.background = '#1a2332';
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
              width: 38px;
              height: 38px;
              background: rgba(0, 210, 190, 0.1);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 14px;
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00d2be"
              stroke-width="2"
              style="width: 18px; height: 18px"
            >
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              />
            </svg>
          </div>
          <p
            style="
              font-size: 0.875rem;
              font-weight: 700;
              color: #e8edf5;
              margin: 0 0 3px;
            "
          >
            AI assistant
          </p>
          <p style="font-size: 0.75rem; color: #6b7a8d; margin: 0">
            Ask anything
          </p>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSearchStore } from "@/stores/search";
import { useGeolocation } from "@/composables/useGeolocation";

const auth = useAuthStore();
const search = useSearchStore();
const geo = useGeolocation();

const historyLoading = ref(false);
const locationReady = ref(false);
const locationLoading = ref(false);

const userInitial = computed(
  () => auth.user?.name?.charAt(0)?.toUpperCase() || "U"
);
const firstName = computed(() => auth.user?.name?.split(" ")[0] || "there");

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
});

const recentHistory = computed(() => search.history.slice(0, 5));

const categories = [
  { query: "restaurant", label: "Eateries", emoji: "🍽️" },
  { query: "mosque", label: "Mosque", emoji: "🕌" },
  { query: "hospital", label: "Hospital", emoji: "🏥" },
  { query: "gas_station", label: "Fuel", emoji: "⛽" },
  { query: "atm", label: "ATM", emoji: "🏧" },
  { query: "pharmacy", label: "Pharmacy", emoji: "💊" },
  { query: "hotel", label: "Hotel", emoji: "🏨" },
  { query: "church", label: "Church", emoji: "⛪" },
];

async function requestLocation() {
  if (locationReady.value || locationLoading.value) return;
  locationLoading.value = true;
  try {
    await geo.getCurrentPosition();
    locationReady.value = true;
  } catch {
    locationReady.value = false;
  } finally {
    locationLoading.value = false;
  }
}

onMounted(async () => {
  historyLoading.value = true;
  try {
    await search.fetchHistory();
  } finally {
    historyLoading.value = false;
  }
  try {
    await geo.getCurrentPosition();
    locationReady.value = true;
  } catch {
    locationReady.value = false;
  }
});
</script>

<style>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>