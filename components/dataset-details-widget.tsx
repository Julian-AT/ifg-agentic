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
      <div className="flex flex-col gap-3 rounded-lg border bg-card/60 p-3 transition-colors hover:bg-card/70">
        {/* Header */}
        <div className="flex flex-row items-start gap-2">
          <img
            src={"https://www.data.gv.at/assets/datagvat-logo-b60376ea.svg"}
            alt={"data.gv.at logo"}
            className="mt-0.5 aspect-square h-8 w-8 rounded-sm p-0.5"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="text-muted-foreground text-xs">
              {result.publisher?.name || getLocalizedText(result.catalog?.title) || "data.gv.at"}
            </div>
            <h3 className="font-medium text-sm leading-tight">
              {getLocalizedText(result.title)}
            </h3>
          </div>
        </div>

        {/* Description */}
        {result.description && (
          <div className="line-clamp-2 text-muted-foreground text-xs">
            {getLocalizedText(result.description)}
          </div>
        )}

        {/* Keywords */}
        {result.keywords && result.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.keywords.slice(0, 4).map((keyword) => (
              <span
                key={`${result.id}-${keyword.id}`}
                className="rounded bg-secondary px-2 py-0.5 text-muted-foreground text-xs"
              >
                {keyword.label}
              </span>
            ))}
            {result.keywords.length > 4 && (
              <span className="rounded bg-secondary px-2 py-0.5 text-muted-foreground text-xs">
                +{result.keywords.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Metadata Cards */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {result.distributions && result.distributions.length > 0 && (
            <div className="rounded border border-border/50 bg-background/50 p-2">
              <div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Ressourcen
              </div>
              <div className="font-semibold text-sm">
                {result.distributions.length}
              </div>
            </div>
          )}

          {result.issued && (
            <div className="rounded border border-border/50 bg-background/50 p-2">
              <div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Erstellt
              </div>
              <div className="font-medium text-xs">
                {formatDate(result.issued)}
              </div>
            </div>
          )}

          {result.modified && (
            <div className="rounded border border-border/50 bg-background/50 p-2">
              <div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Aktualisiert
              </div>
              <div className="font-medium text-xs">
                {formatDate(result.modified)}
              </div>
            </div>
          )}

          {result.temporal && result.temporal.length > 0 && (
            <div className="rounded border border-border/50 bg-background/50 p-2">
              <div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Zeitraum
              </div>
              <div className="font-medium text-xs">
                {formatDate(result.temporal[0].gte)} - {formatDate(result.temporal[0].lte)}
              </div>
            </div>
          )}
        </div>

        {/* HVD Badge */}
        {result.is_hvd && (
          <div className="flex">
            <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs">
              High-Value Dataset
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};
