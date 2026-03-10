"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { updateCell, addRow, deleteRow } from "@/actions/row";
import { addColumn, deleteColumn, updateColumn } from "@/actions/column";
import { TableCell } from "./table-cell";
import { ColumnHeaderPopover } from "./column-header-popover";
import { ColumnFilterPopover } from "./column-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell as TdCell,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { COLUMN_TYPES } from "@/lib/constants";
import { compareCellValues } from "@/lib/sort-utils";
import { applyFilters, getFilterSummary } from "@/lib/filter-utils";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Column, Row, CellValue, ColumnType, ColumnConfig, Attachment } from "@/types";
import type { ColumnFilter } from "@/lib/filter-utils";

type Props = {
  trackerId: string;
  columns: Column[];
  rows: Row[];
  attachments: Attachment[];
};

export function DataTable({ trackerId, columns, rows, attachments }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [deleteRowTarget, setDeleteRowTarget] = useState<string | null>(null);

  const attachmentMap = useMemo(() => {
    const map = new Map<string, Attachment[]>();
    for (const a of attachments) {
      const key = `${a.rowId}:${a.columnId}`;
      map.set(key, [...(map.get(key) || []), a]);
    }
    return map;
  }, [attachments]);

  const handleCellChange = useCallback(
    (rowId: string, columnId: string, value: CellValue) => {
      startTransition(async () => {
        await updateCell(rowId, columnId, value);
      });
    },
    []
  );

  const handleAddRow = useCallback(() => {
    startTransition(async () => {
      await addRow(trackerId);
      router.refresh();
    });
  }, [trackerId, router]);

  const handleDeleteRow = useCallback(
    (rowId: string) => {
      startTransition(async () => {
        await deleteRow(rowId);
        router.refresh();
        toast.success("Row deleted");
      });
      setDeleteRowTarget(null);
    },
    [router]
  );

  const handleAddColumn = useCallback(
    (name: string, type: ColumnType) => {
      startTransition(async () => {
        await addColumn(trackerId, { name, type });
        router.refresh();
        toast.success("Column added");
      });
    },
    [trackerId, router]
  );

  const handleDeleteColumn = useCallback(
    (columnId: string) => {
      startTransition(async () => {
        await deleteColumn(columnId);
        router.refresh();
        toast.success("Column deleted");
      });
    },
    [router]
  );

  const handleUpdateColumn = useCallback(
    (columnId: string, data: { name?: string; type?: ColumnType; config?: ColumnConfig }) => {
      startTransition(async () => {
        await updateColumn(columnId, data);
        router.refresh();
      });
    },
    [router]
  );

  const toggleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = useCallback(
    (columnId: string, filter: ColumnFilter | null) => {
      setFilters((prev) => {
        const without = prev.filter((f) => f.columnId !== columnId);
        return filter ? [...without, filter] : without;
      });
    },
    []
  );

  const isNumericType = (type: string) =>
    type === "number" || type === "currency";

  // 1. Global text search
  let filteredRows = rows;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredRows = rows.filter((row) =>
      Object.values(row.data).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }

  // 2. Per-column filters
  filteredRows = applyFilters(filteredRows, filters);

  // 3. Type-aware sorting
  if (sortColumn) {
    const col = columns.find((c) => c.id === sortColumn);
    filteredRows = [...filteredRows].sort((a, b) => {
      const cmp = compareCellValues(
        a.data[sortColumn],
        b.data[sortColumn],
        col?.type ?? "text"
      );
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {filters.map((filter) => {
            const col = columns.find((c) => c.id === filter.columnId);
            return (
              <Badge
                key={filter.columnId}
                variant="secondary"
                className="gap-1 text-xs font-normal"
              >
                {col?.name}: {getFilterSummary(filter)}
                <button
                  onClick={() => handleFilterChange(filter.columnId, null)}
                  className="ml-0.5 rounded-full hover:bg-foreground/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setFilters([])}
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="bg-card shadow-sm rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10 text-center text-xs uppercase tracking-wider font-semibold select-none border-r font-mono">
                #
              </TableHead>
              {columns.map((col) => {
                const isSorted = sortColumn === col.id;
                const filterForCol = filters.find((f) => f.columnId === col.id);

                return (
                  <TableHead
                    key={col.id}
                    className={`min-w-[150px] text-xs uppercase tracking-wider font-semibold select-none border-r border-border/40 last:border-r-0 ${
                      isNumericType(col.type) ? "text-right" : ""
                    } ${isSorted ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <button
                        onClick={() => toggleSort(col.id)}
                        className="flex items-center gap-1 hover:text-foreground min-w-0"
                      >
                        <span className="truncate">{col.name}</span>
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 shrink-0 text-primary" />
                          ) : (
                            <ArrowDown className="h-3 w-3 shrink-0 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                        )}
                      </button>
                      <div className="flex items-center shrink-0">
                        <ColumnFilterPopover
                          column={col}
                          filter={filterForCol}
                          onFilterChange={(f) => handleFilterChange(col.id, f)}
                        />
                        <ColumnHeaderPopover
                          column={col}
                          onUpdate={(data) => handleUpdateColumn(col.id, data)}
                          onDelete={() => handleDeleteColumn(col.id)}
                        >
                          <button className="inline-flex items-center justify-center h-5 w-5 rounded-sm hover:bg-accent text-muted-foreground/60">
                            <Settings2 className="h-3 w-3" />
                          </button>
                        </ColumnHeaderPopover>
                      </div>
                    </div>
                  </TableHead>
                );
              })}
              <TableHead className="w-10">
                <AddColumnButton onAdd={handleAddColumn} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row, idx) => (
              <TableRow
                key={row.id}
                className="group transition-colors duration-100 hover:bg-accent/50 even:bg-muted/20"
              >
                <TdCell className="text-center text-xs text-muted-foreground border-r font-mono">
                  {idx + 1}
                </TdCell>
                {columns.map((col) => (
                  <TdCell
                    key={col.id}
                    className="p-0 border-r border-border/40 last:border-r-0 focus-within:ring-1 focus-within:ring-primary/40 focus-within:ring-inset"
                  >
                    <TableCell
                      column={col}
                      value={row.data[col.id] ?? null}
                      onChange={(value) =>
                        handleCellChange(row.id, col.id, value)
                      }
                      rowId={row.id}
                      trackerId={trackerId}
                      attachments={attachmentMap.get(`${row.id}:${col.id}`) || []}
                    />
                  </TdCell>
                ))}
                <TdCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    onClick={() => setDeleteRowTarget(row.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </TdCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button variant="ghost" size="sm" onClick={handleAddRow} className="gap-1">
        <Plus className="h-4 w-4" />
        Add Row
      </Button>

      <ConfirmDialog
        open={!!deleteRowTarget}
        onOpenChange={() => setDeleteRowTarget(null)}
        title="Delete row"
        description="This action cannot be undone. This will permanently delete this row and all its data."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteRowTarget && handleDeleteRow(deleteRowTarget)}
        loading={isPending}
      />
    </div>
  );
}

function AddColumnButton({
  onAdd,
}: {
  onAdd: (name: string, type: ColumnType) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {COLUMN_TYPES.map((ct) => (
          <DropdownMenuItem
            key={ct.value}
            onClick={() => onAdd(`New ${ct.label}`, ct.value)}
          >
            {ct.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
