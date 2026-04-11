import { ref } from "vue";

export function useGeolocation() {
  const latitude = ref(null);
  const longitude = ref(null);
  const error = ref(null);
  const isLoading = ref(false); // New loading state

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        error.value = "Geolocation is not supported by your browser";
        reject(error.value);
        return;
      }

      isLoading.value = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude.value = position.coords.latitude;
          longitude.value = position.coords.longitude;
          isLoading.value = false;
          resolve({ latitude: latitude.value, longitude: longitude.value });
        },
        (err) => {
          isLoading.value = false;
          error.value =
            err.code === 1
              ? "Location access denied. Please enable location in your browser."
              : "Unable to get your location. Please try again.";
          reject(error.value);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }

  return { latitude, longitude, error, isLoading, getCurrentPosition };
}
