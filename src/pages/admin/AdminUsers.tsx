import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Shield, Loader2, Trash2, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations, useAdminTranslation } from "@/lib/adminTranslations";

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff" | null;
  role_id: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { t } = useAdminTranslation(language);
  const tr = adminTranslations;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");

  // Fetch all users with roles via edge function
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users-with-roles"],
    queryFn: async () => {
      const response = await supabase.functions.invoke("get-users");
      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      return response.data.users as UserWithRole[];
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async ({ name, email, password, role }: { name: string; email: string; password: string; role: string }) => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const token = currentSession?.access_token;
      
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create user");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-with-roles"] });
      toast({ title: t(tr.common.success), description: t(tr.users.userCreated) });
      setIsCreateOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("staff");
    },
    onError: (error: Error) => {
      const msg = error.message || "";
      const description = msg.includes("already been registered")
        ? language === "bn"
          ? "এই ইমেইল দিয়ে আগে থেকেই একটি অ্যাকাউন্ট আছে"
          : "A user with this email address has already been registered"
        : msg || t(tr.users.error);
      toast({
        title: t(tr.common.error),
        description,
        variant: "destructive",
      });
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ roleId, newRole }: { roleId: string; newRole: "admin" | "staff" }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-with-roles"] });
      toast({ title: t(tr.common.success), description: t(tr.users.roleChanged) });
    },
    onError: () => {
      toast({
        title: t(tr.common.error),
        description: t(tr.users.error),
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-with-roles"] });
      toast({ title: t(tr.common.success), description: t(tr.users.roleRemoved) });
    },
    onError: () => {
      toast({
        title: t(tr.common.error),
        description: t(tr.users.error),
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const response = await supabase.functions.invoke("reset-user-password", {
        body: { userId, newPassword },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      toast({ title: t(tr.common.success), description: t(tr.users.passwordReset) });
      setIsResetOpen(false);
      setSelectedUserId(null);
      setNewPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: t(tr.common.error),
        description: error.message || t(tr.users.error),
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: t(tr.common.error),
        description: t(tr.users.errorRequired),
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: t(tr.common.error),
        description: t(tr.users.errorMinLength),
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate({ name, email, password, role });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newPassword) {
      toast({
        title: t(tr.common.error),
        description: t(tr.users.errorNewPasswordRequired),
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: t(tr.common.error),
        description: t(tr.users.errorMinLength),
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate({ userId: selectedUserId, newPassword });
  };

  const handleRoleChange = (user: UserWithRole, newRole: "admin" | "staff") => {
    if (!user.role_id || user.role === newRole) return;
    changeRoleMutation.mutate({ roleId: user.role_id, newRole });
  };

  const openResetDialog = (userId: string) => {
    setSelectedUserId(userId);
    setNewPassword("");
    setIsResetOpen(true);
  };

  const getRoleBadge = (role: string | null) => {
    if (role === "admin") {
      return <Badge className="bg-red-500/10 text-red-500">{t(tr.users.admin)}</Badge>;
    }
    if (role === "staff") {
      return <Badge className="bg-blue-500/10 text-blue-500">{t(tr.users.staff)}</Badge>;
    }
    return <Badge variant="secondary">{t(tr.users.noRole)}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">{t(tr.users.title)}</h2>
          <p className="text-muted-foreground">{t(tr.users.subtitle)}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              {t(tr.users.addUser)}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t(tr.users.createUser)}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t(tr.users.name)}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t(tr.users.namePlaceholder)}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t(tr.users.email)}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t(tr.users.password)}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t(tr.users.passwordPlaceholder)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t(tr.users.role)}</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "admin" | "staff")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">{t(tr.users.staff)}</SelectItem>
                    <SelectItem value="admin">{t(tr.users.admin)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t(tr.users.creating)}
                  </>
                ) : (
                  t(tr.users.createUserBtn)
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(tr.users.totalUsers)}</p>
                <p className="text-2xl font-bold">{users?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-500/10">
                <Shield className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(tr.users.admin)}</p>
                <p className="text-2xl font-bold">
                  {users?.filter((u) => u.role === "admin").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(tr.users.staff)}</p>
                <p className="text-2xl font-bold">
                  {users?.filter((u) => u.role === "staff").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t(tr.users.userList)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(tr.users.name)}</TableHead>
                <TableHead>{t(tr.users.email)}</TableHead>
                <TableHead>{t(tr.users.role)}</TableHead>
                <TableHead>{t(tr.users.createdAt)}</TableHead>
                <TableHead className="text-right">{t(tr.common.actions)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role || ""}
                      onValueChange={(v) => handleRoleChange(user, v as "admin" | "staff")}
                      disabled={user.id === session?.user?.id || changeRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue>
                          {getRoleBadge(user.role)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">
                          <Badge className="bg-blue-500/10 text-blue-500">{t(tr.users.staff)}</Badge>
                        </SelectItem>
                        <SelectItem value="admin">
                          <Badge className="bg-red-500/10 text-red-500">{t(tr.users.admin)}</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.created_at
                      ? format(new Date(user.created_at), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openResetDialog(user.id)}
                      title={t(tr.users.resetPassword)}
                    >
                      <KeyRound className="w-4 h-4 text-amber-500" />
                    </Button>
                    {user.id !== session?.user?.id && user.role_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRoleMutation.mutate(user.role_id!)}
                        disabled={deleteRoleMutation.isPending}
                        title={t(tr.common.delete)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!users || users.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t(tr.users.noUsers)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(tr.users.resetPassword)}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t(tr.users.newPassword)}</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder={t(tr.users.passwordPlaceholder)}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t(tr.users.resetting)}
                </>
              ) : (
                t(tr.users.reset)
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;