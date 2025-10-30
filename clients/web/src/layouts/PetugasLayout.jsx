import React, { useEffect, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  MoreVertical,
  UserRound,
  LogOut,
  Menu,
} from "lucide-react";
import { useAppConfig } from "../lib/useAppConfig";
import { updateMyProfile } from "../lib/utils/user";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
    isActive
      ? "bg-neutral-800 text-white"
      : "text-neutral-300 hover:bg-neutral-800/70"
  }`;

const PetugasLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { apiUrl } = useAppConfig();
  const userStr =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const [user, setUser] = useState(userStr ? JSON.parse(userStr) : null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nama, setNama] = useState(user?.nama_pengguna || "");
  const [username, setUsername] = useState(user?.username || "");
  const [alert, setAlert] = useState(null);
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  const onLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuOpen) return;
      const target = e.target;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setEditOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  const openEdit = () => {
    setNama(user?.nama_pengguna || "");
    setUsername(user?.username || "");
    setEditOpen(true);
    setMenuOpen(false);
  };

  const saveProfile = async (e) => {
    e?.preventDefault?.();
    try {
      if (!nama && !username) {
        setAlert({
          type: "destructive",
          title: "Perhatian",
          description: "Tidak ada perubahan untuk disimpan",
        });
        return;
      }
      setSaving(true);
      await updateMyProfile(apiUrl, {
        nama_pengguna: nama,
        username,
      });
      const next = {
        ...user,
        nama_pengguna: nama || user?.nama_pengguna,
        username: username || user?.username,
      };
      localStorage.setItem("user", JSON.stringify(next));
      setUser(next);
      setAlert({
        type: "default",
        title: "Berhasil",
        description: "Profil Anda berhasil diperbarui",
      });
      setEditOpen(false);
    } catch (err) {
      setAlert({
        type: "destructive",
        title: "Gagal",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memperbarui profil",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="grid grid-cols-12 min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2 border-r border-neutral-800 bg-neutral-900/60 sticky top-0 h-screen overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Brand */}
            <div className="px-4 h-14 border-b border-neutral-800 flex items-center gap-2">
              <div className="size-7 rounded-md bg-neutral-800/80 border border-neutral-700 text-orange-400 flex items-center justify-center">
                <span className="text-sm font-bold">⌘</span>
              </div>
              <span className="font-semibold tracking-wide">Petugas</span>
            </div>
            {/* Nav */}
            <nav className="p-3 space-y-1">
              <div className="text-sm font-semibold tracking-wide text-neutral-500 px-2 mb-3">
                Menu
              </div>
              <>
                <NavLink to="/petugas" end className={linkClass}>
                  <LayoutDashboard className="size-4 text-neutral-400" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/petugas/pengaduan" className={linkClass}>
                  <ClipboardList className="size-4 text-neutral-400" />
                  <span>Kelola Pengaduan</span>
                </NavLink>
              </>
            </nav>
            {/* Spacer */}
            <div className="flex-1" />
            <div className="p-3 border-t border-neutral-800">
              <div className="relative flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800/70">
                <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden">
                  <span className="text-sm font-semibold">
                    {user?.nama_pengguna
                      ? user.nama_pengguna[0]?.toUpperCase()
                      : "P"}
                  </span>
                </div>
                <div className="min-w-0 mr-auto">
                  <div className="text-sm font-medium truncate">
                    {user?.nama_pengguna || "Petugas"}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">
                    {user?.username || "username"}
                  </div>
                </div>
                <button
                  ref={menuBtnRef}
                  aria-label="More options"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="ml-2 p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100"
                >
                  <MoreVertical className="size-4" />
                </button>
                {menuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-1.5 bottom-14 z-50 w-55 rounded-lg border border-neutral-800 bg-neutral-900/95 shadow-lg backdrop-blur-sm"
                  >
                    <div className="px-3 py-2 border-b border-neutral-800">
                      <div className="text-sm font-medium truncate">
                        {user?.nama_pengguna || "Petugas"}
                      </div>
                      <div className="text-xs text-neutral-400 truncate">
                        {user?.username || "username"}
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={openEdit}
                        className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <UserRound className="size-4 text-neutral-300" />
                        Edit Profile
                      </button>
                      <div className="my-1 h-px bg-neutral-800" />
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 flex items-center gap-2"
                      >
                        <LogOut className="size-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10 p-0 lg:p-0">
          {/* Top content header matches sidebar height and border */}
          <div className="h-14 px-4 lg:px-6 flex items-center gap-2 border-b border-neutral-800">
            {/* Hamburger for mobile */}
            <button
              type="button"
              aria-label="Open navigation"
              className="md:hidden p-2 rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800"
              onClick={() => setNavOpen(true)}
            >
              <Menu className="size-4" />
            </button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {location.pathname === "/petugas" ? (
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to="/petugas">Dashboard</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {location.pathname !== "/petugas" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {location.pathname.startsWith("/petugas/pengaduan") && (
                        <BreadcrumbPage>Kelola Pengaduan</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {alert && (
            <Alert
              floating
              position="top-center"
              variant={alert.type}
              onClose={() => setAlert(null)}
              duration={3500}
            >
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          )}
          <div className="p-4 lg:p-6">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      {/* Mobile Navigation Drawer */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side="left"
          className="border-neutral-800 bg-neutral-900/95 w-72 sm:w-80"
        >
          {/* A11y: Provide title and description for dialog */}
          <SheetHeader className="sr-only">
            <SheetTitle>Navigasi</SheetTitle>
            <SheetDescription>Menu navigasi petugas</SheetDescription>
          </SheetHeader>
          <div className="flex items-center gap-2 mb-4 mt-1">
            <div className="size-7 rounded-md bg-neutral-800/80 border border-neutral-700 text-orange-400 flex items-center justify-center">
              <span className="text-sm font-bold">⌘</span>
            </div>
            <span className="font-semibold tracking-wide text-neutral-100">
              Petugas
            </span>
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/petugas"
              end
              className={linkClass}
              onClick={() => setNavOpen(false)}
            >
              <LayoutDashboard className="size-4 text-neutral-400" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/petugas/pengaduan"
              className={linkClass}
              onClick={() => setNavOpen(false)}
            >
              <ClipboardList className="size-4 text-neutral-400" />
              <span>Kelola Pengaduan</span>
            </NavLink>
          </nav>
          <div className="mt-6 border-t border-neutral-800 pt-4 space-y-2">
            <button
              onClick={() => {
                setNavOpen(false);
                setMenuOpen(false);
                setNama(user?.nama_pengguna || "");
                setUsername(user?.username || "");
                setEditOpen(true);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-md bg-neutral-800/60 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 flex items-center gap-2"
            >
              <UserRound className="size-4 text-neutral-300" /> Edit Profile
            </button>
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-sm rounded-md border border-neutral-800 text-red-300 hover:bg-red-500/10 hover:text-red-200 flex items-center gap-2"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </div>
        </SheetContent>
      </Sheet>
      {/* Edit Profile Modal */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent
          side="right"
          className="border-neutral-800 bg-neutral-900/95"
        >
          <SheetHeader>
            <SheetTitle className="text-neutral-100">Edit Profile</SheetTitle>
            <SheetDescription className="text-neutral-400">
              Perbarui nama atau username.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={saveProfile} className="px-4 pb-4 space-y-3">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">
                Nama
              </label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 px-3 py-2"
                placeholder="Nama lengkap"
                type="text"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-1">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 px-3 py-2"
                placeholder="Username"
                type="text"
              />
            </div>
            <SheetFooter className="mt-4">
              <SheetClose asChild>
                <button
                  type="button"
                  className="px-3 py-2 text-sm rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                >
                  Batal
                </button>
              </SheetClose>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PetugasLayout;
