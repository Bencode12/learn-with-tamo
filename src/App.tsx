
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/store" element={<Store />} />
          <Route path="/game-modes" element={<GameModes />} />
          <Route path="/single-mode" element={<SingleMode />} />
          <Route path="/duos-mode" element={<DuosMode />} />
          <Route path="/ranked-mode" element={<RankedMode />} />
          <Route path="/team-mode" element={<TeamMode />} />
          <Route path="/lesson-start" element={<LessonStart />} />
          <Route path="/lesson" element={<Lesson />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
