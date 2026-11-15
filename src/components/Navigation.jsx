import { NavLink } from "react-router-dom";
import { Globe2, UploadCloud } from "lucide-react";

const LINKS = [
  { to: "/", label: "Jukebox", Icon: Globe2 },
  { to: "/studio", label: "Audio Studio", Icon: UploadCloud },
];

export default function Navigation() {
  return (
    <nav
      aria-label="Main"
      className="flex justify-center gap-8 py-6 border-b border-zinc-700 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50"
    >
      {LINKS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex items-center gap-2 font-semibold rounded px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
              isActive ? "text-purple-300" : "text-zinc-300 hover:text-white"
            }`
          }
        >
          <Icon size={20} aria-hidden="true" /> {label}
        </NavLink>
      ))}
    </nav>
  );
}