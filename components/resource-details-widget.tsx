import Link from "next/link";
import { Badge } from "./ui/badge";

interface ResourceResult {
  name: string;
  url?: string;
  format?: string;
  state?: string;
  size?: number;
  language?: string;
  created?: string;
  last_modified?: string;
  mimetype?: string;
  characterSet?: string;
  datastore_active?: boolean;
}

interface ResourceDetailsWidgetProps {
  result: ResourceResult;
}

export const ResourceDetailsWidget = ({
  result,
}: ResourceDetailsWidgetProps) => {
  return (
    <div className="flex flex-col gap-4 bg-card/60 border border-border p-4 rounded-lg">
      {/* Header */}
      <div className="flex flex-row gap-3 items-start">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {result.format || "FILE"}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-semibold leading-tight text-lg">{result.name}</h3>
          {result.url && (
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-1/2 truncate">
              {result.url}
            </p>
          )}
        </div>
      </div>

      {/* Main Resource Details */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Format:
          </span>
          <span className="font-medium">{result.format || "Unbekannt"}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Status:
          </span>
          <span
            className={`font-medium ${
              result.state === "active" ? "text-green-600" : "text-red-600"
            }`}
          >
            {result.state === "active" ? "Aktiv" : result.state}
          </span>
        </div>

        {result.size && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Größe:
            </span>
            <span className="font-medium">
              {(result.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}

        {result.language && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Sprache:
            </span>
            <span className="font-medium">{result.language}</span>
          </div>
        )}

        {result.created && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Erstellt:
            </span>
            <span className="font-medium">
              {new Date(result.created).toLocaleDateString()}
            </span>
          </div>
        )}

        {result.last_modified && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Geändert:
            </span>
            <span className="font-medium">
              {new Date(result.last_modified).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Technical Details */}
      {(result.mimetype || result.characterSet || result.datastore_active) && (
        <div className="border-t pt-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
            Technische Details
          </span>
          <div className="flex flex-wrap gap-2">
            {result.datastore_active && (
              <Badge variant="outline" className="text-xs text-green-600">
                Datastore aktiv
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Download Link */}
      {result.url && (
        <div className="border-t pt-3">
          <Link
            href={result.url}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Ressource herunterladen
          </Link>
        </div>
      )}
    </div>
  );
};
