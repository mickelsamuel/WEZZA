"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Users, X, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Collaborator extends User {
  addedAt: Date;
}

interface CollaboratorManagerProps {
  productId: string;
  productTitle: string;
}

export function CollaboratorManager({ productId, productTitle }: CollaboratorManagerProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadCollaborators();
    loadAvailableUsers();
  }, [productId]);

  const loadCollaborators = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || []);
      }
    } catch (error) {
      console.error("Failed to load collaborators:", error);
      toast.error("Failed to load collaborators");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await fetch("/api/admin/users/collaborators");
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleAddCollaborator = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setAdding(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (response.ok) {
        toast.success("Collaborator added successfully!");
        setSelectedUserId("");
        loadCollaborators();
        loadAvailableUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add collaborator");
      }
    } catch (error) {
      console.error("Failed to add collaborator:", error);
      toast.error("Failed to add collaborator");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string, userName: string) => {
    if (!confirm(`Remove ${userName} as a collaborator from this product?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast.success("Collaborator removed");
        loadCollaborators();
        loadAvailableUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to remove collaborator");
      }
    } catch (error) {
      console.error("Failed to remove collaborator:", error);
      toast.error("Failed to remove collaborator");
    }
  };

  // Filter out users who are already collaborators
  const filteredAvailableUsers = availableUsers.filter(
    (user) => !collaborators.some((collab) => collab.id === user.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Product Collaborators
        </CardTitle>
        <CardDescription>
          Manage who can view analytics for "{productTitle}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Collaborator Section */}
        <div className="flex gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a user with collaborator role..." />
            </SelectTrigger>
            <SelectContent>
              {filteredAvailableUsers.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No available collaborators
                </div>
              ) : (
                filteredAvailableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddCollaborator}
            disabled={adding || !selectedUserId}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Current Collaborators List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Current Collaborators ({collaborators.length})
          </h4>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : collaborators.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
              No collaborators assigned to this product
            </div>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {collaborator.name || "No name"}
                    </p>
                    <p className="text-xs text-gray-500">{collaborator.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleRemoveCollaborator(
                        collaborator.id,
                        collaborator.name || collaborator.email
                      )
                    }
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
