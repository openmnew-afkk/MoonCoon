import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Heart,
  MessageSquare,
  TrendingUp,
  Shield,
  Ban,
  UserCheck,
  Search,
  X,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  isBanned: boolean;
  posts: number;
  followers: number;
  joinedAt: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export default function Admin() {
  const { user } = useTelegram();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    usersChange: "+0% на этой неделе",
    postsChange: "+0% на этой неделе",
    likesChange: "+0% на этой неделе",
    commentsChange: "+0% на этой неделе",
  });

  // Проверка прав администратора
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        setAuthChecked(true);
        return;
      }

      try {
        // Проверяем статус админа по userId и username
        const params = new URLSearchParams({ userId: user.id.toString() });
        if (user.username) {
          params.append("username", user.username);
        }

        console.log("🔍 Проверяем админ статус для:", {
          userId: user.id,
          username: user.username,
          url: `/api/admin/check?${params}`,
        });

        const response = await fetch(`/api/admin/check?${params}`);

        console.log("🌐 Ответ сервера:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("🔑 Admin check result:", data);
          if (data.isAdmin) {
            setIsAdmin(true);
            localStorage.setItem("admin_session", `admin_${user.id}`);
            loadUsers();
            loadAdminStats();
          } else {
            console.log("❌ Пользователь не является админом");
          }
        } else {
          const errorText = await response.text();
          console.error("❌ Ошибка HTTP:", response.status, errorText);
        }
      } catch (error) {
        console.error("❌ Ошибка сети или подключения к серверу:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAdmin();
  }, [user]);

  const loadUsers = async () => {
    const adminSession = localStorage.getItem("admin_session");
    if (!adminSession) return;

    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${adminSession}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = async () => {
    const adminSession = localStorage.getItem("admin_session");
    if (!adminSession) return;

    try {
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${adminSession}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminStats(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки статистики:", error);
    }
  };

  const handleSetAdmin = async (userId: string, isAdmin: boolean) => {
    const adminSession = localStorage.getItem("admin_session");
    if (!adminSession) return;

    try {
      const response = await fetch("/api/admin/set-admin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminSession}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, isAdmin }),
      });

      if (response.ok) {
        await loadUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Ошибка изменения прав:", error);
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    const adminSession = localStorage.getItem("admin_session");
    if (!adminSession) return;

    try {
      const response = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminSession}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, isBanned, reason: banReason }),
      });

      if (response.ok) {
        await loadUsers();
        setSelectedUser(null);
        setBanReason("");
      }
    } catch (error) {
      console.error("Ошибка бана пользователя:", error);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.includes(searchQuery),
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="text-primary" size={28} />
                Панель администратора
              </h1>
              <p className="text-sm text-muted-foreground">
                Управление приложением
              </p>
            </div>
          </div>
        </div>
      </div>

      {!authChecked ? (
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-muted-foreground">Проверка прав доступа...</p>
          </div>
        </div>
      ) : !isAdmin ? (
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="text-primary mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">Доступ запрещен</h2>
            <p className="text-sm text-muted-foreground">У вас нет прав администратора</p>
          </div>
        </div>
      ) : (
      <div
        className="max-w-6xl mx-auto px-4 py-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 7rem)" }}
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass-card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground">Всего пользователей</p>
              <Users className="text-primary" size={24} />
            </div>
            <p className="text-2xl font-bold mb-1">{formatNumber(adminStats.totalUsers)}</p>
            <p className="text-xs text-primary">{adminStats.usersChange}</p>
          </div>
          <div className="glass-card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground">Активные посты</p>
              <TrendingUp className="text-accent" size={24} />
            </div>
            <p className="text-2xl font-bold mb-1">{formatNumber(adminStats.totalPosts)}</p>
            <p className="text-xs text-primary">{adminStats.postsChange}</p>
          </div>
          <div className="glass-card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground">Всего лайков</p>
              <Heart className="text-red-500" size={24} />
            </div>
            <p className="text-2xl font-bold mb-1">{formatNumber(adminStats.totalLikes)}</p>
            <p className="text-xs text-primary">{adminStats.likesChange}</p>
          </div>
          <div className="glass-card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground">Сообщений</p>
              <MessageSquare className="text-primary" size={24} />
            </div>
            <p className="text-2xl font-bold mb-1">{formatNumber(adminStats.totalComments)}</p>
            <p className="text-xs text-primary">{adminStats.commentsChange}</p>
          </div>
        </div>

        {/* Users Management */}
        <div className="glass-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="text-primary" size={20} />
              Управление пользователями
            </h3>
            <button
              onClick={loadUsers}
              className="glass-button text-sm px-3 py-1.5"
            >
              Обновить
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск пользователей..."
              className="w-full glass-morphism rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Users List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm text-muted-foreground mt-4">
                Загрузка пользователей...
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Пользователи не найдены
                </p>
              ) : (
                filteredUsers.map((userItem) => (
                  <div
                    key={userItem.id}
                    className="flex items-center justify-between p-3 bg-glass-light/30 rounded-xl hover:bg-glass-light/50 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">
                          {userItem.name}
                        </p>
                        {userItem.isAdmin && (
                          <Shield
                            className="text-primary flex-shrink-0"
                            size={14}
                          />
                        )}
                        {userItem.isBanned && (
                          <Ban
                            className="text-red-500 flex-shrink-0"
                            size={14}
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {userItem.username}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Посты: {userItem.posts}</span>
                        <span>Подписчики: {userItem.followers}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedUser(userItem)}
                        className="glass-button px-3 py-1.5 text-xs"
                      >
                        Управление
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Management Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Управление пользователем</h3>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setBanReason("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.username}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {selectedUser.isAdmin && (
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                      Администратор
                    </span>
                  )}
                  {selectedUser.isBanned && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs">
                      Забанен
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-glass-light/10 pt-4">
                <button
                  onClick={() =>
                    handleSetAdmin(selectedUser.id, !selectedUser.isAdmin)
                  }
                  className={`w-full glass-button rounded-xl py-2.5 flex items-center justify-center gap-2 ${
                    selectedUser.isAdmin
                      ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                      : "bg-primary/20 text-primary hover:bg-primary/30"
                  }`}
                >
                  {selectedUser.isAdmin ? (
                    <>
                      <Shield size={18} />
                      Отозвать права админа
                    </>
                  ) : (
                    <>
                      <UserCheck size={18} />
                      Выдать права админа
                    </>
                  )}
                </button>

                {selectedUser.isBanned ? (
                  <button
                    onClick={() => handleBanUser(selectedUser.id, false)}
                    className="w-full glass-button rounded-xl py-2.5 bg-green-500/20 text-green-500 hover:bg-green-500/30 flex items-center justify-center gap-2"
                  >
                    <UserCheck size={18} />
                    Разбанить пользователя
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Причина бана (необязательно)"
                      className="w-full glass-morphism rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={() => handleBanUser(selectedUser.id, true)}
                      className="w-full glass-button rounded-xl py-2.5 bg-red-500/20 text-red-500 hover:bg-red-500/30 flex items-center justify-center gap-2"
                    >
                      <Ban size={18} />
                      Забанить пользователя
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
