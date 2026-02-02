import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { scanService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, FileImage, Loader2, Upload, X } from "lucide-react";

export default function PatientUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!files.length) return;
    try {
      setUploading(true);
      setProgress(20);
      const uploadRes = await scanService.uploadScanAsPatient(files);
      setProgress(70);

      // Start mocked analysis automatically so patient can track status
      try {
        await scanService.analyzeScan(uploadRes.data.id);
      } catch {
        // ok: analysis might be triggered by staff later in real system
      }

      setProgress(100);
      toast({
        title: "Scan submitted",
        description:
          "Your upload was received. You can track its status in My Scans.",
      });
      navigate(`/patient/scans/${uploadRes.data.id}`);
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Could not submit your scan",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload CT Scan</h1>
        <p className="text-muted-foreground">
          Submit your scan for clinical review and analysis.
        </p>
      </div>

      <Alert>
        <div className="flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <div>
            <p className="font-medium">What happens next?</p>
            <p className="text-muted-foreground">
              Your scan will be processed and reviewed. Final diagnosis is
              provided in the report.
            </p>
          </div>
        </div>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Upload images</CardTitle>
          <CardDescription>
            PNG/JPG supported. DICOM support can be added later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-colors hover:border-primary/50"
            onClick={() =>
              document.getElementById("patient-file-input")?.click()
            }
          >
            <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-center font-medium">Drag & drop images here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <input
              id="patient-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {files.length} file(s) selected
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 truncate text-sm">{file.name}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting your scan…</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!files.length || uploading}
            onClick={handleSubmit}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              "Submit Scan"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
