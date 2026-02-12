import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Store, Trophy, Settings, User, LogOut, ArrowLeft } from "lucide-react";
import { NotificationsPanel } from "./NotificationsPanel";
import { FriendsPanel } from "./FriendsPanel";
import { TemporaryNotifications } from "./TemporaryNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface HeaderProps {
  showAuth?: boolean;
  showIcons?: boolean;
  showBackButton?: boolean;
  hideAuthButtons?: boolean;
  hideProfileButton?: boolean;
  showFriends?: boolean;
}
const Header = ({
  showAuth = true,
  showIcons = false,
  showBackButton = false,
  hideAuthButtons = false,
  hideProfileButton = false,
  showFriends = false
}: HeaderProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const checkStaffStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'staff']);

      setIsStaff(!!data && data.length > 0);
    };

    checkStaffStatus();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  return <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {showBackButton && <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-base">K</span>
              </div>
              <span className="text-xl font-bold text-foreground">KnowIt AI</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {showAuth && !hideAuthButtons && <>
                <NotificationsPanel />
                
              </>}

            {showFriends && <FriendsPanel />}
            {showAuth && <TemporaryNotifications />}
            {isStaff && showAuth && (
              <Link to="/staff-hub">
                <Button variant="ghost" size="sm" className="bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-600">
                  Staff Hub
                </Button>
              </Link>
            )}
            {showAuth && !hideAuthButtons ? <>
                <Link to="/store">
                  <Button variant="ghost" size="sm">
                    {showIcons && <Store className="h-4 w-4 mr-2" />}
                    Store
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="ghost" size="sm">
                    {showIcons && <Trophy className="h-4 w-4 mr-2" />}
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" size="sm">
                    {showIcons && <Settings className="h-4 w-4 mr-2" />}
                    Settings
                  </Button>
                </Link>
                {!hideProfileButton && <Link to="/profile">
                    <Button variant="ghost" size="sm">
                      {showIcons && <User className="h-4 w-4 mr-2" />}
                      Profile
                    </Button>
                  </Link>}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  {showIcons && <LogOut className="h-4 w-4 mr-2" />}
                  Logout
                </Button>
              </> : !showAuth ? <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </> : null}
          </div>
        </div>
      </div>
    </header>;
};
export default Header;
