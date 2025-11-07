import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Store, Trophy, Settings, User, LogOut, ArrowLeft } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { LivesDisplay } from "./LivesDisplay";
import { CoinsDisplay } from "./CoinsDisplay";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  showAuth?: boolean;
  showIcons?: boolean;
  showBackButton?: boolean;
  hideAuthButtons?: boolean;
  hideProfileButton?: boolean;
}

const Header = ({ showAuth = true, showIcons = false, showBackButton = false, hideAuthButtons = false, hideProfileButton = false }: HeaderProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            )}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SūdžiusAI</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {showAuth && !hideAuthButtons && (
              <>
                <LivesDisplay />
                <CoinsDisplay />
              </>
            )}
            <LanguageSelector />
            {showAuth && !hideAuthButtons ? (
              <>
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
                {!hideProfileButton && (
                  <Link to="/profile">
                    <Button variant="ghost" size="sm">
                      {showIcons && <User className="h-4 w-4 mr-2" />}
                      Profile
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  {showIcons && <LogOut className="h-4 w-4 mr-2" />}
                  Logout
                </Button>
              </>
            ) : !showAuth ? (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
