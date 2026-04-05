<template>
  <div
    style="
      min-height: 100vh;
      background: #0a0e14;
      max-width: 680px;
      margin: 0 auto;
      padding: 0 20px 0;
    "
  >
    <!-- Sticky header -->
    <div
      class="sticky top-0 z-20"
      style="
        background: #0a0e14;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        padding: 20px 0 16px;
      "
    >
      <!-- Search row -->
      <div
        style="
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        "
      >
        <div
          class="flex-1 flex items-center gap-3 focus-within:border-app-accent transition-colors duration-200"
          style="
            background: #111720;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 16px;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
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
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Search for places near you..."
            style="
              flex: 1;
              background: transparent;
              color: #e8edf5;
              font-size: 0.875rem;
              outline: none;
              border: none;
              font-family: inherit;
            "
            @keyup.enter="handleSearch"
            @input="onInput"
          />
          <button
            v-if="query"
            @click="clearSearch"
            style="
              color: #6b7a8d;
              background: none;
              border: none;
              cursor: pointer;
              padding: 0;
              display: flex;
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
        <button
          @click="handleSearch"
          :disabled="!query.trim() || isSearching"
          style="
            background: #00d2be;
            color: #0a0e14;
            font-weight: 700;
            font-size: 0.875rem;
            padding: 14px 20px;
            border-radius: 16px;
            border: none;
            cursor: pointer;
            flex-shrink: 0;
            opacity: 1;
            transition: opacity 0.15s;
          "
          :style="!query.trim() || isSearching ? 'opacity:0.4;' : ''"
        >
          Search
        </button>
      </div>

      <!-- Radius pills -->
      <div style="display: flex; align-items: center; gap: 8px">
        <span style="font-size: 0.75rem; color: #6b7a8d; flex-shrink: 0"
          >Radius:</span
        >
        <button
          v-for="r in radiusOptions"
          :key="r"
          @click="
            radius = r;
            if (hasResults) handleSearch();
          "
          style="
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.15s;
          "
          :style="
            radius === r
              ? 'background:#00d2be; color:#0a0e14;'
              : 'background:#1a2332; border:1px solid rgba(255,255,255,0.07); color:#6b7a8d;'
          "
        >
          {{ r }}km
        </button>
      </div>
    </div>

    <!-- Location warning -->
    <div
      v-if="!locationReady"
      style="
        margin-top: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: rgba(255, 181, 71, 0.1);
        border: 1px solid rgba(255, 181, 71, 0.2);
        border-radius: 14px;
      "
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffb547"
        stroke-width="2"
        style="width: 16px; height: 16px; flex-shrink: 0"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p style="font-size: 0.75rem; color: #ffb547; flex: 1; margin: 0">
        Enable location for accurate nearby results
      </p>
      <button
        @click="requestLocation"
        style="
          font-size: 0.75rem;
          color: #ffb547;
          font-weight: 700;
          background: none;
          border: none;
          cursor: pointer;
        "
      >
        Enable
      </button>
    </div>

    <!-- Categories (before search) -->
    <div
      v-if="!hasResults && !isSearching && !searched"
      style="padding-top: 24px; padding-bottom: 120px"
    >
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
        Browse by category
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
        <button
          v-for="cat in categories"
          :key="cat.query"
          @click="selectCategory(cat.query)"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border-radius: 14px;
            background: #111720;
            border: 1px solid rgba(255, 255, 255, 0.07);
            text-align: left;
            cursor: pointer;
            transition: all 0.15s;
            width: 100%;
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
                margin: 0 0 2px;
              "
            >
              {{ cat.label }}
            </p>
            <p style="font-size: 0.72rem; color: #6b7a8d; margin: 0">
              Find nearby
            </p>
          </div>
        </button>
      </div>
    </div>

    <!-- Skeleton -->
    <div
      v-if="isSearching"
      style="
        padding-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      "
    >
      <div
        v-for="i in 4"
        :key="i"
        style="
          height: 88px;
          background: #111720;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          animation: pulse 1.5s infinite;
        "
      ></div>
    </div>

    <!-- No results -->
    <div
      v-else-if="searched && results.length === 0 && !isSearching"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: 80px;
        padding-bottom: 120px;
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
          margin-bottom: 20px;
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3d4a5c"
          stroke-width="2"
          style="width: 24px; height: 24px"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <p
        style="
          font-size: 1rem;
          font-weight: 700;
          color: #e8edf5;
          margin: 0 0 8px;
        "
      >
        No results found
      </p>
      <p style="font-size: 0.875rem; color: #6b7a8d; margin: 0 0 24px">
        Try a different search or increase the radius
      </p>
      <button
        @click="
          radius = 10;
          handleSearch();
        "
        style="
          background: #00d2be;
          color: #0a0e14;
          font-size: 0.875rem;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
        "
      >
        Search within 10km
      </button>
    </div>

    <!-- Results -->
    <div
      v-else-if="results.length > 0"
      style="padding-top: 20px; padding-bottom: 120px"
    >
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
            letter-spacing: 0.08em;
            margin: 0;
          "
        >
          {{ results.length }} place{{ results.length !== 1 ? "s" : "" }} found
        </p>
        <p style="font-size: 0.72rem; color: #3d4a5c; margin: 0">
          within {{ radius }}km
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px">
        <div
          v-for="place in results"
          :key="place.id"
          style="
            background: #111720;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 16px;
            padding: 16px;
            cursor: pointer;
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
                getCategoryEmoji(place.category)
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
                  {{ place.name }}
                </p>
                <span
                  style="
                    font-size: 0.72rem;
                    color: #00d2be;
                    font-weight: 700;
                    flex-shrink: 0;
                    background: rgba(0, 210, 190, 0.1);
                    padding: 2px 8px;
                    border-radius: 8px;
                  "
                  >{{ place.distance_km }}km</span
                >
              </div>
              <p
                style="
                  font-size: 0.75rem;
                  color: #6b7a8d;
                  margin: 0 0 10px;
                  line-height: 1.4;
                "
              >
                {{ place.address }}
              </p>
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  flex-wrap: wrap;
                "
              >
                <div
                  v-if="place.rating"
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
                    >{{ place.rating }}</span
                  >
                  <span style="font-size: 0.72rem; color: #6b7a8d"
                    >({{ place.total_ratings }})</span
                  >
                </div>
                <span
                  v-if="
                    place.opening_hours?.open_now !== null &&
                    place.opening_hours?.open_now !== undefined
                  "
                  style="
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 8px;
                  "
                  :style="
                    place.opening_hours.open_now
                      ? 'color:#4cde9a; background:rgba(76,222,154,0.1);'
                      : 'color:#ff5f5f; background:rgba(255,95,95,0.1);'
                  "
                  >{{
                    place.opening_hours.open_now ? "Open now" : "Closed"
                  }}</span
                >
                <span
                  v-if="place.phone"
                  style="font-size: 0.72rem; color: #6b7a8d"
                  >{{ place.phone }}</span
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
            <button
              @click="getDirections(place)"
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
                (e) =>
                  (e.currentTarget.style.background = 'rgba(0,210,190,0.2)')
              "
              @mouseleave="
                (e) =>
                  (e.currentTarget.style.background = 'rgba(0,210,190,0.1)')
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
            <button
              @click="toggleSave(place)"
              style="
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 10px;
                border-radius: 12px;
                font-size: 0.78rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.15s;
              "
              :style="
                savedIds.has(place.id)
                  ? 'background:rgba(0,210,190,0.08); border:1px solid rgba(0,210,190,0.3); color:#00d2be;'
                  : 'background:transparent; border:1px solid rgba(255,255,255,0.07); color:#6b7a8d;'
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                style="width: 14px; height: 14px"
                :style="
                  savedIds.has(place.id) ? 'fill:#00d2be; stroke:#00d2be;' : ''
                "
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
              {{ savedIds.has(place.id) ? "Saved" : "Save place" }}
            </button>
          </div>
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
        <div
          style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 16px;
          "
        >
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
        <div
          v-for="(step, i) in directionsData.steps"
          :key="i"
          style="
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 0;
            border-top: 1px solid rgba(255, 255, 255, 0.07);
          "
        >
          <div
            style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: rgba(0, 210, 190, 0.15);
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            "
          >
            <span style="font-size: 0.6rem; font-weight: 700; color: #00d2be">{{
              i + 1
            }}</span>
          </div>
          <p
            style="
              font-size: 0.875rem;
              color: #e8edf5;
              margin: 0;
              line-height: 1.5;
            "
          >
            {{ step.instruction }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useSearchStore } from "@/stores/search";
