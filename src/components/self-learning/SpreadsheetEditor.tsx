import { useState, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

interface SpreadsheetEditorProps {
  subject: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

const ROWS = 30;
const COLS = 10;
const COL_LETTERS = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i));

export const SpreadsheetEditor = ({ subject, initialContent = "", onSave }: SpreadsheetEditorProps) => {
  const [cells, setCells] = useState<Record<string, string>>(() => {
    if (initialContent) {
      try {
        return JSON.parse(initialContent);
      } catch {
        return {};
      }
    }
    return {};
  });
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const getCellId = (row: number, col: number) => `${COL_LETTERS[col]}${row + 1}`;

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
    setEditValue(cells[cellId] || "");
  };

  const handleCellChange = (cellId: string, value: string) => {
    setCells(prev => ({ ...prev, [cellId]: value }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (e.key === 'Enter') {
      handleCellChange(getCellId(row, col), editValue);
      const nextCell = getCellId(row + 1, col);
      setSelectedCell(nextCell);
      setEditValue(cells[nextCell] || "");
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCellChange(getCellId(row, col), editValue);
      const nextCol = (col + 1) % COLS;
      const nextRow = nextCol === 0 ? row + 1 : row;
      const nextCell = getCellId(nextRow, nextCol);
      setSelectedCell(nextCell);
      setEditValue(cells[nextCell] || "");
    }
  };

  const evaluateCell = (value: string): string => {
    if (!value.startsWith('=')) return value;
    try {
      // Simple SUM formula support
      const sumMatch = value.match(/^=SUM\(([A-Z]\d+):([A-Z]\d+)\)$/i);
      if (sumMatch) {
        const startCol = sumMatch[1].charCodeAt(0) - 65;
        const startRow = parseInt(sumMatch[1].slice(1)) - 1;
        const endCol = sumMatch[2].charCodeAt(0) - 65;
        const endRow = parseInt(sumMatch[2].slice(1)) - 1;
        let sum = 0;
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            sum += parseFloat(cells[getCellId(r, c)] || '0') || 0;
          }
        }
        return sum.toString();
      }
      return value;
    } catch {
      return '#ERR';
    }
  };

  const handleExport = () => {
    let csv = COL_LETTERS.join(',') + '\n';
    for (let r = 0; r < ROWS; r++) {
      const row = COL_LETTERS.map(c => cells[`${c}${r + 1}`] || '').join(',');
      csv += row + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subject}_spreadsheet.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(JSON.stringify(cells));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <div className="w-16 text-center text-sm font-mono bg-muted rounded px-2 py-1">
          {selectedCell || 'A1'}
        </div>
        <Input
          className="h-8 flex-1 max-w-md font-mono text-sm"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            if (selectedCell) handleCellChange(selectedCell, editValue);
          }}
          placeholder="Enter value or formula (e.g. =SUM(A1:A10))"
        />
        <div className="flex-1" />
        {onSave && (
          <Button variant="outline" size="sm" className="gap-2" onClick={handleSave}>
            <Download className="h-4 w-4" />
            Save
          </Button>
        )}
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="bg-muted border border-border/40 w-10 text-xs text-muted-foreground font-normal sticky left-0 z-20" />
              {COL_LETTERS.map(col => (
                <th key={col} className="bg-muted border border-border/40 px-2 py-1 text-xs text-muted-foreground font-medium min-w-[100px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, row) => (
              <tr key={row}>
                <td className="bg-muted border border-border/40 px-2 py-1 text-xs text-muted-foreground text-center sticky left-0">
                  {row + 1}
                </td>
                {COL_LETTERS.map((col, colIdx) => {
                  const cellId = getCellId(row, colIdx);
                  const isSelected = selectedCell === cellId;
                  return (
                    <td
                      key={cellId}
                      className={`border border-border/40 p-0 ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}`}
                      onClick={() => handleCellClick(cellId)}
                    >
                      {isSelected ? (
                        <input
                          className="w-full h-full px-2 py-1 text-sm outline-none bg-background"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, row, colIdx)}
                          autoFocus
                        />
                      ) : (
                        <div className="px-2 py-1 text-sm min-h-[28px] truncate">
                          {evaluateCell(cells[cellId] || '')}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
