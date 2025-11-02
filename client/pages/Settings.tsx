import { Settings as SettingsIcon, Bell, Lock, Palette, Globe, LogOut } from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="glass-card rounded-none border-b border-glass-light/10 sticky top-0 z-20 ios-shadow">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="text-primary" size={28} />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">Customize your experience</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Account Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Account</h3>
          <div className="space-y-2">
            <button className="w-full glass-card flex items-center justify-between p-4 hover:bg-glass-light/40 transition-all rounded-2xl">
              <span>Email & Password</span>
              <span className="text-muted-foreground">→</span>
            </button>
            <button className="w-full glass-card flex items-center justify-between p-4 hover:bg-glass-light/40 transition-all rounded-2xl">
              <span>Two-Factor Authentication</span>
              <span className="text-muted-foreground">→</span>
            </button>
            <button className="w-full glass-card flex items-center justify-between p-4 hover:bg-glass-light/40 transition-all rounded-2xl">
              <span>Linked Accounts</span>
              <span className="text-muted-foreground">→</span>
            </button>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Lock className="text-primary" size={20} />
            Privacy & Security
          </h3>
          <div className="space-y-3">
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span>Private Account</span>
              <input type="checkbox" className="w-4 h-4" />
            </label>
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span>Allow DMs from Anyone</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </label>
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span>Show Online Status</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </label>
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span>Activity Status</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Bell className="text-primary" size={20} />
            Notifications
          </h3>
          <div className="space-y-3">
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span>Posts from Followers</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </label>
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span>Likes & Comments</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </label>
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span>Direct Messages</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </label>
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span>Follow Suggestions</span>
              <input type="checkbox" className="w-4 h-4" />
            </label>
          </div>
        </div>

        {/* Display & Theme */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Palette className="text-primary" size={20} />
            Display & Theme
          </h3>
          <div className="space-y-3">
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-sm font-medium mb-2">Theme</p>
              <div className="flex gap-2">
                <button className="flex-1 glass-button rounded-xl bg-primary/20 text-primary font-medium">
                  Dark
                </button>
                <button className="flex-1 glass-button rounded-xl opacity-50">
                  Light
                </button>
                <button className="flex-1 glass-button rounded-xl opacity-50">
                  Auto
                </button>
              </div>
            </div>
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span>Reduce Motion</span>
              <input type="checkbox" className="w-4 h-4" />
            </label>
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span>Accessibility Mode</span>
              <input type="checkbox" className="w-4 h-4" />
            </label>
          </div>
        </div>

        {/* Language & Region */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="text-primary" size={20} />
            Language & Region
          </h3>
          <div className="space-y-2">
            <button className="w-full glass-card flex items-center justify-between p-4 hover:bg-glass-light/40 transition-all rounded-2xl">
              <span>Language</span>
              <span className="text-muted-foreground">English →</span>
            </button>
            <button className="w-full glass-card flex items-center justify-between p-4 hover:bg-glass-light/40 transition-all rounded-2xl">
              <span>Region</span>
              <span className="text-muted-foreground">United States →</span>
            </button>
            <button className="w-full glass-card flex items-center justify-between p-4 hover:bg-glass-light/40 transition-all rounded-2xl">
              <span>Time Format</span>
              <span className="text-muted-foreground">12-hour →</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-red-500">Danger Zone</h3>
          <div className="space-y-2">
            <button className="w-full glass-card p-4 hover:bg-red-500/10 transition-all rounded-2xl text-red-500 font-medium">
              Download Your Data
            </button>
            <button className="w-full glass-card p-4 hover:bg-red-500/10 transition-all rounded-2xl text-red-500 font-medium flex items-center justify-between">
              <span>Logout</span>
              <LogOut size={18} />
            </button>
            <button className="w-full glass-card p-4 hover:bg-red-500/10 transition-all rounded-2xl text-red-500 font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
