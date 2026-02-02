import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/types";
import { AlertTriangle, CheckCircle, Brain, FileText, Eye, Download } from "lucide-react";

export default function ResultsPage() {
  const location = useLocation();
  const result = location.state?.result as AnalysisResult | undefined;

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">No results available. Upload a scan first.</p>
        <Button asChild className="mt-4"><Link to="/upload">Upload Scan</Link></Button>
      </div>
    );
  }

  const isStroke = result.prediction === "stroke";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analysis Results</h1>
        <p className="text-muted-foreground">AI-powered brain stroke detection analysis</p>
      </div>

      {/* Main Result Card */}
      <Card className={isStroke ? "border-destructive/50 bg-destructive/5" : "border-success/50 bg-success/5"}>
        <CardContent className="flex items-center gap-6 p-6">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${isStroke ? "bg-destructive/20" : "bg-success/20"}`}>
            {isStroke ? <AlertTriangle className="h-10 w-10 text-destructive" /> : <CheckCircle className="h-10 w-10 text-success" />}
          </div>
          <div className="flex-1">
            <Badge variant={isStroke ? "destructive" : "default"} className="mb-2">
              {isStroke ? "STROKE DETECTED" : "NORMAL"}
            </Badge>
            <h2 className="text-2xl font-bold">{isStroke ? "Abnormality Detected" : "No Stroke Detected"}</h2>
            <p className="text-muted-foreground">Confidence: {result.confidence}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Processing Time</p>
            <p className="text-xl font-bold">{(result.processingTime / 1000).toFixed(2)}s</p>
          </div>
        </CardContent>
      </Card>

      {/* Model Info */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Model Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div><p className="text-sm text-muted-foreground">Model</p><p className="font-medium">{result.modelName}</p></div>
          <div><p className="text-sm text-muted-foreground">Version</p><p className="font-medium">{result.modelVersion}</p></div>
          <div><p className="text-sm text-muted-foreground">Architecture</p><p className="font-medium">CNN + GA + BiLSTM</p></div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button asChild variant="outline"><Link to="/xai"><Eye className="mr-2 h-4 w-4" /> View Heatmap</Link></Button>
        <Button asChild><Link to="/reports"><FileText className="mr-2 h-4 w-4" /> Generate Report</Link></Button>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        <strong>Medical Disclaimer:</strong> This AI analysis is intended for clinical decision support only. Results must be verified by qualified medical professionals before any clinical decisions are made.
      </div>
    </div>
  );
}
