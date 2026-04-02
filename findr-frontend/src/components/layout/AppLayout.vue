<template>
  <div class="min-h-screen bg-base flex">
    <!-- Desktop Sidebar -->
    <aside
      class="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-30"
    >
      <!-- Logo -->
      <div class="flex items-center gap-2.5 px-6 py-6 border-b border-border">
        <div class="w-7 h-7 text-accent shrink-0">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="currentColor"
            />
            <circle cx="12" cy="9" r="2.5" fill="#111720" />
          </svg>
        </div>
        <span class="text-[1.25rem] font-bold tracking-[-0.04em] text-text"
          >findr</span
        >
      </div>

      <!-- Nav links -->
      <nav class="flex flex-col gap-1 px-3 py-4 flex-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
            $route.path === item.to
              ? 'bg-accent/15 text-accent'
              : 'text-muted hover:text-text hover:bg-hover',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="px-3 py-4 border-t border-border">
        <div
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-hover transition-colors cursor-pointer"
          @click="handleLogout"
        >
          <div
            class="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0"
          >
            <span class="text-accent text-xs font-bold uppercase">{{
              userInitial
            }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-text truncate">
              {{ auth.user?.name }}
            </p>
            <p class="text-xs text-muted truncate">
              {{ auth.user?.plan }} plan
            </p>
          </div>
          <LogOutIcon class="w-4 h-4 text-muted shrink-0" />
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 lg:ml-64 flex flex-col min-h-screen">
      <div class="flex-1 pb-20 lg:pb-0">
        <RouterView />
      </div>
    </main>

    <!-- Mobile bottom nav -->
    <nav
      class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border"
    >
      <div class="flex items-center justify-around px-2 py-2 safe-pb">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 min-w-[56px]',
            $route.path === item.to
              ? 'text-accent'
              : 'text-muted hover:text-text',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-[0.65rem] font-medium">{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, h } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const route = useRoute();

const userInitial = computed(() => auth.user?.name?.charAt(0) || "U");

async function handleLogout() {
  await auth.logout();
}

// Icon components as render functions
const HomeIcon = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("path", { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" }),
        h("polyline", { points: "9 22 9 12 15 12 15 22" }),
      ]
    ),
};

const SearchIcon = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("circle", { cx: "11", cy: "11", r: "8" }),
        h("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
      ]
    ),
};

const BookmarkIcon = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [h("path", { d: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" })]
    ),
};

const AgentIcon = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("path", {
          d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
        }),
      ]
    ),
};

const ProfileIcon = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("path", { d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" }),
        h("circle", { cx: "12", cy: "7", r: "4" }),
      ]
    ),
};

const LogOutIcon = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("path", { d: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" }),
        h("polyline", { points: "16 17 21 12 16 7" }),
        h("line", { x1: "21", y1: "12", x2: "9", y2: "12" }),
      ]
    ),
};

const navItems = [
  { to: "/home", label: "Home", icon: HomeIcon },
  { to: "/search", label: "Search", icon: SearchIcon },
  { to: "/saved", label: "Saved", icon: BookmarkIcon },
  { to: "/agent", label: "Agent", icon: AgentIcon },
  { to: "/profile", label: "Profile", icon: ProfileIcon },
];
</script>

<style>
.safe-pb {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}
</style>