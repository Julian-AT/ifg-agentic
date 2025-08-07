import Link from "next/link";

interface DatasetResult {
  id: string;
  title: string;
  publisher?: string;
  notes?: string;
  tags?: Array<{ display_name: string; id: string }>;
  num_resources?: number;
  metadata_created?: string;
  metadata_modified?: string;
  license_title?: string;
}

interface DatasetDetailsWidgetProps {
  result: DatasetResult;
}

export const DatasetDetailsWidget = ({ result }: DatasetDetailsWidgetProps) => {
  return (
    <Link
      href={`https://www.data.gv.at/katalog/dataset/${result.id}`}
      target="_blank"
    >
      <div className="flex flex-col gap-3 p-3 rounded-lg border bg-card/60 hover:bg-card/70 transition-colors">
        {/* Header */}
        <div className="flex flex-row gap-2 items-start">
          <img
            src={"https://www.data.gv.at/favicon.ico"}
            alt={"data.gv.at logo"}
            className="w-8 h-8 aspect-square rounded-sm bg-secondary border p-1 mt-0.5"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">
              {result.publisher || "data.gv.at"}
            </div>
            <h3 className="font-medium leading-tight text-sm">
              {result.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {result.notes && (
          <div className="text-xs text-muted-foreground line-clamp-1">
            {result.notes}
          </div>
        )}

        {/* Tags */}
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.tags.slice(0, 4).map((tag) => (
              <span
                key={`${result.id}-${tag.id}`}
                className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground"
              >
                {tag.display_name}
              </span>
            ))}
            {result.tags.length > 4 && (
              <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                +{result.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {result.num_resources && (
            <div className="bg-background/50 rounded p-2 border border-border/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Ressourcen
              </div>
              <div className="text-sm font-semibold">
                {result.num_resources}
              </div>
            </div>
          )}

          {result.metadata_created && (
            <div className="bg-background/50 rounded p-2 border border-border/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Erstellt
              </div>
              <div className="text-xs font-medium">
                {new Date(result.metadata_created).toLocaleDateString("de-AT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            </div>
          )}

          {result.metadata_modified && (
            <div className="bg-background/50 rounded p-2 border border-border/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Aktualisiert
              </div>
              <div className="text-xs font-medium">
                {new Date(result.metadata_modified).toLocaleDateString(
                  "de-AT",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }
                )}
              </div>
            </div>
          )}

          {result.license_title && (
            <div className="bg-background/50 rounded p-2 border border-border/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Lizenz
              </div>
              <div
                className="text-xs font-medium truncate"
                title={result.license_title}
              >
                {result.license_title}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
