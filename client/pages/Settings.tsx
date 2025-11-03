import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  Palette,
  Globe,
  LogOut,
  X,
} from "lucide-react";

export default function Settings() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {/* Trigger Button - можно разместить где угодно */}
      <button 
        onClick={() => setShowSettings(true)}
        className="glass-button p-3 rounded-full"
      >
        <SettingsIcon className="text-primary" size={20} />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="glass-card modal-content rounded-2xl p-4 contain-layout max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-glass-light/90 backdrop-blur-sm p-2 -m-2 rounded-xl">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <SettingsIcon className="text-primary" size={24} />
                Настройки
              </h1>
              <button 
                onClick={() => setShowSettings(false)} 
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
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
          <h3 className="text-lg font-semibold mb-3 text-red-500">
            Danger Zone
          </h3>
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
        </div>
      )}
    </>
  );
}
