import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";

export const useSearchStore = defineStore("search", () => {
  const results = ref([]);
  const history = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const lastQuery = ref("");
  const selectedPlace = ref(null);
  const directions = ref(null);

  async function search(query, latitude, longitude, radius = 5) {
    isLoading.value = true;
    error.value = null;
    lastQuery.value = query;

    try {
      const { data } = await api.get("/search", {
        params: { query, latitude, longitude, radius },
      });
      results.value = data.places;
      return data;
    } catch (err) {
      error.value = err.response?.data?.error || "Search failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchHistory() {
    const { data } = await api.get("/search/history");
    history.value = data.history;
    return data;
  }

  async function getDirections(placeId, originLat, originLng) {
    const { data } = await api.get("/places/directions", {
      params: { placeId, originLat, originLng },
    });
    directions.value = data;
    return data;
  }

  async function savePlace(placeId, note = null) {
    const { data } = await api.post("/places/saved", { placeId, note });
    return data;
  }

  async function getSavedPlaces() {
    const { data } = await api.get("/places/saved/me");
    return data;
  }

  async function removeSavedPlace(placeId) {
    const { data } = await api.delete(`/places/saved/${placeId}`);
    return data;
  }

  function selectPlace(place) {
    selectedPlace.value = place;
  }

  function clearResults() {
    results.value = [];
    selectedPlace.value = null;
    directions.value = null;
  }

  return {
    results,
    history,
    isLoading,
    error,
    lastQuery,
    selectedPlace,
    directions,
    search,
    fetchHistory,
    getDirections,
    savePlace,
    getSavedPlaces,
    removeSavedPlace,
    selectPlace,
    clearResults,
  };
});
