import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ExportDataButtonProps {
  type: 'progress' | 'exams' | 'achievements' | 'all';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const ExportDataButton = ({ type, variant = 'outline', size = 'default' }: ExportDataButtonProps) => {
  const { user } = useAuth();

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    if (!user) {
      toast.error('You must be logged in to export data');
      return;
    }

    try {
      let data: any[] = [];
      let filename = '';

      if (type === 'progress' || type === 'all') {
        const { data: progressData, error } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        if (progressData) data = [...data, ...progressData];
        filename = 'lesson_progress.csv';
      }

      if (type === 'exams' || type === 'all') {
        const { data: examData, error } = await supabase
          .from('exam_attempts')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        if (examData) data = type === 'all' ? [...data, ...examData] : examData;
        filename = type === 'exams' ? 'exam_attempts.csv' : 'all_data.csv';
      }

      if (type === 'achievements' || type === 'all') {
        const { data: achievementData, error } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', user.id);
        
        if (error) throw error;
        if (achievementData) {
          const flatData = achievementData.map(a => ({
            ...a,
            achievement_name: a.achievements?.name,
            achievement_description: a.achievements?.description
          }));
          data = type === 'all' ? [...data, ...flatData] : flatData;
          filename = type === 'achievements' ? 'achievements.csv' : 'all_data.csv';
        }
      }

      if (data.length > 0) {
        exportToCSV(data, filename);
        toast.success('Data exported successfully!');
      } else {
        toast.info('No data available to export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'progress': return 'Export Progress';
      case 'exams': return 'Export Exam Results';
      case 'achievements': return 'Export Achievements';
      case 'all': return 'Export All Data';
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      {getButtonText()}
    </Button>
  );
};