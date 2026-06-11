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
  BadgeDollarSign,
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
    label: "Solicitudes de Crédito",
    path: "/credit-requests",
    icon: BadgeDollarSign,
    roles: ["ADMIN_ROLE"],
  },
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
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#d7bc73]/45
        bg-[#f8f0dd]/88 shadow-[24px_0_70px_rgba(92,64,19,0.12)] backdrop-blur-2xl
        transition-transform duration-300
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="relative border-b border-[#d7bc73]/38 px-5 py-5">
        <div className="premium-gold-line absolute bottom-0 left-6 right-6 h-px" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#c89b3c]/45 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_10px_24px_rgba(154,107,22,0.24)]">
              <Landmark size={20} className="text-[#5b3a0d]" />
            </div>

            <div>
              <span className="block text-lg font-black tracking-tight text-[#3f2c12]">
                BankManager
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-[#9a6b16]/70">
                Premium Banking
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-[#d7bc73]/45 p-2 text-[#8a611b] transition-all hover:bg-white/70 hover:text-[#3f2c12] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-5">
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
                `group relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? "border-[#b98a23]/55 bg-white/72 text-[#3f2c12] shadow-[0_12px_28px_rgba(125,82,13,0.16)]"
                    : "border-transparent text-[#6f5a33] hover:border-[#d7bc73]/45 hover:bg-white/50 hover:text-[#3f2c12]"
                }`
              }
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  active
                    ? "bg-linear-to-br from-[#fff1bd] to-[#b98219] text-[#4a2f0c] shadow-[0_10px_20px_rgba(154,107,22,0.22)]"
                    : "bg-[#efe0bd]/58 text-[#8a611b] group-hover:bg-[#f9edc9]"
                }`}
              >
                <Icon size={17} />
              </span>

              <span className="leading-none">{displayLabel}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[#d7bc73]/38 p-4">
        <button
          onClick={logout}
          className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-[#8a6a3a] transition-all hover:border-red-200 hover:bg-red-50/70 hover:text-red-700"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#efe0bd]/55 text-[#8a611b] transition-all group-hover:bg-red-100 group-hover:text-red-700">
            <LogOut size={18} />
          </span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;