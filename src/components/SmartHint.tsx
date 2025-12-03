import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SmartHintProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  context?: string;
  idleTimeout?: number;
  className?: string;
  type?: "input" | "textarea";
  rows?: number;
}

export const SmartHint = ({
  value,
  onChange,
  placeholder,
  context = "general problem",
  idleTimeout = 15000,
  className = "",
  type = "input",
  rows = 4
}: SmartHintProps) => {
  const [hint, setHint] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      setShowHint(false);
      setHint("");

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      if (value.trim()) {
        idleTimerRef.current = setTimeout(() => {
          generateHint();
        }, idleTimeout);
      }
    };

    resetTimer();

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [value, idleTimeout]);

  const generateHint = async () => {
    if (isGenerating || !value.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          messages: [
            {
              role: "user",
              content: `The user is working on: ${context}. They have written: "${value}" and seem stuck. Give a very brief hint (1-2 sentences max) to help them continue. Don't give the answer, just a helpful nudge.`
            }
          ],
          isHint: true
        }
      });

      if (!error && data?.response) {
        setHint(data.response);
        setShowHint(true);
      }
    } catch (error) {
      console.error("Error generating hint:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    setShowHint(false);
    setHint("");
  };

  const baseClass = `w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`;

  return (
    <div className="relative">
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
      
      {showHint && hint && (
        <div className="absolute inset-0 pointer-events-none flex items-center px-3">
          <span className="text-muted-foreground/50 text-sm italic truncate">
            {value}
            <span className="ml-1 text-muted-foreground/40">
              {hint}
            </span>
          </span>
        </div>
      )}
      
      {isGenerating && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
