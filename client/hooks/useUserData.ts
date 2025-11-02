import { useState, useEffect } from "react";
import { useTelegram } from "./useTelegram";

export interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  stats: UserStats;
  isAdmin: boolean;
}

const defaultStats: UserStats = {
  posts: 0,
  followers: 0,
  following: 0,
};

export function useUserData() {
  const { user } = useTelegram();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user?.id) {
          // В реальном приложении здесь должен быть запрос к API
          // Пока используем данные из Telegram
          const userProfile: UserProfile = {
            id: user.id.toString(),
            name: user.first_name + (user.last_name ? ` ${user.last_name}` : ""),
            username: user.username || `user_${user.id}`,
            avatar: user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            bio: "📱 Telegram Mini App | 🎨 Дизайнер | ✨ Создатель",
            stats: defaultStats,
            isAdmin: false, // В реальном приложении проверяется через API
          };

          // Загружаем статистику с сервера
          const response = await fetch(`/api/users/${user.id}/stats`);
          if (response.ok) {
            const stats = await response.json();
            userProfile.stats = stats;
          }

          // Проверяем админ права
          const adminResponse = await fetch(`/api/users/${user.id}/admin`);
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            userProfile.isAdmin = adminData.isAdmin || false;
          }

          setProfile(userProfile);
        } else {
          // Для демо без Telegram
          setProfile({
            id: "0",
            name: "Пользователь",
            username: "@user",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
            bio: "📱 Telegram Mini App | 🎨 Дизайнер | ✨ Создатель",
            stats: defaultStats,
            isAdmin: false,
          });
        }
      } catch (error) {
        console.error("Ошибка загрузки данных пользователя:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  return { profile, loading, setProfile };
}

