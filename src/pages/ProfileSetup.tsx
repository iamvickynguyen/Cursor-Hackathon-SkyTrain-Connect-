import { useState, type FormEvent } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { UserProfile } from "../types";
import { SKILL_OPTIONS, ROLE_PRESETS } from "../types";

interface ProfileSetupProps {
  onProfileSaved: (profile: UserProfile) => void;
}

export default function ProfileSetup({ onProfileSaved }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [openTo, setOpenTo] = useState("");
  const [isGhost, setIsGhost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveRole = role === "Other" ? customRole : role;

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 5
          ? [...prev, skill]
          : prev,
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !effectiveRole.trim() || skills.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const userId = crypto.randomUUID();

      const profile: UserProfile = {
        id: userId,
        name: name.trim(),
        role: effectiveRole.trim(),
        skills,
        openTo: openTo.trim(),
        roomId: "",
        isGhost,
        lastSeen: Date.now(),
        isActive: false,
      };

      const writePromise = setDoc(doc(db, "users", userId), {
        name: profile.name,
        role: profile.role,
        skills: profile.skills,
        openTo: profile.openTo,
        roomId: "",
        isGhost: profile.isGhost,
        lastSeen: profile.lastSeen,
        isActive: false,
      });

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000),
      );

      await Promise.race([writePromise, timeout]);

      onProfileSaved(profile);
    } catch (err) {
      const msg =
        err instanceof Error && err.message === "timeout"
          ? "Connection timed out. Make sure Firestore Database is created in Firebase Console."
          : "Failed to save profile. Please check your connection.";
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            SkyTrain Connect
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Set up your profile to find matches on the train.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full border-b border-gray-200 px-0 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Role
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLE_PRESETS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    role === r
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {role === "Other" && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter your role"
                className="w-full border-b border-gray-200 px-0 py-2 mt-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent"
              />
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Skills
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Select up to 5 skills for matching.
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    skills.includes(skill)
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Open To */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Open To{" "}
              <span className="text-gray-300 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={openTo}
              onChange={(e) => setOpenTo(e.target.value)}
              placeholder="e.g. Collaboration, Coffee chats, Co-founding"
              className="w-full border-b border-gray-200 px-0 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent"
            />
          </div>

          {/* Ghost Mode */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Ghost Mode</p>
              <p className="text-xs text-gray-400">
                Hide your name from other users.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsGhost(!isGhost)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isGhost ? "bg-gray-900" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isGhost ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={
              loading ||
              !name.trim() ||
              !effectiveRole.trim() ||
              skills.length === 0
            }
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

// photo
