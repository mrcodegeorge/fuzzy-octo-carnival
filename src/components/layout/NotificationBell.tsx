import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Package, Info, CreditCard, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
};

const TYPE_ICONS: Record<string, any> = {
  order_status: Package,
  payment: CreditCard,
  info: Info,
  message: MessageSquare,
};

const NotificationBell = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-foreground/60 transition-colors hover:text-foreground outline-none">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] p-0 overflow-hidden bg-background border-border">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
          <h3 className="font-heading text-sm font-bold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Info;
                return (
                  <Link
                    key={n.id}
                    to={n.link || "#"}
                    onClick={() => {
                      if (!n.is_read) markAsRead.mutate(n.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex gap-3 px-4 py-4 transition-colors hover:bg-muted/50 border-b border-border/50 last:border-0",
                      !n.is_read && "bg-primary/[0.03]"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      !n.is_read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={cn("text-xs leading-none", !n.is_read ? "font-bold" : "font-medium")}>
                        {n.title}
                      </p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {n.message}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-xs font-medium">No notifications yet</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  We'll notify you when something important happens!
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-border bg-muted/10 text-center">
            <Link to="/account?tab=notifications" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
              View all
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
