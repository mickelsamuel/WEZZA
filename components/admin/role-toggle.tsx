"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ChevronDown, Shield, User, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RoleToggleProps {
  userId: string;
  currentRole: string;
  userName: string;
}

export function RoleToggle({ userId, currentRole, userName }: RoleToggleProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newRole, setNewRole] = useState<string | null>(null);
  const router = useRouter();

  const handleRoleChange = async () => {
    if (!newRole) return;

    setIsChanging(true);
    try {
      const response = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });

      if (response.ok) {
        toast.success(`User role updated to ${newRole}`);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update role");
      }
    } catch (error) {
      toast.error("Error updating role");
      console.error(error);
    } finally {
      setIsChanging(false);
      setShowConfirm(false);
      setNewRole(null);
    }
  };

  const confirmRoleChange = (role: string) => {
    setNewRole(role);
    setShowConfirm(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isChanging}>
            {isChanging ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Change Role
                <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => confirmRoleChange("user")}
            disabled={currentRole?.toLowerCase() === "user"}
          >
            <User className="mr-2 h-4 w-4" />
            User
            {currentRole?.toLowerCase() === "user" && (
              <span className="ml-auto text-xs text-muted-foreground">(Current)</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => confirmRoleChange("collaborator")}
            disabled={currentRole?.toLowerCase() === "collaborator"}
          >
            <Users className="mr-2 h-4 w-4" />
            Collaborator
            {currentRole?.toLowerCase() === "collaborator" && (
              <span className="ml-auto text-xs text-muted-foreground">(Current)</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => confirmRoleChange("admin")}
            disabled={currentRole?.toLowerCase() === "admin"}
          >
            <Shield className="mr-2 h-4 w-4" />
            Admin
            {currentRole?.toLowerCase() === "admin" && (
              <span className="ml-auto text-xs text-muted-foreground">(Current)</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change <strong>{userName}</strong>'s role to{" "}
              <strong>{newRole}</strong>?
              {newRole?.toLowerCase() === "admin" && (
                <span className="block mt-2 text-orange-600">
                  This will give the user full administrative access to the system.
                </span>
              )}
              {newRole?.toLowerCase() === "collaborator" && (
                <span className="block mt-2 text-blue-600">
                  This will give the user collaborator access with limited administrative privileges.
                </span>
              )}
              {newRole?.toLowerCase() === "user" && currentRole?.toLowerCase() === "admin" && (
                <span className="block mt-2 text-orange-600">
                  This will remove all administrative privileges from this user.
                </span>
              )}
              {newRole?.toLowerCase() === "user" && currentRole?.toLowerCase() === "collaborator" && (
                <span className="block mt-2 text-orange-600">
                  This will remove all collaborator privileges from this user.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewRole(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
