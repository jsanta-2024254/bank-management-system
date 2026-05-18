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
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 transform
        lg:relative lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      style={{
        backgroundColor: "#100b04",
        borderRight: "1px solid rgba(184,137,42,0.18)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="p-6 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(184,137,42,0.12)" }}
      >
        <div className="flex items-center gap-3">
          {/* Ícono cofre dorado */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #b8892a 0%, #8a6318 100%)",
              boxShadow: "0 4px 16px rgba(184,137,42,0.30)",
            }}
          >
            <Landmark size={17} style={{ color: "#0e0a05" }} />
          </div>
          <span
            className="font-display text-lg tracking-wide"
            style={{ color: "#d4a843", fontFamily: "var(--font-display)" }}
          >
            BankManager
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg lg:hidden transition-colors"
          style={{ color: "var(--texto-tenue)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--oro-claro)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--texto-tenue)"}
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Rol del usuario ── */}
      <div
        className="px-6 py-3"
        style={{ borderBottom: "1px solid rgba(184,137,42,0.08)" }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-[0.25em]"
          style={{ color: "var(--texto-tenue)" }}
        >
          {role === "ADMIN_ROLE" ? "Administrador" : "Cliente"}
        </p>
        <p
          className="text-xs mt-0.5 truncate"
          style={{ color: "var(--texto-claro)" }}
        >
          {user?.username || user?.email || "Usuario"}
        </p>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
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
              key={item.path + item.label}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all group"
              style={
                active
                  ? {
                      background: "linear-gradient(90deg, rgba(184,137,42,0.18) 0%, rgba(184,137,42,0.06) 100%)",
                      borderLeft: "2px solid var(--oro-medio)",
                      color: "var(--oro-claro)",
                      fontWeight: 600,
                    }
                  : {
                      borderLeft: "2px solid transparent",
                      color: "var(--texto-tenue)",
                    }
              }
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "rgba(184,137,42,0.07)";
                  e.currentTarget.style.color = "var(--texto-claro)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.color = "var(--texto-tenue)";
                }
              }}
            >
              <Icon
                size={16}
                style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}
              />
              <span style={{ fontFamily: "var(--font-body)" }}>
                {displayLabel}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* ── Línea decorativa ── */}
      <div className="linea-oro mx-4" />

      {/* ── Cerrar sesión ── */}
      <div className="p-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all group"
          style={{
            color: "var(--texto-tenue)",
            borderLeft: "2px solid transparent",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = "rgba(200,60,60,0.08)";
            e.currentTarget.style.color = "#c87a7a";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "";
            e.currentTarget.style.color = "var(--texto-tenue)";
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-body)" }}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;