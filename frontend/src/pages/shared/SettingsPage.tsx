import React, { useState } from "react";
import { api } from "../../api/api";
import { useAuth } from "../../auth/AuthContext";

// sonner (shadcn)
import { toast } from "sonner";

// icons
import { Info, Loader2, ShieldCheck } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// dialogs / modals / tooltips
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SettingsPage() {
    const auth = useAuth();
    const me = auth.user;

    const [fullName, setFullName] = useState(me?.fullName ?? "");
    const [username, setUsername] = useState(me?.username ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    // loading states
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // confirmation dialogs
    const [confirmProfileOpen, setConfirmProfileOpen] = useState(false);
    const [confirmPasswordOpen, setConfirmPasswordOpen] = useState(false);

    // modal
    const [securityModalOpen, setSecurityModalOpen] = useState(false);

    const passwordMismatch =
        confirmNewPassword.length > 0 && newPassword !== confirmNewPassword;

    const canSubmitPassword =
        currentPassword.length > 0 &&
        newPassword.length > 0 &&
        confirmNewPassword.length > 0 &&
        !passwordMismatch &&
        !isChangingPassword;

    if (!me) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-6">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-4 w-[420px]" />
                </div>

                <Separator className="my-6" />

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-72" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-10 w-32" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-44" />
                            <Skeleton className="h-4 w-80" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-10 w-40" />
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 flex items-center justify-center text-sm text-muted-foreground">
                    Missing user info.
                </div>
            </div>
        );
    }

    const user = me;

    function requestSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        setConfirmProfileOpen(true);
    }

    async function doSaveProfile() {
        setIsSavingProfile(true);
        try {
            const updated = await api.persons.patchProfile(user.personId, {
                fullName,
                username,
            });
            auth.setUser(updated);
            toast.success("Profile updated!");
        } catch (err: any) {
            toast.error("Failed to update profile", {
                description: err?.message ?? "Please try again.",
            });
        } finally {
            setIsSavingProfile(false);
            setConfirmProfileOpen(false);
        }
    }

    function requestChangePassword(e: React.FormEvent) {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            toast.error("Passwords don’t match", {
                description: "Please re-enter the new password to confirm.",
            });
            return;
        }

        setConfirmPasswordOpen(true);
    }

    async function doChangePassword() {
        setIsChangingPassword(true);

        // safety check in case dialog is triggered unexpectedly
        if (newPassword !== confirmNewPassword) {
            toast.error("Passwords don’t match", {
                description: "Please re-enter the new password to confirm.",
            });
            setIsChangingPassword(false);
            setConfirmPasswordOpen(false);
            return;
        }

        try {
            await api.persons.changePassword(user.personId, {
                currentPassword,
                newPassword,
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            toast.success("Password updated!");
        } catch (err: any) {
            toast.error("Failed to update password", {
                description: err?.message ?? "Please verify your current password.",
            });
        } finally {
            setIsChangingPassword(false);
            setConfirmPasswordOpen(false);
        }
    }

    return (
        <TooltipProvider>
            <div className="mx-auto w-full max-w-6xl px-4 py-6">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                        <p className="text-muted-foreground">
                            Manage your account settings and profile information.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Account
                        </Badge>
                    </div>
                </div>

                <Separator className="my-6" />

                {/* Layout */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Profile Section */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Update Profile
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex cursor-help items-center text-muted-foreground">
                                            <Info className="h-4 w-4" />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        This updates your public-facing name and username.
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <CardDescription>
                                Change your public-facing name and username.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={requestSaveProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        disabled={isSavingProfile}
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="username">Username</Label>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-help text-xs text-muted-foreground">
                                                    What’s this?
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Shown on your profile and mentions (if applicable).
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <Input
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        disabled={isSavingProfile}
                                        autoComplete="username"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button type="submit" disabled={isSavingProfile}>
                                                {isSavingProfile && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Save Profile
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Save your profile changes</TooltipContent>
                                    </Tooltip>

                                    <p className="text-xs text-muted-foreground">
                                        Changes apply immediately.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Password Section */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Change Password
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex cursor-help items-center text-muted-foreground">
                                            <Info className="h-4 w-4" />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Use a long, random password (12+ characters recommended).
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <CardDescription>
                                Ensure your account is using a long, random password to stay
                                secure.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={requestChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={isChangingPassword}
                                        autoComplete="current-password"
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
                                        disabled={isChangingPassword}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="confirmNewPassword">
                                            Re-enter New Password
                                        </Label>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-help text-xs text-muted-foreground">
                                                    Why?
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Prevents typos so you don’t lock yourself out.
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <Input
                                        id="confirmNewPassword"
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={isChangingPassword}
                                        autoComplete="new-password"
                                        aria-invalid={passwordMismatch}
                                        className={
                                            passwordMismatch
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : ""
                                        }
                                    />

                                    {passwordMismatch && (
                                        <p className="text-sm text-destructive">
                                            Passwords do not match.
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="submit"
                                                variant="secondary"
                                                disabled={!canSubmitPassword}
                                            >
                                                {isChangingPassword && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Update Password
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Update your password</TooltipContent>
                                    </Tooltip>

                                    <p className="text-xs text-muted-foreground">
                                        You’ll stay signed in on this device.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Confirm Profile Update */}
                <AlertDialog
                    open={confirmProfileOpen}
                    onOpenChange={setConfirmProfileOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Save profile changes?</AlertDialogTitle>
                            <AlertDialogDescription className="w-full">
                                You’re about to update your profile details.
                                <div className="mt-3 space-y-1 rounded-md border bg-muted/40 p-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Full name:</span>{" "}
                                        <span className="font-medium">{fullName || "—"}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Username:</span>{" "}
                                        <span className="font-medium">{username || "—"}</span>
                                    </div>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSavingProfile}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={doSaveProfile}
                                disabled={isSavingProfile}
                            >
                                {isSavingProfile ? (
                                    <span className="inline-flex items-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving…
                                    </span>
                                ) : (
                                    "Confirm"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Confirm Password Update */}
                <AlertDialog
                    open={confirmPasswordOpen}
                    onOpenChange={setConfirmPasswordOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Change your password?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will update your password immediately. Make sure you’ve
                                stored it somewhere safe.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isChangingPassword}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={doChangePassword}
                                disabled={isChangingPassword}
                            >
                                {isChangingPassword ? (
                                    <span className="inline-flex items-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating…
                                    </span>
                                ) : (
                                    "Confirm"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>  
            </div>
        </TooltipProvider>
    );
}