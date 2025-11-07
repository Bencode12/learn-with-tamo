
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Store from "./pages/Store";
import GameModes from "./pages/GameModes";
import SingleMode from "./pages/SingleMode";
import DuosMode from "./pages/DuosMode";
import RankedMode from "./pages/RankedMode";
import TeamMode from "./pages/TeamMode";
import LessonStart from "./pages/LessonStart";
import Lesson from "./pages/Lesson";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
            <Route path="/gamemodes" element={<ProtectedRoute><GameModes /></ProtectedRoute>} />
            <Route path="/single-mode" element={<ProtectedRoute><SingleMode /></ProtectedRoute>} />
            <Route path="/duos-mode" element={<ProtectedRoute><DuosMode /></ProtectedRoute>} />
            <Route path="/ranked-mode" element={<ProtectedRoute><RankedMode /></ProtectedRoute>} />
            <Route path="/team-mode" element={<ProtectedRoute><TeamMode /></ProtectedRoute>} />
            <Route path="/lesson-start" element={<ProtectedRoute><LessonStart /></ProtectedRoute>} />
            <Route path="/lesson" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
