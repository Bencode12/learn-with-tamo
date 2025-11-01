import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, User, LogOut } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";

interface HeaderProps {
  showAuth?: boolean;
}

const Header = ({ showAuth = true }: HeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SūdžiusAI</span>
          </Link>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {showAuth ? (
              <>
                <Link to="/store">
                  <Button variant="ghost" size="sm">Store</Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="ghost" size="sm">Leaderboard</Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" size="sm">Settings</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">Profile</Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
