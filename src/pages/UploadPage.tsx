import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { scanService } from "@/services/api";
import { Upload, X, FileImage, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      setProgress(30);
      const uploadRes = await scanService.uploadScan(files, "pat_001");
      
      setProgress(60);
      setUploading(false);
      setAnalyzing(true);
      
      const result = await scanService.analyzeScan(uploadRes.data.id);
      setProgress(100);
      
      toast({ title: "Analysis Complete", description: `Result: ${result.data.prediction === "stroke" ? "Stroke Detected" : "Normal"} (${result.data.confidence}% confidence)` });
      navigate("/results", { state: { result: result.data } });
    } catch (error) {
      toast({ title: "Error", description: "Analysis failed", variant: "destructive" });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload CT Scan</h1>
        <p className="text-muted-foreground">Upload brain CT images for AI-powered stroke detection</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>Supports PNG, JPG formats. DICOM support coming soon.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-colors hover:border-primary/50"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-center font-medium">Drag & drop CT images here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <input id="file-input" type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{files.length} file(s) selected</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 truncate text-sm">{file.name}</div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(i)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {(uploading || analyzing) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{uploading ? "Uploading..." : "Analyzing with CNN-GA-BiLSTM model..."}</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>This AI tool is for clinical decision support only. All results must be verified by a qualified radiologist.</p>
          </div>

          <Button onClick={handleAnalyze} disabled={files.length === 0 || uploading || analyzing} className="w-full" size="lg">
            {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Scan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
