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
    <!-- Header -->
    <div
      style="
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 24px;
      "
    >
      <div>
        <p
          style="
            font-size: 0.7rem;
            font-weight: 700;
            color: #6b7a8d;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin: 0 0 6px;
          "
        >
          Your bookmarks
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
          Saved places
        </h1>
      </div>
      <div
        style="
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(0, 210, 190, 0.1);
          border: 1px solid rgba(0, 210, 190, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 4px;
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
    </div>

    <!-- Free plan bar -->
    <div
      v-if="!isPremium"
      style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: rgba(0, 210, 190, 0.06);
        border: 1px solid rgba(0, 210, 190, 0.15);
        border-radius: 14px;
        margin-bottom: 24px;
      "
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00d2be"
        stroke-width="2"
        style="width: 16px; height: 16px; flex-shrink: 0"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p
        style="
          font-size: 0.78rem;
          color: #00d2be;
          flex: 1;
          margin: 0;
          font-weight: 500;
        "
      >
        Free plan: {{ savedPlaces.length }}/5 saved places used
      </p>
      <span style="font-size: 0.78rem; font-weight: 700; color: #00d2be"
        >Upgrade →</span
      >
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      style="display: flex; flex-direction: column; gap: 10px"
    >
      <div
        v-for="i in 3"
        :key="i"
        style="
          height: 90px;
          background: #111720;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          animation: pulse 1.5s infinite;
        "
      ></div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="savedPlaces.length === 0"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: 60px;
        text-align: center;
      "
    >
      <div
        style="
          width: 56px;
          height: 56px;
          background: #111720;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3d4a5c"
          stroke-width="2"
          style="width: 24px; height: 24px"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      </div>
      <p
        style="
          font-size: 0.875rem;
          font-weight: 600;
          color: #e8edf5;
          margin: 0 0 6px;
        "
      >
        No saved places yet
      </p>
      <p style="font-size: 0.78rem; color: #6b7a8d; margin: 0 0 24px">
        Search for places and save your favourites
      </p>
      <RouterLink
        to="/search"
        style="
          background: #00d2be;
          color: #0a0e14;
          font-size: 0.875rem;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 14px;
          text-decoration: none;
          display: inline-block;
        "
      >
        Find places
      </RouterLink>
    </div>

    <!-- Saved list -->
    <div
      v-else
      style="
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-bottom: 120px;
      "
    >
      <div
        v-for="item in savedPlaces"
        :key="item.saved_id"
        style="
          background: #111720;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 16px;
          transition: all 0.15s;
        "
        @mouseenter="
          (e) => (e.currentTarget.style.borderColor = 'rgba(0,210,190,0.2)')
        "
        @mouseleave="
          (e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')
        "
      >
        <div style="display: flex; align-items: flex-start; gap: 12px">
          <div
            style="
              width: 44px;
              height: 44px;
              background: rgba(0, 210, 190, 0.1);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            "
          >
            <span style="font-size: 1.4rem; line-height: 1">{{
              getCategoryEmoji(item.category)
            }}</span>
          </div>
          <div style="flex: 1; min-width: 0">
            <div
              style="
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 8px;
                margin-bottom: 4px;
              "
            >
              <p
                style="
                  font-size: 0.875rem;
                  font-weight: 700;
                  color: #e8edf5;
                  margin: 0;
                  line-height: 1.3;
                "
              >
                {{ item.name }}
              </p>
              <button
                @click="removePlace(item)"
                style="
                  color: #3d4a5c;
                  background: none;
                  border: none;
                  cursor: pointer;
                  padding: 2px;
                  display: flex;
                  flex-shrink: 0;
                "
                @mouseenter="(e) => (e.currentTarget.style.color = '#ff5f5f')"
                @mouseleave="(e) => (e.currentTarget.style.color = '#3d4a5c')"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  style="width: 15px; height: 15px"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </button>
            </div>
            <p
              style="
                font-size: 0.75rem;
                color: #6b7a8d;
                margin: 0 0 8px;
                line-height: 1.4;
              "
            >
              {{ item.address }}
            </p>
            <p
              v-if="item.note"
              style="
                font-size: 0.72rem;
                color: #00d2be;
                font-style: italic;
                margin: 0 0 8px;
              "
            >
              "{{ item.note }}"
            </p>
            <div style="display: flex; align-items: center; gap: 10px">
              <div
                v-if="item.rating"
                style="display: flex; align-items: center; gap: 4px"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="#00d2be"
                  style="width: 13px; height: 13px"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
                <span
                  style="font-size: 0.75rem; font-weight: 700; color: #e8edf5"
                  >{{ item.rating }}</span
                >
              </div>
              <span
                v-if="
                  item.opening_hours?.open_now !== null &&
                  item.opening_hours?.open_now !== undefined
                "
                style="
                  font-size: 0.72rem;
                  font-weight: 600;
                  padding: 2px 8px;
                  border-radius: 8px;
                "
                :style="
                  item.opening_hours.open_now
                    ? 'color:#4cde9a; background:rgba(76,222,154,0.1);'
                    : 'color:#ff5f5f; background:rgba(255,95,95,0.1);'
                "
                >{{ item.opening_hours.open_now ? "Open now" : "Closed" }}</span
              >
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          style="
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.07);
          "
        >
          <RouterLink
            :to="`/search?q=${item.category}`"
            style="
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              padding: 10px;
              border-radius: 12px;
              background: #1a2332;
              color: #6b7a8d;
              font-size: 0.78rem;
              font-weight: 700;
              text-decoration: none;
              transition: color 0.15s;
            "
            @mouseenter="(e) => (e.currentTarget.style.color = '#e8edf5')"
            @mouseleave="(e) => (e.currentTarget.style.color = '#6b7a8d')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="width: 14px; height: 14px"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Find similar
          </RouterLink>
          <button
            @click="getDirections(item)"
            style="
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              padding: 10px;
              border-radius: 12px;
              background: rgba(0, 210, 190, 0.1);
              color: #00d2be;
              font-size: 0.78rem;
              font-weight: 700;
              border: none;
              cursor: pointer;
              transition: background 0.15s;
            "
            @mouseenter="
              (e) => (e.currentTarget.style.background = 'rgba(0,210,190,0.2)')
            "
            @mouseleave="
              (e) => (e.currentTarget.style.background = 'rgba(0,210,190,0.1)')
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="width: 14px; height: 14px"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Directions
          </button>
        </div>
      </div>
    </div>

    <!-- Directions modal -->
    <div
      v-if="directionsData"
      style="
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      "
    >
      <div
        style="
          position: absolute;
          inset: 0;
          background: rgba(10, 14, 20, 0.8);
          backdrop-filter: blur(8px);
        "
        @click="directionsData = null"
      ></div>
      <div
        style="
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          background: #111720;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 24px 24px 0 0;
          padding: 24px;
        "
      >
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          "
        >
          <h3
            style="font-size: 1rem; font-weight: 700; color: #e8edf5; margin: 0"
          >
            Directions
          </h3>
          <button
            @click="directionsData = null"
            style="
              width: 32px;
              height: 32px;
              border-radius: 10px;
              background: #1a2332;
              display: flex;
              align-items: center;
              justify-content: center;
              border: none;
              cursor: pointer;
              color: #6b7a8d;
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="width: 16px; height: 16px"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div
          style="
            background: #1a2332;
            border-radius: 14px;
            padding: 16px;
            margin-bottom: 16px;
          "
        >
          <p
            style="
              font-size: 0.875rem;
              font-weight: 700;
              color: #e8edf5;
              margin: 0 0 4px;
            "
          >
            {{ directionsData.destination.name }}
          </p>
          <p style="font-size: 0.75rem; color: #6b7a8d; margin: 0">
            {{ directionsData.destination.address }}
          </p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
          <div
            style="
              background: rgba(0, 210, 190, 0.1);
              border-radius: 14px;
              padding: 16px;
              text-align: center;
            "
          >
            <p
              style="
                font-size: 1.5rem;
                font-weight: 700;
                color: #00d2be;
                margin: 0 0 4px;
              "
            >
              {{ directionsData.distance.text }}
            </p>
            <p style="font-size: 0.72rem; color: #6b7a8d; margin: 0">
              Distance
            </p>
          </div>
          <div
            style="
              background: rgba(0, 210, 190, 0.1);
              border-radius: 14px;
              padding: 16px;
              text-align: center;
            "
          >
            <p
              style="
                font-size: 1.5rem;
                font-weight: 700;
                color: #00d2be;
                margin: 0 0 4px;
              "
            >
              {{ directionsData.duration.text }}
            </p>
            <p style="font-size: 0.72rem; color: #6b7a8d; margin: 0">
              Est. time
            </p>
          </div>
        </div>
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
const searchStore = useSearchStore();
const geo = useGeolocation();

const savedPlaces = ref([]);
const isLoading = ref(false);
const directionsData = ref(null);
const isPremium = computed(() => auth.user?.plan === "premium");

const emojiMap = {
  restaurant: "🍽️",
  mosque: "🕌",
  hospital: "🏥",
  gas_station: "⛽",
  atm: "🏧",
  pharmacy: "💊",
  hotel: "🏨",
  church: "⛪",
  fast_food: "🍔",
  clinic: "🏥",
};
function getCategoryEmoji(cat) {
  return emojiMap[cat] || "📍";
}

async function loadSaved() {
  isLoading.value = true;
  try {
    const data = await searchStore.getSavedPlaces();
    savedPlaces.value = data.places;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}
async function removePlace(item) {
  try {
    await searchStore.removeSavedPlace(item.id);
    savedPlaces.value = savedPlaces.value.filter((p) => p.id !== item.id);
  } catch (err) {
    console.error(err);
  }
}
async function getDirections(place) {
  try {
    await geo.getCurrentPosition();
    const data = await searchStore.getDirections(
      place.id,
      geo.latitude.value || 6.5059,
      geo.longitude.value || 3.3481
    );
    directionsData.value = data;
  } catch (err) {
    console.error(err);
  }
}
onMounted(loadSaved);
</script>

<style scoped>
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