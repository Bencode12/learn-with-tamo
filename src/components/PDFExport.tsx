import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PDFExportProps {
  type: 'progress' | 'all';
}

export const PDFExport = ({ type }: PDFExportProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    if (!user) {
      toast.error('Please log in to export data');
      return;
    }

    setLoading(true);
    try {
      // Fetch all data
      const [progressRes, profileRes, achievementsRes] = await Promise.all([
        supabase.from('lesson_progress').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', user.id)
      ]);

      const progress = progressRes.data || [];
      const profile = profileRes.data;
      const achievements = achievementsRes.data || [];

      // Generate HTML content for PDF
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SūdžiusAI Progress Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 24px; padding: 48px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 2px solid #e5e7eb; }
    .logo { font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
    .subtitle { color: #6b7280; font-size: 14px; }
    .user-info { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 24px; }
    .avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 600; }
    .user-details { text-align: left; }
    .user-name { font-size: 20px; font-weight: 600; color: #1f2937; }
    .user-level { color: #6b7280; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
    .stat-card { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 20px; border-radius: 16px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1f2937; }
    .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .section-title::before { content: ''; width: 4px; height: 20px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 2px; }
    .lesson-list { space-y: 12px; }
    .lesson-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f9fafb; border-radius: 12px; margin-bottom: 8px; }
    .lesson-name { font-weight: 500; color: #1f2937; }
    .lesson-meta { font-size: 12px; color: #6b7280; }
    .lesson-score { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .achievement-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .achievement { display: flex; align-items: center; gap: 8px; padding: 12px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; }
    .achievement-icon { font-size: 20px; }
    .achievement-name { font-size: 12px; font-weight: 500; color: #92400e; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .generated { font-size: 11px; color: #9ca3af; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📚 SūdžiusAI</div>
      <div class="subtitle">Learning Progress Report</div>
      <div class="user-info">
        <div class="avatar">${profile?.display_name?.[0] || profile?.username?.[0] || 'U'}</div>
        <div class="user-details">
          <div class="user-name">${profile?.display_name || profile?.username || 'Student'}</div>
          <div class="user-level">Level ${profile?.level || 1} • ${profile?.experience || 0} XP</div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${progress.length}</div>
        <div class="stat-label">Lessons</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${progress.filter(p => p.completed).length}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${progress.length > 0 ? Math.round(progress.reduce((s, p) => s + (p.score || 0), 0) / progress.length) : 0}%</div>
        <div class="stat-label">Avg Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(progress.reduce((s, p) => s + p.time_spent, 0) / 60)}h</div>
        <div class="stat-label">Study Time</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Recent Lessons</div>
      <div class="lesson-list">
        ${progress.slice(0, 10).map(p => `
          <div class="lesson-item">
            <div>
              <div class="lesson-name">${p.lesson_id.replace(/-/g, ' ')}</div>
              <div class="lesson-meta">${p.subject_id} • ${p.chapter_id}</div>
            </div>
            ${p.completed ? `<div class="lesson-score">${p.score}%</div>` : '<span style="color:#6b7280;font-size:12px">In Progress</span>'}
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Achievements (${achievements.length})</div>
      <div class="achievement-grid">
        ${achievements.slice(0, 9).map((a: any) => `
          <div class="achievement">
            <span class="achievement-icon">${a.achievements?.icon || '🏆'}</span>
            <span class="achievement-name">${a.achievements?.name || 'Achievement'}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <div>Keep learning and achieving your goals! 🚀</div>
      <div class="generated">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
  </div>
</body>
</html>`;

      // Create and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SudziusAI_Progress_Report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Progress report downloaded! Open in browser and print to PDF.');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={generatePDF} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      Export PDF Report
    </Button>
  );
};
