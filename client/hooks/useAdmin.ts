import { useCallback, useEffect, useState } from "react";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  const checkAdmin = useCallback(async () => {
    const token = localStorage.getItem("admin_session");
    if (!token) {
      setIsAdmin(false);
      setChecked(true);
      return;
    }
    try {
      const res = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(!!data.isAdmin);
      } else {
        setIsAdmin(false);
        localStorage.removeItem("admin_session");
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  return { isAdmin, checked, refreshAdmin: checkAdmin };
}