import { useGeolocation } from "@/composables/useGeolocation";

const route = useRoute();
const searchStore = useSearchStore();
const geo = useGeolocation();

const query = ref("");
const radius = ref(5);
const isSearching = ref(false);
const searched = ref(false);
const results = ref([]);
const savedIds = ref(new Set());
const directionsData = ref(null);
const locationReady = ref(false);
const inputRef = ref(null);

const radiusOptions = [2, 5, 10, 20];
const hasResults = computed(() => results.value.length > 0);

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
  supermarket: "🛒",
  bank: "🏦",
  clinic: "🏥",
};
function getCategoryEmoji(cat) {
  return emojiMap[cat] || "📍";
}

async function requestLocation() {
  try {
    await geo.getCurrentPosition();
    locationReady.value = true;
  } catch {
    locationReady.value = false;
  }
}
function onInput() {
  if (!query.value.trim()) {
    searched.value = false;
    results.value = [];
  }
}
function clearSearch() {
  query.value = "";
  searched.value = false;
  results.value = [];
  nextTick(() => inputRef.value?.focus());
}
function selectCategory(cat) {
  query.value = cat;
  handleSearch();
}

async function handleSearch() {
  if (!query.value.trim()) return;
  isSearching.value = true;
  searched.value = true;
  try {
    const data = await searchStore.search(
      query.value.trim(),
      geo.latitude.value || 6.5059,
      geo.longitude.value || 3.3481,
      radius.value
    );
    results.value = data.places;
  } catch {
    results.value = [];
  } finally {
    isSearching.value = false;
  }
}
async function toggleSave(place) {
  try {
    if (savedIds.value.has(place.id)) {
      await searchStore.removeSavedPlace(place.id);
      savedIds.value.delete(place.id);
    } else {
      await searchStore.savePlace(place.id);
      savedIds.value.add(place.id);
    }
    savedIds.value = new Set(savedIds.value);
  } catch (err) {
    console.error(err);
  }
}
async function getDirections(place) {
  try {
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
onMounted(async () => {
  try {
    await geo.getCurrentPosition();
    locationReady.value = true;
  } catch {
    locationReady.value = false;
  }
  const q = route.query.q;
  if (q) {
    query.value = q;
    await handleSearch();
  } else {
    nextTick(() => inputRef.value?.focus());
  }
});
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