import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", label: "홈" },
  { to: "/review", label: "복습" },
  { to: "/library", label: "코스" },
  { to: "/settings", label: "설정" }
];

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-full bg-white/95 p-2 shadow-soft backdrop-blur">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) =>
            `flex-1 rounded-full px-4 py-3 text-center text-sm font-semibold transition ${
              isActive ? "bg-ink text-white" : "text-ink/55"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
