import { useState, useEffect } from "react";
import { auditService } from "@/lib/services/audit-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RoleChangeHistoryProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RoleChangeHistory({
  userId,
  userName,
  isOpen,
  onClose,
}: RoleChangeHistoryProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchRoleChangeLogs();
    }
  }, [isOpen, userId]);

  const fetchRoleChangeLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const logs = await auditService.getRoleChangeLogs(userId);
      setLogs(logs);
    } catch (err) {
      console.error("Error fetching role change logs:", err);
      setError("Failed to load role change history");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Format role for display
  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Role Change History</DialogTitle>
          <DialogDescription>
            View the history of role changes for {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">{error}</div>
          ) : logs.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              No role changes have been made for this user
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-md p-3 text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">
                        {formatRole(log.details.old_role)}
                      </span>{" "}
                      →{" "}
                      <span className="font-medium">
                        {formatRole(log.details.new_role)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Changed by: {log.profiles?.name || "Unknown"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 