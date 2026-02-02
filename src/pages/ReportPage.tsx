import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { scanService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Printer, FileText, User, Calendar, Activity, Brain, AlertTriangle } from "lucide-react";

export default function ReportPage() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: scanData, isLoading: scanLoading } = useQuery({
    queryKey: ["scan", scanId],
    queryFn: () => scanService.getScanById(scanId!),
    enabled: !!scanId,
  });

  const { data: resultData, isLoading: resultLoading } = useQuery({
    queryKey: ["scan-result", scanId],
    queryFn: () => scanService.getAnalysisResult(scanId!),
    enabled: !!scanId,
  });

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    // In production, this would generate a PDF via backend
    alert("PDF download functionality would be implemented with backend integration");
  };

  if (scanLoading || resultLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[800px] w-full" />
      </div>
    );
  }

  const scan = scanData?.data;
  const result = resultData?.data;
  const patient = scan?.patient;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diagnostic Report</h1>
            <p className="text-muted-foreground">Report ID: RPT-{scanId?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="mx-auto max-w-4xl">
        <Card className="overflow-hidden">
          {/* Report Header */}
          <div className="bg-primary px-6 py-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8" />
                <div>
                  <h2 className="text-xl font-bold">CT Scan Analysis Report</h2>
                  <p className="text-sm opacity-90">AI-Powered Brain Stroke Detection System</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p>Report Generated</p>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <CardContent className="space-y-6 p-6">
            {/* Patient Information */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Patient Information</h3>
              </div>
              <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Patient Name</p>
                  <p className="font-medium">{patient?.firstName} {patient?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-medium">{patient?.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{patient?.gender}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Scan Information */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Scan Details</h3>
              </div>
              <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Scan ID</p>
                  <p className="font-medium">{scan?.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scan Date</p>
                  <p className="font-medium">{scan?.scanDate ? new Date(scan.scanDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modality</p>
                  <p className="font-medium">{scan?.metadata?.modality || "CT"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Body Part</p>
                  <p className="font-medium">{scan?.metadata?.bodyPart || "Brain"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Slice Count</p>
                  <p className="font-medium">{scan?.sliceCount} slices</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="font-medium">{scan?.format}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* AI Analysis Results */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Analysis Results</h3>
              </div>
              <div className={`rounded-lg border-2 p-6 ${result?.prediction === "stroke" ? "border-destructive bg-destructive/5" : "border-green-500 bg-green-500/5"}`}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Finding</p>
                    <p className="text-2xl font-bold">
                      {result?.prediction === "stroke" ? "Stroke Detected" : "No Stroke Detected"}
                    </p>
                  </div>
                  <Badge 
                    variant={result?.prediction === "stroke" ? "destructive" : "default"}
                    className="text-lg px-4 py-2"
                  >
                    {((result?.confidence || 0) * 100).toFixed(1)}% Confidence
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Model Used</p>
                    <p className="font-medium">{result?.modelName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model Version</p>
                    <p className="font-medium">{result?.modelVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processing Time</p>
                    <p className="font-medium">{result?.processingTime}ms</p>
                  </div>
                </div>
              </div>

              {result?.affectedRegions && result.affectedRegions.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Affected Regions Identified:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.affectedRegions.map((region, index) => (
                      <Badge key={index} variant="outline">
                        {region.name} ({(region.confidence * 100).toFixed(0)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <Separator />

            {/* Clinical Impression */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Clinical Impression</h3>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground">
                  {result?.prediction === "stroke" 
                    ? "AI analysis indicates potential cerebrovascular abnormality. The CNN–GA–BiLSTM hybrid model has identified regions of concern with high confidence. Immediate clinical correlation and expert radiological review is strongly recommended."
                    : "AI analysis indicates no significant abnormalities detected in the brain CT scan. The CNN–GA–BiLSTM hybrid model analysis shows normal brain parenchyma. Routine clinical follow-up as indicated."}
                </p>
              </div>
            </section>

            <Separator />

            {/* Recommendations */}
            <section>
              <h3 className="mb-4 text-lg font-semibold">Recommendations</h3>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                {result?.prediction === "stroke" ? (
                  <>
                    <li>Urgent neurological consultation recommended</li>
                    <li>Consider MRI for detailed evaluation</li>
                    <li>Clinical correlation with patient symptoms required</li>
                    <li>Monitor for progression of neurological deficits</li>
                  </>
                ) : (
                  <>
                    <li>No immediate intervention required based on AI analysis</li>
                    <li>Continue routine monitoring as clinically indicated</li>
                    <li>Correlate with clinical findings and patient history</li>
                  </>
                )}
              </ul>
            </section>

            {/* Disclaimer */}
            <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-700">Medical Disclaimer</p>
                  <p className="mt-1 text-amber-700/80">
                    This report is generated by an AI-powered diagnostic assistance system and is intended to support, 
                    not replace, professional medical judgment. All findings must be reviewed and confirmed by a qualified 
                    radiologist or physician before any clinical decisions are made. The AI model achieves 96% accuracy 
                    in controlled studies but should not be used as the sole basis for diagnosis.
                  </p>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Analyzed by</p>
                <p className="font-medium">CNN–GA–BiLSTM AI System</p>
                <p className="text-sm text-muted-foreground">v2.1.0</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Reviewed by</p>
                <p className="font-medium">_________________________</p>
                <p className="text-sm text-muted-foreground">Radiologist Signature</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
