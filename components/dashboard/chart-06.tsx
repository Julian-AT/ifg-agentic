import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Chart06() {
  return (
    <Card className="gap-5">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle>Anfrageergebnisse</CardTitle>
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">684</div>
              <Badge className="mt-1.5 bg-emerald-500/24 text-emerald-500 border-none">
                +3.4%
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-4"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">
                Vollständig
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-1"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">Teilweise</div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-6"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">
                Abgelehnt
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex gap-1 h-5">
          <div className="bg-chart-4 h-full" style={{ width: "22%" }} />
          <div
            className="bg-linear-to-r from-chart-2 to-chart-1 h-full"
            style={{ width: "24%" }}
          />
          <div className="bg-chart-6 h-full" style={{ width: "16%" }} />
          <div className="bg-chart-3 h-full" style={{ width: "38%" }} />
        </div>
        <div>
          <div className="text-[13px]/3 text-muted-foreground/50 mb-3">
            Gründe für Ablehnung
          </div>
          <ul className="text-sm divide-y divide-border">
            <li className="py-2 flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-chart-4"
                aria-hidden="true"
              />
              <span className="grow text-muted-foreground">
                Vollständige Datenfreigabe erfolgreich.
              </span>
              <span className="text-[13px]/3 font-medium text-foreground/70">
                150
              </span>
            </li>
            <li className="py-2 flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-linear-to-r from-chart-2 to-chart-1"
                aria-hidden="true"
              />
              <span className="grow text-muted-foreground">
                Teilweise Freigabe mit Einschränkungen.
              </span>
              <span className="text-[13px]/3 font-medium text-foreground/70">
                164
              </span>
            </li>
            <li className="py-2 flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-chart-6"
                aria-hidden="true"
              />
              <span className="grow text-muted-foreground">
                Datenschutzrechtliche Bedenken.
              </span>
              <span className="text-[13px]/3 font-medium text-foreground/70">
                109
              </span>
            </li>
            <li className="py-2 flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-chart-3"
                aria-hidden="true"
              />
              <span className="grow text-muted-foreground">
                Keine entsprechenden Daten vorhanden.
              </span>
              <span className="text-[13px]/3 font-medium text-foreground/70">
                261
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
