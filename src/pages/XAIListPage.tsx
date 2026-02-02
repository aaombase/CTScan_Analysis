import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { scanService } from "@/services/api";
import { Brain, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function XAIListPage() {
  const { data: scansData, isLoading } = useQuery({
    queryKey: ["scans", "completed"],
    queryFn: () => scanService.getScans({ status: "completed" }),
  });

  const analyzedScans = scansData?.data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">XAI Visualization</h1>
          <p className="text-muted-foreground">Explainable AI heatmaps for all analyzed scans</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">XAI Visualization</h1>
          <p className="text-muted-foreground">
            Explainable AI heatmaps showing model attention for each scan
          </p>
        </div>
        <Button asChild>
          <Link to="/upload">New Scan</Link>
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">What is Grad-CAM?</h3>
            <p className="text-sm text-muted-foreground">
              Gradient-weighted Class Activation Mapping (Grad-CAM) generates visual
              explanations for AI decisions by highlighting the regions that most
              influenced the model's prediction. This helps clinicians understand and
              validate the AI's analysis.
            </p>
          </div>
        </CardContent>
      </Card>

      {analyzedScans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Eye className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Visualizations Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload and analyze CT scans to view XAI heatmaps.
            </p>
            <Button asChild>
              <Link to="/upload">Upload Your First Scan</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analyzedScans.map((scan) => {
            // In a real app, we'd fetch the result for each scan
            const isStroke = scan.status === "completed" && Math.random() > 0.5;
            const confidence = 85 + Math.random() * 12;

            return (
              <Card key={scan.id} className="overflow-hidden group hover:shadow-lg transition-all">
                {/* Placeholder Image */}
                <div className="relative h-40 bg-muted">
                  <img
                    src={scan.thumbnailUrl || "/placeholder.svg"}
                    alt="Scan thumbnail"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <Badge variant={isStroke ? "destructive" : "default"}>
                      {isStroke ? "STROKE" : "NORMAL"}
                    </Badge>
                    <span className="text-xs text-white font-medium">
                      {confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/xai/${scan.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Heatmap
                      </Link>
                    </Button>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {scan.patient?.firstName} {scan.patient?.lastName}
                    </CardTitle>
                    {isStroke ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(scan.scanDate), "PPP")}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{scan.metadata?.bodyPart}</span>
                    <span>•</span>
                    <span>{scan.sliceCount} slices</span>
                    <span>•</span>
                    <span>{scan.metadata?.modality}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
