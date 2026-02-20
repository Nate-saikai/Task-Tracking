import { useState } from "react";
import { api } from "../../api/api";
import { useAuth } from "../../auth/AuthContext";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const auth = useAuth();
    const me = auth.user;

    const [fullName, setFullName] = useState(me?.fullName ?? "");
    const [username, setUsername] = useState(me?.username ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    if (!me) {
        return (
            <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                Missing user info.
            </div>
        );
    }

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
        <div className="max-w-2xl mx-auto py-10 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and profile information.
                </p>
            </div>

            <Separator />

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Update Profile</CardTitle>
                    <CardDescription>
                        Change your public-facing name and username.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={saveProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                            />
                        </div>

                        <Button type="submit">Save Profile</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Password Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                        Ensure your account is using a long, random password to stay secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={changePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <Button type="submit" variant="secondary">
                            Update Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}