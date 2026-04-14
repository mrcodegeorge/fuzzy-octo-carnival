import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Loader2, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Calendar
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const NotificationsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["all-notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user?.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification history cleared");
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="text-green-500" size={18} />;
      case "warning": return <AlertTriangle className="text-amber-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  const groupNotifications = (notifs: any[]) => {
    const today = notifs.filter(n => isToday(new Date(n.created_at)));
    const yesterday = notifs.filter(n => isYesterday(new Date(n.created_at)));
    const older = notifs.filter(n => !isToday(new Date(n.created_at)) && !isYesterday(new Date(n.created_at)));
    
    return [
      { title: "Today", data: today },
      { title: "Yesterday", data: yesterday },
      { title: "Older", data: older },
    ].filter(group => group.data.length > 0);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const groups = notifications ? groupNotifications(notifications) : [];
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <div className="editorial-line" />
            <span className="font-accent text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
              Inbox
            </span>
          </div>
          <h1 className="mt-3 font-heading text-4xl font-bold">
            Notifications {unreadCount > 0 && <span className="text-primary">({unreadCount})</span>}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium transition-all hover:bg-muted disabled:opacity-50"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
          <button 
            onClick={() => { if(confirm("Clear all notifications?")) deleteAllMutation.mutate(); }}
            disabled={!notifications?.length || deleteAllMutation.isPending}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-destructive transition-all hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>
      </div>

      {!notifications?.length ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Bell className="text-muted-foreground" size={32} />
          </div>
          <h3 className="mt-6 font-heading text-xl font-bold">No notifications yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">We'll let you know when something important happens.</p>
          <Link to="/shop" className="mt-8 btn-beauty">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-4 flex items-center gap-2 font-accent text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                <Calendar size={12} /> {group.title}
              </h2>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                <AnimatePresence initial={false}>
                  {group.data.map((notif) => (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`group relative flex items-start gap-4 p-5 transition-colors hover:bg-muted/30 ${!notif.is_read ? "bg-primary/[0.02]" : ""}`}
                    >
                      {!notif.is_read && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-primary" />
                      )}
                      
                      <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-card border border-border">
                        {getIcon(notif.type)}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className={`text-sm font-semibold ${!notif.is_read ? "text-foreground" : "text-foreground/80"}`}>
                            {notif.title}
                          </h4>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                            <Clock size={10} /> {format(new Date(notif.created_at), "h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {notif.message}
                        </p>
                        
                        <div className="mt-3 flex items-center gap-4">
                          {notif.link && (
                            <Link 
                              to={notif.link} 
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              View details <ArrowRight size={12} />
                            </Link>
                          )}
                          {!notif.is_read && (
                            <button 
                              onClick={() => markAsReadMutation.mutate(notif.id)}
                              className="text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => deleteMutation.mutate(notif.id)}
                        className="opacity-0 transition-opacity group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
