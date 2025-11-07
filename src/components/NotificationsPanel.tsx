import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: any;
  created_at: string;
}
export function NotificationsPanel() {
  const {
    user
  } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase.channel('notifications-changes').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, payload => {
      setNotifications(prev => [payload.new as Notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast.info((payload.new as Notification).title);
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  const fetchNotifications = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', {
      ascending: false
    }).limit(20);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };
  const markAsRead = async (notificationId: string) => {
    await supabase.from('notifications').update({
      read: true
    }).eq('id', notificationId);
    setNotifications(prev => prev.map(n => n.id === notificationId ? {
      ...n,
      read: true
    } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  const markAllAsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({
      read: true
    }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({
      ...n,
      read: true
    })));
    setUnreadCount(0);
  };
  const handleFriendRequest = async (notificationId: string, friendshipId: string, accept: boolean) => {
    try {
      await supabase.from('friendships').update({
        status: accept ? 'accepted' : 'rejected'
      }).eq('id', friendshipId);
      await markAsRead(notificationId);
      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
    } catch (error) {
      toast.error('Failed to respond to friend request');
    }
  };
  return <Popover>
      <PopoverTrigger asChild>
        
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div> : notifications.map(notification => <div key={notification.id} className={`p-4 border-b hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                      <Check className="h-4 w-4" />
                    </Button>}
                </div>

                {notification.type === 'friend_request' && !notification.read && <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => handleFriendRequest(notification.id, notification.data.friendship_id, true)}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleFriendRequest(notification.id, notification.data.friendship_id, false)}>
                      Decline
                    </Button>
                  </div>}
              </div>)}
        </div>
      </PopoverContent>
    </Popover>;
}