import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { scanService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Info, ZoomIn, ZoomOut, RotateCcw, Download, Brain, Eye, Layers } from "lucide-react";

export default function XAIVisualizationPage() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(1);
  const [activeView, setActiveView] = useState("overlay");

  const { data: result, isLoading } = useQuery({
    queryKey: ["scan-result", scanId],
    queryFn: () => scanService.getAnalysisResult(scanId!),
    enabled: !!scanId,
  });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  const analysisResult = result?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Explainable AI Visualization</h1>
            <p className="text-muted-foreground">Grad-CAM heatmap analysis for scan #{scanId?.slice(0, 8)}</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Images
        </Button>
      </div>

      {/* XAI Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 pt-6">
          <div className="rounded-full bg-primary/10 p-3">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Understanding Grad-CAM Visualization</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Gradient-weighted Class Activation Mapping (Grad-CAM) highlights the regions of the CT scan that the 
              CNN–GA–BiLSTM model focused on when making its prediction. Warmer colors (red, orange) indicate areas 
              of higher importance, while cooler colors (blue, green) show less influential regions.
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Explainable AI (XAI) techniques like Grad-CAM help clinicians understand and validate AI predictions, ensuring transparency in medical diagnosis.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Heatmap Visualization</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
                  <Button variant="outline" size="icon" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleResetZoom}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeView} onValueChange={setActiveView}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="original" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Original
                  </TabsTrigger>
                  <TabsTrigger value="heatmap" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Heatmap
                  </TabsTrigger>
                  <TabsTrigger value="overlay" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Overlay
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 overflow-hidden rounded-lg border bg-black">
                  <TabsContent value="original" className="m-0">
                    <div 
                      className="flex items-center justify-center p-4"
                      style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
                    >
                      <img
                        src="/placeholder.svg"
                        alt="Original CT Scan"
                        className="h-[400px] w-auto object-contain"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="heatmap" className="m-0">
                    <div 
                      className="flex items-center justify-center p-4"
                      style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
                    >
                      <div className="relative h-[400px] w-auto">
                        <img
                          src="/placeholder.svg"
                          alt="Grad-CAM Heatmap"
                          className="h-full w-auto object-contain"
                          style={{ filter: "hue-rotate(180deg) saturate(2)" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-yellow-500/30 to-green-500/20 mix-blend-overlay" />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="overlay" className="m-0">
                    <div 
                      className="flex items-center justify-center p-4"
                      style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
                    >
                      <div className="relative h-[400px] w-auto">
                        <img
                          src="/placeholder.svg"
                          alt="Overlay View"
                          className="h-full w-auto object-contain opacity-70"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/50 via-orange-500/30 to-transparent mix-blend-screen" />
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Color Legend */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="text-xs text-muted-foreground">Low Importance</span>
                <div className="flex h-4 w-48 overflow-hidden rounded">
                  <div className="flex-1 bg-blue-500" />
                  <div className="flex-1 bg-cyan-500" />
                  <div className="flex-1 bg-green-500" />
                  <div className="flex-1 bg-yellow-500" />
                  <div className="flex-1 bg-orange-500" />
                  <div className="flex-1 bg-red-500" />
                </div>
                <span className="text-xs text-muted-foreground">High Importance</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Result</span>
                <Badge variant={analysisResult?.prediction === "stroke" ? "destructive" : "default"}>
                  {analysisResult?.prediction === "stroke" ? "Stroke Detected" : "Normal"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <span className="font-semibold">{((analysisResult?.confidence || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Model</span>
                <span className="text-sm">{analysisResult?.modelName || "CNN–GA–BiLSTM"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affected Regions</CardTitle>
              <CardDescription>Areas identified by the model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult?.affectedRegions?.map((region, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">{region.name}</span>
                    <Badge variant="outline">{(region.confidence * 100).toFixed(0)}%</Badge>
                  </div>
                )) || (
                  <>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">Left Hemisphere</span>
                      <Badge variant="outline">87%</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">Frontal Lobe</span>
                      <Badge variant="outline">72%</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">Temporal Region</span>
                      <Badge variant="outline">45%</Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 shrink-0 text-amber-500" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Medical Disclaimer:</strong> This AI visualization is intended as a diagnostic aid only. All findings must be verified by a qualified radiologist before clinical decisions are made.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
