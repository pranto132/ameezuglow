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
import { Users, UserPlus, Shield, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "staff";
  created_at: string | null;
}

const AdminUsers = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");

  // Fetch all users with roles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserRole[];
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async ({ email, password, role }: { email: string; password: string; role: string }) => {
      const response = await supabase.functions.invoke("create-user", {
        body: { email, password, role },
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
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast({ title: "সফল!", description: "ইউজার তৈরি হয়েছে" });
      setIsCreateOpen(false);
      setEmail("");
      setPassword("");
      setRole("staff");
    },
    onError: (error: Error) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "ইউজার তৈরি করতে সমস্যা হয়েছে",
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
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast({ title: "সফল!", description: "রোল সরানো হয়েছে" });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "রোল সরাতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "ত্রুটি",
        description: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "ত্রুটি",
        description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate({ email, password, role });
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return <Badge className="bg-red-500/10 text-red-500">অ্যাডমিন</Badge>;
    }
    return <Badge className="bg-blue-500/10 text-blue-500">স্টাফ</Badge>;
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
          <h2 className="text-2xl font-display font-bold text-foreground">ইউজার ম্যানেজমেন্ট</h2>
          <p className="text-muted-foreground">অ্যাডমিন এবং স্টাফ অ্যাকাউন্ট পরিচালনা করুন</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              নতুন ইউজার
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>নতুন ইউজার তৈরি করুন</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
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
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">রোল</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "admin" | "staff")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">স্টাফ</SelectItem>
                    <SelectItem value="admin">অ্যাডমিন</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  "ইউজার তৈরি করুন"
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
                <p className="text-sm text-muted-foreground">মোট ইউজার</p>
                <p className="text-2xl font-bold">{userRoles?.length || 0}</p>
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
                <p className="text-sm text-muted-foreground">অ্যাডমিন</p>
                <p className="text-2xl font-bold">
                  {userRoles?.filter((u) => u.role === "admin").length || 0}
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
                <p className="text-sm text-muted-foreground">স্টাফ</p>
                <p className="text-2xl font-bold">
                  {userRoles?.filter((u) => u.role === "staff").length || 0}
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
            ইউজার তালিকা
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ইউজার আইডি</TableHead>
                <TableHead>রোল</TableHead>
                <TableHead>তৈরির তারিখ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles?.map((userRole) => (
                <TableRow key={userRole.id}>
                  <TableCell className="font-mono text-sm">
                    {userRole.user_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{getRoleBadge(userRole.role)}</TableCell>
                  <TableCell>
                    {userRole.created_at
                      ? format(new Date(userRole.created_at), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {userRole.user_id !== session?.user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRoleMutation.mutate(userRole.id)}
                        disabled={deleteRoleMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!userRoles || userRoles.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    কোন ইউজার পাওয়া যায়নি
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
