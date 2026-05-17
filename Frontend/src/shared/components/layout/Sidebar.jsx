import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  ArrowLeftRight,
  TrendingUp,
  Package,
  LogOut,
  X,
  Banknote,
  ClipboardCheck,
  Landmark,
  User,
  Star,
} from "lucide-react";
import useAuthStore from "../../../features/auth/store/authStore";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN_ROLE", "USER_ROLE"],
  },
  {
    label: "Cuentas",
    path: "/accounts",
    icon: CreditCard,
    roles: ["ADMIN_ROLE", "USER_ROLE"],
  },
  {
    label: "Transacciones",
    path: "/transactions",
    icon: ArrowLeftRight,
    roles: ["ADMIN_ROLE", "USER_ROLE"],
  },
  {
    label: "Solicitudes de Depósito",
    path: "/deposit-requests",
    icon: ClipboardCheck,
    roles: ["ADMIN_ROLE"],
  },
  {
    label: "Solicitar Depósito",
    path: "/deposit-requests",
    icon: Banknote,
    roles: ["USER_ROLE"],
  },
  { label: "Favoritos", path: "/favorites", icon: Star, roles: ["USER_ROLE"] },
  {
    label: "Depósitos",
    path: "/deposits",
    icon: TrendingUp,
    roles: ["ADMIN_ROLE"],
  },
  {
    label: "Productos",
    path: "/products",
    icon: Package,
    roles: ["ADMIN_ROLE", "USER_ROLE"],
  },
  { label: "Usuarios", path: "/users", icon: Users, roles: ["ADMIN_ROLE"] },
  {
    label: "Mi Perfil",
    path: "/profile",
    icon: User,
    roles: ["ADMIN_ROLE", "USER_ROLE"],
  },
];

const getUserRole = (user) => {
  return (
    user?.role ||
    user?.Role ||
    user?.roles?.[0] ||
    user?.Roles?.[0] ||
    "USER_ROLE"
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const role = getUserRole(user);
  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 flex flex-col border-r border-zinc-800 transition-transform duration-300 transform
                lg:relative lg:translate-x-0
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
    >
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Landmark size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">
            BankManager
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-zinc-500 hover:text-white lg:hidden transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filtered.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          const displayLabel =
            item.path === "/products" && role !== "ADMIN_ROLE"
              ? "Catálogo"
              : item.label;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={() =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group ${
                  active
                    ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {displayLabel}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-xl text-sm transition-all group"
        >
          <LogOut
            size={18}
            className="group-hover:text-red-400 transition-colors"
          />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
