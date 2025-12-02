import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Check, X, Code } from "lucide-react";
import { toast } from "sonner";

interface TestCase {
  input: string;
  expected: string;
}

export const LeetCodeLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Write your solution here
  
}`);
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; actual: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  const problem = {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]" },
      { input: "[3,2,4], 6", expected: "[1,2]" },
      { input: "[3,3], 6", expected: "[0,1]" }
    ]
  };

  const runCode = () => {
    try {
      // Simulate running test cases
      const results = problem.testCases.map(testCase => ({
        passed: true, // In real implementation, actually run the code
        input: testCase.input,
        expected: testCase.expected,
        actual: testCase.expected
      }));
      
      setTestResults(results);
      setShowResults(true);
      
      const allPassed = results.every(r => r.passed);
      if (allPassed) {
        toast.success("All test cases passed!");
      } else {
        toast.error("Some test cases failed");
      }
    } catch (error) {
      toast.error("Runtime error");
    }
  };

  const handleSubmit = () => {
    runCode();
    // If all tests pass, complete the lesson
    if (testResults.every(r => r.passed)) {
      onComplete();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{problem.title}</CardTitle>
              <Badge variant={problem.difficulty === "Easy" ? "default" : "destructive"}>
                {problem.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="space-y-4">
                <p className="text-muted-foreground">{problem.description}</p>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-4">
                {problem.examples.map((example, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4 space-y-2">
                      <div>
                        <strong>Input:</strong> {example.input}
                      </div>
                      <div>
                        <strong>Output:</strong> {example.output}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Code Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm min-h-[400px]"
                placeholder="Write your solution here..."
              />
            </CardContent>
          </Card>

          <div className="flex space-x-3">
            <Button onClick={runCode} variant="outline" className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
              Submit
            </Button>
          </div>

          {showResults && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {testResults.map((result, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-2 ${result.passed ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {result.passed ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-semibold">Test Case {idx + 1}</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Input:</strong> {result.input}</div>
                      <div><strong>Expected:</strong> {result.expected}</div>
                      {!result.passed && <div><strong>Actual:</strong> {result.actual}</div>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};