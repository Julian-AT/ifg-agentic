import Link from "next/link";

interface Keyword {
  id: string;
  label: string;
  language: string;
}

interface Catalog {
  id: string;
  title: { [key: string]: string };
  modified?: string;
  issued?: string;
}

interface Publisher {
  type: string;
  name: string;
}

interface Distribution {
  id: string;
  title: { [key: string]: string };
  license?: {
    resource: string;
  };
  access_url?: string[];
}

interface Temporal {
  gte: string;
  lte: string;
}

export interface DatasetResult {
  id: string;
  title: { [key: string]: string };
  description?: { [key: string]: string };
  publisher?: Publisher;
  keywords?: Keyword[];
  distributions?: Distribution[];
  modified?: string;
  issued?: string;
  temporal?: Temporal[];
  catalog?: Catalog;
  is_hvd?: boolean;
}

interface DatasetDetailsWidgetProps {
  result: DatasetResult;
}

export const DatasetDetailsWidget = ({ result }: DatasetDetailsWidgetProps) => {
  const getLocalizedText = (textObj: { [key: string]: string } | undefined, fallback = "") => {
    if (!textObj) return fallback;
    return textObj.de || textObj.en || Object.values(textObj)[0] || fallback;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("de-AT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Link
      href={`https://www.data.gv.at/katalog/dataset/${result.id}`}
      target="_blank"
    >
      <div className="flex flex-col gap-3 p-3 rounded-lg border bg-card/60 hover:bg-card/70 transition-colors">
        {/* Header */}
        <div className="flex flex-row gap-2 items-start">
          <img
            src={"https://www.data.gv.at/assets/datagvat-logo-b60376ea.svg"}
            alt={"data.gv.at logo"}
            className="w-8 h-8 aspect-square rounded-sm p-0.5 mt-0.5"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">
              {result.publisher?.name || getLocalizedText(result.catalog?.title) || "data.gv.at"}
            </div>
            <h3 className="font-medium leading-tight text-sm">
              {getLocalizedText(result.title)}
            </h3>
          </div>
        </div>

        {/* Description */}
        {result.description && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {getLocalizedText(result.description)}
          </div>
        )}

        {/* Keywords */}
        {result.keywords && result.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.keywords.slice(0, 4).map((keyword) => (
              <span
                key={`${result.id}-${keyword.id}`}
                className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground"
              >
                {keyword.label}
              </span>
            ))}
            {result.keywords.length > 4 && (
              <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                +{result.keywords.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {result.distributions && result.distributions.length > 0 && (
            <div className="bg-background/50 rounded p-2 border border-border/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Ressourcen
              </div>
              <div className="text-sm font-semibold">
                {result.distributions.length}
              </div>
            </div>
          )}

          {result.issued && (
            <div className="bg-background/50 rounded p-2 border border-border/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Erstellt
              </div>
              <div className="text-xs font-medium">
                {formatDate(result.issued)}
              </div>
            </div>
          )}

          {result.modified && (
            <div className="bg-background/50 rounded p-2 border border-border/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Aktualisiert
              </div>
              <div className="text-xs font-medium">
                {formatDate(result.modified)}
              </div>
            </div>
          )}

          {result.temporal && result.temporal.length > 0 && (
            <div className="bg-background/50 rounded p-2 border border-border/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Zeitraum
              </div>
              <div className="text-xs font-medium">
                {formatDate(result.temporal[0].gte)} - {formatDate(result.temporal[0].lte)}
              </div>
            </div>
          )}
        </div>

        {/* HVD Badge */}
        {result.is_hvd && (
          <div className="flex">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              High-Value Dataset
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};
