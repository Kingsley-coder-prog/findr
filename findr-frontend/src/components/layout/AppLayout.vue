<template>
  <div class="min-h-screen bg-base">
    <aside
      class="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40"
      style="
        width: 260px;
        background: #111720;
        border-right: 1px solid rgba(255, 255, 255, 0.07);
      "
    >
      <!-- Logo -->
      <div style="padding: 28px 24px 20px">
        <div style="display: flex; align-items: center; gap: 10px">
          <div style="width: 28px; height: 28px; flex-shrink: 0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="#00d2be"
              />
              <circle cx="12" cy="9" r="2.8" fill="#111720" />
            </svg>
          </div>
          <span
            style="
              font-size: 1.25rem;
              font-weight: 600;
              letter-spacing: -0.04em;
              color: #e8edf5;
            "
            >findr</span
          >
        </div>
      </div>

      <!-- Nav label -->
      <div style="padding: 0 24px 8px">
        <span
          style="
            font-size: 0.65rem;
            font-weight: 700;
            color: #3d4a5c;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          "
          >Menu</span
        >
      </div>

      <!-- Nav items -->
      <nav
        style="
          flex: 1;
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        "
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :style="
            $route.path === item.to
              ? 'display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:12px; background:rgba(0,210,190,0.12); color:#00d2be; text-decoration:none; font-size:0.875rem; font-weight:600;'
              : 'display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:12px; color:#6b7a8d; text-decoration:none; font-size:0.875rem; font-weight:500; transition:all 0.15s;'
          "
          @mouseenter="
            (e) => {
              if ($route.path !== item.to)
                e.currentTarget.style.background = '#1a2332';
              e.currentTarget.style.color = '#e8edf5';
            }
          "
          @mouseleave="
            (e) => {
              if ($route.path !== item.to)
                e.currentTarget.style.background = '';
              e.currentTarget.style.color = '#6b7a8d';
            }
          "
        >
          <component
            :is="item.icon"
            style="width: 18px; height: 18px; flex-shrink: 0"
          />
          <span>{{ item.label }}</span>
          <span
            v-if="$route.path === item.to"
            style="
              margin-left: auto;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #00d2be;
            "
          ></span>
        </RouterLink>
      </nav>

      <!-- User -->
      <div
        style="
          padding: 16px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        "
      >
        <div
          @click="handleLogout"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.15s;
          "
          @mouseenter="(e) => (e.currentTarget.style.background = '#1a2332')"
          @mouseleave="(e) => (e.currentTarget.style.background = '')"
        >
          <div
            style="
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background: rgba(0, 210, 190, 0.15);
              border: 1px solid rgba(0, 210, 190, 0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            "
          >
            <span
              style="
                color: #00d2be;
                font-weight: 700;
                font-size: 0.8rem;
                text-transform: uppercase;
              "
              >{{ userInitial }}</span
            >
          </div>
          <div style="flex: 1; min-width: 0">
            <p
              style="
                font-size: 0.875rem;
                font-weight: 600;
                color: #e8edf5;
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ auth.user?.name }}
            </p>
            <p
              style="
                font-size: 0.72rem;
                color: #6b7a8d;
                margin: 0;
                text-transform: capitalize;
              "
            >
              {{ auth.user?.plan }} plan
            </p>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7a8d"
            stroke-width="2"
            style="width: 15px; height: 15px; flex-shrink: 0"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
      </div>
    </aside>

    <div class="min-h-screen lg:ml-[260px]">
      <main class="pb-24 lg:pb-8">
        <RouterView />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav
      class="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style="
        background: rgba(17, 23, 32, 0.97);
        backdrop-filter: blur(24px);
        border-top: 1px solid rgba(255, 255, 255, 0.07);
      "
    >
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 8px 4px 12px;
        "
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            text-decoration: none;
            min-width: 52px;
          "
        >
          <div
            :style="
              $route.path === item.to
                ? 'width:40px; height:40px; border-radius:12px; background:rgba(0,210,190,0.15); display:flex; align-items:center; justify-content:center; color:#00d2be;'
                : 'width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#6b7a8d;'
            "
          >
            <component :is="item.icon" style="width: 20px; height: 20px" />
          </div>
          <span
            :style="
              $route.path === item.to
                ? 'font-size:0.6rem; font-weight:700; color:#00d2be;'
                : 'font-size:0.6rem; font-weight:500; color:#6b7a8d;'
            "
            >{{ item.label }}</span
          >
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, h } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const userInitial = computed(
  () => auth.user?.name?.charAt(0)?.toUpperCase() || "U"
);
async function handleLogout() {
  await auth.logout();
}

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

const navItems = [
  { to: "/home", label: "Home", icon: HomeIcon },
  { to: "/search", label: "Search", icon: SearchIcon },
  { to: "/saved", label: "Saved", icon: BookmarkIcon },
  { to: "/agent", label: "Agent", icon: AgentIcon },
  { to: "/profile", label: "Profile", icon: ProfileIcon },
];
</script>