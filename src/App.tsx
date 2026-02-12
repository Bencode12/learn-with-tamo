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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Store from "./pages/Store";
import GameModes from "./pages/GameModes";
import Exams from "./pages/Exams";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactUs from "./pages/ContactUs";
import HelpCenter from "./pages/HelpCenter";
import StaffHub from "./pages/StaffHub";
import JobInterviewPrep from "./pages/JobInterviewPrep";
import PresentationPrep from "./pages/PresentationPrep";
import HobbyLearning from "./pages/HobbyLearning";
import ProgramLearning from "./pages/ProgramLearning";
import SelfLearning from "./pages/SelfLearning";
import TeacherDashboard from "./pages/TeacherDashboard";
import PublicProfile from "./pages/PublicProfile";
import CurriculumLearning from "./pages/CurriculumLearning";
import SubjectsOverview from "./pages/SubjectsOverview";

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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
            <Route path="/gamemodes" element={<ProtectedRoute><GameModes /></ProtectedRoute>} />
            <Route path="/game-modes" element={<ProtectedRoute><GameModes /></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
            <Route path="/staff-hub" element={<ProtectedRoute><StaffHub /></ProtectedRoute>} />
            <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/job-interview-prep" element={<ProtectedRoute><JobInterviewPrep /></ProtectedRoute>} />
            <Route path="/presentation-prep" element={<ProtectedRoute><PresentationPrep /></ProtectedRoute>} />
            <Route path="/hobby-learning" element={<ProtectedRoute><HobbyLearning /></ProtectedRoute>} />
            <Route path="/program-learning" element={<ProtectedRoute><ProgramLearning /></ProtectedRoute>} />
            <Route path="/self-learning" element={<ProtectedRoute><SelfLearning /></ProtectedRoute>} />
            <Route path="/curriculum" element={<ProtectedRoute><CurriculumLearning /></ProtectedRoute>} />
            <Route path="/subjects" element={<ProtectedRoute><SubjectsOverview /></ProtectedRoute>} />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/help" element={<HelpCenter />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
