import { useState, useRef, type FormEvent } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { UserProfile } from "../types";
import { SKILL_OPTIONS, ROLE_PRESETS } from "../types";
import { compressImage } from "../utils/compressImage";

interface ProfileSetupProps {
  onProfileSaved: (profile: UserProfile) => void;
}

export default function ProfileSetup({ onProfileSaved }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [openTo, setOpenTo] = useState("");
  const [isGhost, setIsGhost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 200);
      setPhotoUrl(compressed);
    } catch {
      setError("Failed to load photo.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !effectiveRole.trim() || skills.length === 0 || !photoUrl)
      return;

    setLoading(true);
    setError(null);

    try {
      const userId = crypto.randomUUID();

      const profile: UserProfile = {
        id: userId,
        name: name.trim(),
        photoUrl,
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
        photoUrl: profile.photoUrl,
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
      let msg: string;
      if (err instanceof Error && err.message === "timeout") {
        msg =
          "Connection timed out. Make sure Firestore Database is created in Firebase Console.";
      } else if (err instanceof Error) {
        msg = err.message;
      } else {
        msg = "Unknown error occurred.";
      }
      setError(msg);
      console.error("[ProfileSetup] Save failed:", err);
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
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-primary flex items-center justify-center overflow-hidden transition-colors"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                  />
                </svg>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handlePhoto}
              className="hidden"
            />
            <p className="text-xs text-gray-400">
              {photoUrl ? "Tap to change" : "Add a photo"}
            </p>
          </div>

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
              className="w-full border-b border-gray-200 px-0 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent"
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
                      ? "bg-primary text-white"
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
                className="w-full border-b border-gray-200 px-0 py-2 mt-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent"
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
                      ? "bg-primary text-white"
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
              className="w-full border-b border-gray-200 px-0 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent"
            />
          </div>

          {/* Ghost Mode */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Ghost Mode</p>
              <p className="text-xs text-gray-400">
                Hide your name and photo from others.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsGhost(!isGhost)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isGhost ? "bg-primary" : "bg-gray-200"
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
              skills.length === 0 ||
              !photoUrl
            }
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
