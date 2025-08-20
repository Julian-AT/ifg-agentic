"use client";

import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  XCircle,
  Trash2,
  Bot,
  Filter,
  Search,
  CheckCircle,
  Check,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle2,
  XCircle as XCircleIcon,
  AlertCircle,
} from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DataRequest = {
  id: string;
  title: string;
  requestType: "IFG" | "IWG" | "DZG";
  status: "Pending" | "In Review" | "Approved" | "Rejected" | "Completed";
  requester: string;
  organization: string;
  submittedDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  progress: number;
  estimatedCompletion: string;
  assignedTo?: string;
};

const statusFilterFn: FilterFn<DataRequest> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

interface GetColumnsProps {
  data: DataRequest[];
  setData: React.Dispatch<React.SetStateAction<DataRequest[]>>;
}

const getColumns = ({
  data,
  setData,
}: GetColumnsProps): ColumnDef<DataRequest>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Titel",
    accessorKey: "title",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
          <FileText size={16} />
        </div>
        <div className="font-medium">{row.getValue("title")}</div>
      </div>
    ),
    size: 250,
    enableHiding: false,
  },
  {
    header: "Typ",
    accessorKey: "requestType",
    cell: ({ row }) => {
      const type = row.getValue("requestType") as string;
      const typeColors = {
        IFG: "bg-blue-100 text-blue-800",
        IWG: "bg-green-100 text-green-800",
        DZG: "bg-purple-100 text-purple-800",
      };
      return (
        <Badge
          className={cn("text-xs", typeColors[type as keyof typeof typeColors])}
        >
          {type}
        </Badge>
      );
    },
    size: 80,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = {
        Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
        "In Review": { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
        Approved: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
        Rejected: { color: "bg-red-100 text-red-800", icon: XCircleIcon },
        Completed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      const Icon = config?.icon || Clock;

      return (
        <div className="flex items-center h-full">
          <Badge
            variant="outline"
            className={cn("gap-1 py-0.5 px-2 text-sm", config?.color)}
          >
            <Icon size={14} className="text-current" />
            {status}
          </Badge>
        </div>
      );
    },
    size: 120,
    filterFn: statusFilterFn,
  },
  {
    header: "Antragsteller",
    accessorKey: "requester",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.getValue("requester")}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.organization}
        </div>
      </div>
    ),
    size: 180,
  },
  {
    header: "Eingereicht",
    accessorKey: "submittedDate",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("submittedDate")}
      </span>
    ),
    size: 120,
  },
  {
    header: "Priorität",
    accessorKey: "priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      const priorityColors = {
        Low: "bg-gray-100 text-gray-800",
        Medium: "bg-blue-100 text-blue-800",
        High: "bg-orange-100 text-orange-800",
        Urgent: "bg-red-100 text-red-800",
      };
      return (
        <Badge
          className={cn(
            "text-xs",
            priorityColors[priority as keyof typeof priorityColors]
          )}
        >
          {priority}
        </Badge>
      );
    },
    size: 100,
  },
  {
    header: "Fortschritt",
    accessorKey: "progress",
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number;
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-full w-full items-center">
                <Progress className="h-2 max-w-20" value={progress} />
              </div>
            </TooltipTrigger>
            <TooltipContent align="start" sideOffset={-8}>
              <p>{progress}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 100,
  },
  {
    header: "Fertigstellung",
    accessorKey: "estimatedCompletion",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("estimatedCompletion")}
      </span>
    ),
    size: 120,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <RowActions setData={setData} data={data} item={row.original} />
    ),
    size: 60,
    enableHiding: false,
  },
];

