import { useEffect, useState } from "react";
import { Bell, X, UserPlus, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TemporaryNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  data?: any;
}

export function TemporaryNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<TemporaryNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Load recent notifications (last 24 hours)
    const loadRecentNotifications = async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setNotifications(data);
      }
    };

    loadRecentNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('recent-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotification = payload.new as TemporaryNotification;
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        toast.info(newNotification.title);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="h-4 w-4" />;
      case 'exam_result':
        return <FileText className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'friend_request':
        return 'bg-blue-100 text-blue-800';
      case 'exam_result':
        return 'bg-green-100 text-green-800';
      case 'info':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification Button */}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full w-12 h-12 shadow-lg bg-background border-2 hover:scale-105 transition-transform relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center p-0 text-xs"
        >
          {notifications.length}
        </Badge>
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 max-h-96 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Recent Notifications
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-2 rounded-full ${getTypeColor(notification.type)}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {new Date(notification.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Action buttons for friend requests */}
                        {notification.type === 'friend_request' && notification.data?.friendship_id && (
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={async () => {
                                try {
                                  await supabase
                                    .from('friendships')
                                    .update({ status: 'accepted' })
                                    .eq('id', notification.data.friendship_id);
                                  
                                  await supabase
                                    .from('notifications')
                                    .update({ read: true })
                                    .eq('id', notification.id);
                                  
                                  toast.success('Friend request accepted!');
                                  setNotifications(prev => 
                                    prev.filter(n => n.id !== notification.id)
                                  );
                                } catch (error) {
                                  toast.error('Failed to accept friend request');
                                }
                              }}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={async () => {
                                try {
                                  await supabase
                                    .from('friendships')
                                    .update({ status: 'rejected' })
                                    .eq('id', notification.data.friendship_id);
                                  
                                  await supabase
                                    .from('notifications')
                                    .update({ read: true })
                                    .eq('id', notification.id);
                                  
                                  toast.info('Friend request declined');
                                  setNotifications(prev => 
                                    prev.filter(n => n.id !== notification.id)
                                  );
                                } catch (error) {
                                  toast.error('Failed to decline friend request');
                                }
                              }}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}