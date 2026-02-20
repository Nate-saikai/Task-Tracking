import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

// Shadcn UI Components
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Mode = "login" | "register";

export default function LoginPage() {
    const auth = useAuth();
    const nav = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState<Mode>("login");
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    async function handleAuth(currentMode: Mode) {
        setIsLoading(true);
        try {
            if (currentMode === "login") {
                const user = await auth.login({ username, password });
                const state = location.state as any;
                const dest = user.role === "ADMIN" ? "/admin/tasks" : (state?.from?.pathname || "/app/tasks");

                toast.success("Welcome back!");
                nav(dest, { replace: true });
            } else {
                await auth.register({ fullName, username, password });
                toast.success("Account created! Please log in.");
                setMode("login");
            }
        } catch (err: any) {
            toast.error(err?.message ?? "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    }

    if (isPageLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-[420px]">
                    <CardHeader className="space-y-2 text-center">
                        <Skeleton className="h-8 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50/50 p-4">
            <Card className="w-full max-w-[420px] shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Task Tracking System
                    </CardTitle>
                    <CardDescription>
                        Access your workspace to manage your tasks
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        {/* --- LOGIN CONTENT --- */}
                        <TabsContent value="login" className="space-y-4">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleAuth("login"); }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="login-user">Username</Label>
                                    <Input
                                        id="login-user"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-pass">Password</Label>
                                    <Input
                                        id="login-pass"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign In
                                </Button>
                            </form>
                        </TabsContent>

                        {/* --- REGISTER CONTENT --- */}
                        <TabsContent value="register" className="space-y-4">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleAuth("register"); }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="reg-name">Full Name</Label>
                                    <Input
                                        id="reg-name"
                                        placeholder="Juan Dela Cruz"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-user">Username</Label>
                                    <Input
                                        id="reg-user"
                                        placeholder="min 8 characters"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        minLength={8}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-pass">Password</Label>
                                    <Input
                                        id="reg-pass"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={8}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" variant="secondary" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter className="flex justify-center border-t pt-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                        Secure Access • Capstone 4
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}