export default function DataRequestTable() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "submittedDate",
      desc: true,
    },
  ]);

  const [data, setData] = useState<DataRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const columns = useMemo(() => getColumns({ data, setData }), [data]);

  useEffect(() => {
    // Simulate loading demo data
    const demoData: DataRequest[] = [
      {
        id: "REQ-001",
        title: "Verkehrsdaten Wien 2024 - Öffentlicher Nahverkehr",
        requestType: "IFG",
        status: "In Review",
        requester: "Dr. Maria Schmidt",
        organization: "Universität Wien - Institut für Verkehrswissenschaften",
        submittedDate: "15.01.2024",
        priority: "Medium",
        progress: 45,
        estimatedCompletion: "28.02.2024",
        assignedTo: "Magistrat Wien - Verkehrsabteilung",
      },
      {
        id: "REQ-002",
        title: "Umweltdaten Niederösterreich - Luftqualitätsmessungen",
        requestType: "DZG",
        status: "Approved",
        requester: "Prof. Hans Weber",
        organization: "TU Wien - Institut für Umweltingenieurwesen",
        submittedDate: "10.01.2024",
        priority: "High",
        progress: 80,
        estimatedCompletion: "25.01.2024",
        assignedTo: "Amt der NÖ Landesregierung",
      },
      {
        id: "REQ-003",
        title: "Wirtschaftsdaten Salzburg - Tourismusstatistiken",
        requestType: "IWG",
        status: "Completed",
        requester: "Mag. Lisa Müller",
        organization: "Salzburg Research - Tourismusforschung",
        submittedDate: "05.01.2024",
        priority: "Low",
        progress: 100,
        estimatedCompletion: "20.01.2024",
        assignedTo: "Land Salzburg - Wirtschaftsabteilung",
      },
      {
        id: "REQ-004",
        title: "Gesundheitsdaten Tirol - Krankenhausstatistiken",
        requestType: "IFG",
        status: "Pending",
        requester: "Dr. Thomas Bauer",
        organization: "MedUni Innsbruck - Institut für Public Health",
        submittedDate: "20.01.2024",
        priority: "Urgent",
        progress: 15,
        estimatedCompletion: "10.02.2024",
        assignedTo: "Land Tirol - Gesundheitsabteilung",
      },
      {
        id: "REQ-005",
        title: "Bildungsdaten Vorarlberg - Schülerstatistiken",
        requestType: "DZG",
        status: "Rejected",
        requester: "Prof. Anna Klein",
        organization: "PH Vorarlberg - Institut für Bildungsforschung",
        submittedDate: "12.01.2024",
        priority: "Medium",
        progress: 0,
        estimatedCompletion: "N/A",
        assignedTo: "Land Vorarlberg - Bildungsabteilung",
      },
      {
        id: "REQ-006",
        title: "Verkehrsinfrastruktur Graz - Straßennetz-Daten",
        requestType: "IWG",
        status: "In Review",
        requester: "DI Michael Wagner",
        organization: "Graz University - Institut für Verkehrsplanung",
        submittedDate: "18.01.2024",
        priority: "High",
        progress: 60,
        estimatedCompletion: "05.02.2024",
        assignedTo: "Stadt Graz - Verkehrsabteilung",
      },
      {
        id: "REQ-007",
        title: "Klimadaten Kärnten - Niederschlagsmessungen",
        requestType: "IFG",
        status: "Approved",
        requester: "Dr. Petra Huber",
        organization: "BOKU Wien - Institut für Meteorologie",
        submittedDate: "08.01.2024",
        priority: "Medium",
        progress: 75,
        estimatedCompletion: "30.01.2024",
        assignedTo: "Land Kärnten - Umweltabteilung",
      },
      {
        id: "REQ-008",
        title: "Tourismusdaten Burgenland - Übernachtungsstatistiken",
        requestType: "IWG",
        status: "Pending",
        requester: "Mag. Stefan Wolf",
        organization: "FH Burgenland - Institut für Tourismus",
        submittedDate: "22.01.2024",
        priority: "Low",
        progress: 25,
        estimatedCompletion: "15.02.2024",
        assignedTo: "Land Burgenland - Tourismusabteilung",
      },
      {
        id: "REQ-009",
        title: "Energiedaten Oberösterreich - Stromverbrauch",
        requestType: "IFG",
        status: "In Review",
        requester: "Dr. Claudia Fischer",
        organization: "JKU Linz - Institut für Energiewirtschaft",
        submittedDate: "25.01.2024",
        priority: "High",
        progress: 35,
        estimatedCompletion: "12.02.2024",
        assignedTo: "Land OÖ - Energieabteilung",
      },
      {
        id: "REQ-010",
        title: "Sozialdaten Steiermark - Bevölkerungsentwicklung",
        requestType: "DZG",
        status: "Approved",
        requester: "Prof. Robert Mayer",
        organization: "Uni Graz - Institut für Soziologie",
        submittedDate: "14.01.2024",
        priority: "Medium",
        progress: 90,
        estimatedCompletion: "22.01.2024",
        assignedTo: "Land Steiermark - Sozialabteilung",
      },
    ];

    // Simulate API delay
    setTimeout(() => {
      setData(demoData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const updatedData = data.filter(
      (item) => !selectedRows.some((row) => row.original.id === item.id)
    );
    setData(updatedData);
    table.resetRowSelection();
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  // Extract complex expressions into separate variables
  const statusColumn = table.getColumn("status");
  const statusFacetedValues = statusColumn?.getFacetedUniqueValues();
  const statusFilterValue = statusColumn?.getFilterValue();

  // Update useMemo hooks with simplified dependencies
  const uniqueStatusValues = useMemo(() => {
    if (!statusColumn) return [];
    const values = Array.from(statusFacetedValues?.keys() ?? []);
    return values.sort();
  }, [statusColumn, statusFacetedValues]);

  const statusCounts = useMemo(() => {
    if (!statusColumn) return new Map();
    return statusFacetedValues ?? new Map();
  }, [statusColumn, statusFacetedValues]);

  const selectedStatuses = useMemo(() => {
    return (statusFilterValue as string[]) ?? [];
  }, [statusFilterValue]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("status")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Filter by title */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 ps-9 bg-background bg-gradient-to-br from-accent/60 to-accent",
                Boolean(table.getColumn("title")?.getFilterValue()) && "pe-9"
              )}
              value={
                (table.getColumn("title")?.getFilterValue() ?? "") as string
              }
              onChange={(e) =>
                table.getColumn("title")?.setFilterValue(e.target.value)
              }
              placeholder="Nach Titel suchen"
              type="text"
              aria-label="Nach Titel suchen"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/60 peer-disabled:opacity-50">
              <Search size={20} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("title")?.getFilterValue()) && (
              <button
                type="button"
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/60 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Filter löschen"
                onClick={() => {
                  table.getColumn("title")?.setFilterValue("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <XCircle size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Delete button */}
          {table.getSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="ml-auto" variant="outline">
                  <Trash2
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Löschen
                  <span className="-me-1 ms-1 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                    aria-hidden="true"
                  >
                    <AlertTriangle className="opacity-80" size={16} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Diese Aktion kann nicht rückgängig gemacht werden. Dies
                      wird {table.getSelectedRowModel().rows.length} ausgewählte{" "}
                      {table.getSelectedRowModel().rows.length === 1
                        ? "Antrag"
                        : "Anträge"}{" "}
                      permanent löschen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRows}>
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {/* Filter by status */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter
                  className="size-5 -ms-1.5 text-muted-foreground/60"
                  size={20}
                  aria-hidden="true"
                />
                Filter
                {selectedStatuses.length > 0 && (
                  <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                    {selectedStatuses.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="end">
              <div className="space-y-3">
                <div className="text-xs font-medium uppercase text-muted-foreground/60">
                  Status
                </div>
                <div className="space-y-3">
                  {uniqueStatusValues.map((value, i) => (
                    <div
                      key={value as string}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={`${id}-${i}`}
                        checked={selectedStatuses.includes(value as string)}
                        onCheckedChange={(checked: boolean) =>
                          handleStatusChange(checked, value as string)
                        }
                      />
                      <Label
                        htmlFor={`${id}-${i}`}
                        className="flex grow justify-between gap-2 font-normal"
                      >
                        {value as string}{" "}
                        <span className="ms-2 text-xs text-muted-foreground">
                          {statusCounts.get(value)}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {/* AI Analysis button */}
          <Button variant="outline">
            <Bot
              className="size-5 -ms-1.5 text-muted-foreground/60"
              size={20}
              aria-hidden="true"
            />
            KI-Analyse
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table className="table-fixed border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="relative h-9 select-none bg-sidebar border-y border-border first:border-l first:rounded-l-lg last:border-r last:rounded-r-lg"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            "flex h-full cursor-pointer select-none items-center gap-2"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          // Enhanced keyboard handling for sorting
                          if (
                            header.column.getCanSort() &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <ArrowUp
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
                            />
                          ),
                          desc: (
                            <ArrowDown
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <tbody aria-hidden="true" className="table-row h-1" />
        <TableBody>
          {isLoading ? (
            <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Wird geladen...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-0 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg h-px hover:bg-accent/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="last:py-0 h-[inherit]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Keine Ergebnisse gefunden.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <tbody aria-hidden="true" className="table-row h-1" />
      </Table>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p
            className="flex-1 whitespace-nowrap text-sm text-muted-foreground"
            aria-live="polite"
          >
            Seite{" "}
            <span className="text-foreground">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            von <span className="text-foreground">{table.getPageCount()}</span>
          </p>
          <Pagination className="w-auto">
            <PaginationContent className="gap-3">
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Zur vorherigen Seite"
                >
                  Zurück
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Zur nächsten Seite"
                >
                  Weiter
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function RowActions({
  setData,
  data,
  item,
}: {
  setData: React.Dispatch<React.SetStateAction<DataRequest[]>>;
  data: DataRequest[];
  item: DataRequest;
}) {
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStatusUpdate = (newStatus: DataRequest["status"]) => {
    startUpdateTransition(() => {
      const updatedData = data.map((dataItem) => {
        if (dataItem.id === item.id) {
          return {
            ...dataItem,
            status: newStatus,
          };
        }
        return dataItem;
      });
      setData(updatedData);
    });
  };

  const handlePriorityUpdate = (newPriority: DataRequest["priority"]) => {
    startUpdateTransition(() => {
      const updatedData = data.map((dataItem) => {
        if (dataItem.id === item.id) {
          return {
            ...dataItem,
            priority: newPriority,
          };
        }
        return dataItem;
      });
      setData(updatedData);
    });
  };

  const handleDelete = () => {
    startUpdateTransition(() => {
      const updatedData = data.filter((dataItem) => dataItem.id !== item.id);
      setData(updatedData);
      setShowDeleteDialog(false);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button
              size="icon"
              variant="ghost"
              className="shadow-none text-muted-foreground/60"
              aria-label="Antrag bearbeiten"
            >
              <MoreHorizontal className="size-5" size={20} aria-hidden="true" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => handleStatusUpdate("In Review")}
              disabled={isUpdatePending}
            >
              <AlertCircle size={16} className="opacity-60" />
              In Bearbeitung setzen
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusUpdate("Approved")}
              disabled={isUpdatePending}
            >
              <CheckCircle2 size={16} className="opacity-60" />
              Genehmigen
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusUpdate("Rejected")}
              disabled={isUpdatePending}
            >
              <XCircleIcon size={16} className="opacity-60" />
              Ablehnen
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => handlePriorityUpdate("Urgent")}
              disabled={isUpdatePending}
            >
              <AlertTriangle size={16} className="opacity-60" />
              Als dringend markieren
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handlePriorityUpdate("Low")}
              disabled={isUpdatePending}
            >
              <Clock size={16} className="opacity-60" />
              Als niedrig markieren
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 size={16} className="opacity-60" />
            Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Dies wird den
              Antrag permanent löschen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatePending}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isUpdatePending}
              className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
