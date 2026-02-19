import { useState } from "react";
import { api } from "../../api/api";
import { useAuth } from "../../auth/AuthContext";

export default function SettingsPage() {
    const auth = useAuth();
    const me = auth.user;

    const [fullName, setFullName] = useState(me?.fullName ?? "");
    const [username, setUsername] = useState(me?.username ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    if (!me) return <div>Missing user info.</div>;

    // ✅ From here on, TS knows "user" is NOT null
    const user = me;

    async function saveProfile(e: React.FormEvent) {
        e.preventDefault();
        const updated = await api.persons.patchProfile(user.personId, { fullName, username });
        auth.setUser(updated);
        alert("Profile updated!");
    }

    async function changePassword(e: React.FormEvent) {
        e.preventDefault();
        await api.persons.changePassword(user.personId, { currentPassword, newPassword });
        setCurrentPassword("");
        setNewPassword("");
        alert("Password updated!");
    }

    return (
        <div style={{ display: "grid", gap: 18 }}>
            <h2>Settings</h2>

            <form onSubmit={saveProfile} style={{ display: "grid", gap: 10 }}>
                <h3>Update Profile</h3>

                <label>
                    Full Name
                    <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }}
                    />
                </label>

                <label>
                    Username
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }}
                    />
                </label>

                <button type="submit">Save Profile</button>
            </form>

            <hr />

            <form onSubmit={changePassword} style={{ display: "grid", gap: 10 }}>
                <h3>Change Password</h3>

                <label>
                    Current Password
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }}
                    />
                </label>

                <label>
                    New Password
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }}
                    />
                </label>

                <button type="submit">Update Password</button>
            </form>
        </div>
    );
}
