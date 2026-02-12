import { useEffect, useState } from "react";
import { Users, UserPlus, Check, X, Search, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface Friend {
  id: string;
  friendshipId?: string;
  username: string;
  display_name: string;
  level: number;
  status: string;
}
export function FriendsPanel() {
  const {
    user
  } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    if (!user) return;
    fetchFriends();
    fetchPendingRequests();
  }, [user]);
  const fetchFriends = async () => {
    if (!user) return;
    const { data: outgoing } = await supabase.from('friendships').select(`
        id,
        friend_id,
        profiles!friendships_friend_id_fkey (
          id,
          username,
          display_name,
          level
        )
      `).eq('user_id', user.id).eq('status', 'accepted');

    const { data: incoming } = await supabase.from('friendships').select(`
        id,
        user_id,
        profiles!friendships_user_id_fkey (
          id,
          username,
          display_name,
          level
        )
      `).eq('friend_id', user.id).eq('status', 'accepted');

    const merged = [
      ...(outgoing || []).map((f: any) => ({
        id: f.friend_id,
        friendshipId: f.id,
        username: f.profiles.username,
        display_name: f.profiles.display_name,
        level: f.profiles.level,
        status: 'accepted'
      })),
      ...(incoming || []).map((f: any) => ({
        id: f.user_id,
        friendshipId: f.id,
        username: f.profiles.username,
        display_name: f.profiles.display_name,
        level: f.profiles.level,
        status: 'accepted'
      }))
    ];

    const deduped = Array.from(new Map(merged.map((f) => [f.id, f])).values());
    setFriends(deduped as Friend[]);
  };
  const fetchPendingRequests = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from('friendships').select(`
        id,
        user_id,
        profiles!friendships_user_id_fkey (
          id,
          username,
          display_name,
          level
        )
      `).eq('friend_id', user.id).eq('status', 'pending');
    if (data) {
      const requests = data.map((f: any) => ({
        id: f.user_id,
        friendshipId: f.id,
        username: f.profiles.username,
        display_name: f.profiles.display_name,
        level: f.profiles.level,
        status: 'pending'
      }));
      setPendingRequests(requests);
    }
  };
  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;
    setIsSearching(true);
    const {
      data
    } = await supabase.from('profiles').select('id, username, display_name, level').ilike('username', `%${searchQuery}%`).neq('id', user.id).limit(10);
    if (data) {
      // Filter out existing friends
      const friendIds = friends.map(f => f.id);
      const filtered = data.filter(u => !friendIds.includes(u.id));
      setSearchResults(filtered);
    }
    setIsSearching(false);
  };
  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;
    try {
      const {
        error
      } = await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      });
      if (error) throw error;
      toast.success('Friend request sent!');
      setSearchResults(prev => prev.filter(u => u.id !== friendId));
    } catch (error: any) {
      toast.error('Failed to send friend request');
    }
  };
  const respondToRequest = async (friendshipId: string, accept: boolean) => {
    try {
      await supabase.from('friendships').update({
        status: accept ? 'accepted' : 'rejected'
      }).eq('id', friendshipId);
      if (accept) {
        toast.success('Friend request accepted!');
        fetchFriends();
      } else {
        toast.info('Friend request declined');
      }
      fetchPendingRequests();
    } catch (error) {
      toast.error('Failed to respond to request');
    }
  };
  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (error) {
      toast.error('Failed to remove friend');
      return;
    }
    toast.success('Friend removed');
    fetchFriends();
  };

  return <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          Friends
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Friends</DialogTitle>
          <DialogDescription>
            Manage your friends and connect with other learners
          </DialogDescription>
        </DialogHeader>

        {/* Search Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Search users by username..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchUsers()} />
            <Button onClick={searchUsers} disabled={isSearching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {searchResults.length > 0 && <Card>
              <CardContent className="p-4 space-y-2">
                <h4 className="font-semibold text-sm mb-2">Search Results</h4>
                {searchResults.map(result => <div key={result.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {result.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{result.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{result.username}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => sendFriendRequest(result.id)}>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>)}
              </CardContent>
            </Card>}
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && <div className="space-y-2">
            <h4 className="font-semibold">Pending Requests ({pendingRequests.length})</h4>
            {pendingRequests.map((request: any) => <Card key={request.friendshipId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          @{request.username} • Level {request.level}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => respondToRequest(request.friendshipId, true)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => respondToRequest(request.friendshipId, false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>}

        {/* Friends List */}
        <div className="space-y-2">
          <h4 className="font-semibold">Your Friends ({friends.length})</h4>
          {friends.length === 0 ? <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No friends yet. Search for users above to add friends!</p>
              </CardContent>
            </Card> : friends.map(friend => <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {friend.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{friend.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          @{friend.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Level {friend.level}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFriend((friend as any).friendshipId)}
                        className="text-destructive"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
        </div>
      </DialogContent>
    </Dialog>;
}
