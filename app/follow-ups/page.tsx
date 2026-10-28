"use client";

import { useMemo, useState } from "react";
import { ChartNoAxesCombined, Filter, Plus } from "lucide-react";
import { toast } from "sonner";
import Actions from "@/components/common/Actions";
import Breadcrumb from "@/components/common/Breadcrumb";
import ListPageLayout from "@/components/layout/ListPageLayout";
import FollowUpFilters from "@/components/follow-ups/FollowUpFilters";
import FollowUpStats from "@/components/follow-ups/FollowUpStats";
import FollowUpTable from "@/components/follow-ups/FollowUpTable";
import FollowUpCalendar from "@/components/follow-ups/FollowUpCalendar";
import AddFollowUpDialog from "@/components/follow-ups/AddFollowUpDialog";
import FollowUpEditDialog from "@/components/follow-ups/FollowUpEditDialog";
import NextFollowUpDialog from "@/components/follow-ups/NextFollowUpDialog";
import CancelFollowUpDialog from "@/components/follow-ups/CancelFollowUpDialog";
import CompleteFollowUpDialog from "@/components/follow-ups/CompleteFollowUpDialog";
import {
  useCancelFollowUp,
  useCompleteFollowUp,
  useFollowUpKpisQuery,
  useFollowUpsQuery,
} from "@/hooks/use-follow-ups";
import {
  canCancelFollowUp,
  canCompleteFollowUp,
  canCreateNextFollowUp,
  canEditFollowUp,
} from "@/lib/follow-ups/actions";
import { useFollowUpListStore } from "@/store/follow-up-list-store";
import type {
  FollowUpFilters as FollowUpFilterState,
  FollowUpItem,
  FollowUpQueryFilters,
} from "@/types/follow-up";
import FollowUpViewToggle from "@/components/follow-ups/FollowUpViewToggle";

function dayBoundary(offset: number, end = false) {
  const date = new Date();
  date.setHours(end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}

function calendarGridBoundary(month: string, end = false) {
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(year, monthIndex - 1, 1, 0, 0, 0, 0);
  first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const date = new Date(first);
  if (end) {
    date.setDate(date.getDate() + 41);
    date.setHours(23, 59, 59, 999);
  }
  return date.toISOString();
}

export default function FollowupsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialScheduledAt, setInitialScheduledAt] = useState<string>();
  const [editFollowUp, setEditFollowUp] = useState<FollowUpItem>();
  const [cancelFollowUp, setCancelFollowUp] = useState<FollowUpItem>();
  const [completeFollowUp, setCompleteFollowUp] = useState<FollowUpItem>();
  const [nextFollowUp, setNextFollowUp] = useState<FollowUpItem>();
  const filters = useFollowUpListStore();

  const queryFilters = useMemo<FollowUpQueryFilters>(() => {
    const commonFilters = {
      businessId: filters.businessId,
      businessName: filters.businessName,
      assignedTo: filters.assignedTo,
      assignedToName: filters.assignedToName,
      status: filters.status,
      type: filters.type,
    };
    if (filters.view === "calendar") {
      return {
        ...commonFilters,
        isCalendarView: true,
        // Include the complete six-week calendar grid. This also keeps the
        // mobile week view complete when a week crosses a month boundary.
        fromDate: calendarGridBoundary(filters.calendarMonth),
        toDate: calendarGridBoundary(filters.calendarMonth, true),
        tab: "all",
      };
    }
    const dates =
      filters.tab === "today"
        ? { fromDate: dayBoundary(0), toDate: dayBoundary(0, true) }
        : filters.tab === "upcoming"
          ? { fromDate: dayBoundary(1), toDate: "" }
          : filters.tab === "overdue"
            ? { fromDate: "", toDate: dayBoundary(-1, true) }
            : { fromDate: filters.fromDate, toDate: filters.toDate };
    return {
      ...commonFilters,
      page: filters.page,
      limit: filters.limit,
      tab: filters.tab,
      ...dates,
    };
  }, [filters]);

  const kpiFilters = useMemo<Partial<FollowUpFilterState>>(() => {
    const p: Partial<FollowUpFilterState> = {};
    if (filters.businessId) p.businessId = filters.businessId;
    if (filters.assignedTo) p.assignedTo = filters.assignedTo;
    if (filters.type) p.type = filters.type;
    if (filters.status) p.status = filters.status;
    if (filters.fromDate) p.fromDate = filters.fromDate;
    if (filters.toDate) p.toDate = filters.toDate;
    return p;
  }, [
    filters.businessId,
    filters.assignedTo,
    filters.type,
    filters.status,
    filters.fromDate,
    filters.toDate,
  ]);

  const listQuery = useFollowUpsQuery(queryFilters);
  const kpisQuery = useFollowUpKpisQuery(kpiFilters);
  const cancelMutation = useCancelFollowUp();
  const completeMutation = useCompleteFollowUp();
  const setFilter = filters.setFilter;

  const kpiData = kpisQuery.data ?? {
    total: 0,
    today: 0,
    upcoming: 0,
    overdue: 0,
  };
  const hasFilter = Boolean(
    filters.businessId ||
      filters.assignedTo ||
      filters.type ||
      filters.status ||
      filters.fromDate ||
      filters.toDate,
  );
  const kpiStats = {
    ...kpiData,
    total:
      hasFilter &&
      filters.tab === "all" &&
      typeof listQuery.data?.total === "number"
        ? listQuery.data.total
        : kpiData.total,
  };

  const confirmComplete = async () => {
    if (!completeFollowUp || !canCompleteFollowUp(completeFollowUp)) {
      setCompleteFollowUp(undefined);
      return;
    }
    try {
      await completeMutation.mutateAsync(completeFollowUp.id);
      filters.highlightFollowUp(completeFollowUp.id);
      toast.success("Follow-up marked as completed");
      setCompleteFollowUp(undefined);
    } catch {
      toast.error("Unable to mark follow-up as completed.");
    }
  };

  const confirmCancel = async () => {
    if (!cancelFollowUp || !canCancelFollowUp(cancelFollowUp)) {
      setCancelFollowUp(undefined);
      return;
    }
    try {
      await cancelMutation.mutateAsync(cancelFollowUp.id);
      filters.highlightFollowUp(cancelFollowUp.id);
      toast.success("Follow-up cancelled");
      setCancelFollowUp(undefined);
    } catch {
      toast.error("Unable to cancel follow-up.");
    }
  };

  const requestEdit = (followUp: FollowUpItem) => {
    if (canEditFollowUp(followUp)) setEditFollowUp(followUp);
  };

  const requestCancel = (followUp: FollowUpItem) => {
    if (canCancelFollowUp(followUp)) setCancelFollowUp(followUp);
  };

  const requestComplete = (followUp: FollowUpItem) => {
    if (canCompleteFollowUp(followUp)) setCompleteFollowUp(followUp);
  };

  const requestNextFollowUp = (followUp: FollowUpItem) => {
    if (canCreateNextFollowUp(followUp)) setNextFollowUp(followUp);
  };

  return (
    <>
      <ListPageLayout
        breadcrumb={<Breadcrumb items={[{ label: "Follow-ups" }]} />}
        showStats={filters.showStats}
        showFilters={filters.showFilters}
        onToggleFilters={filters.toggleFilters}
        onResetFilters={filters.reset}
        resultCount={listQuery.data?.total ?? 0}
        viewSwitcher={<FollowUpViewToggle value={filters.view} onChange={filters.setView} />}
        actions={
          <Actions
            primary={{
              label: "Add Follow-up",
              onSelect: () => {
                setInitialScheduledAt(undefined);
                setDialogOpen(true);
              },
              icon: <Plus className="size-4" />,
            }}
            menuItems={[
              {
                label: `${filters.showStats ? "Hide" : "Show"} KPIs`,
                icon: <ChartNoAxesCombined className="size-4" />,
                onSelect: filters.toggleStats,
                desktopOnly: true,
              },
              {
                label: `${filters.showFilters ? "Hide" : "Show"} Filters`,
                icon: <Filter className="size-4" />,
                onSelect: filters.toggleFilters,
                desktopOnly: true,
              },
            ]}
          />
        }
        stats={
          <FollowUpStats
            data={kpiStats}
            loading={kpisQuery.isLoading}
          />
        }
        filters={
          <FollowUpFilters
            filters={filters}
            setFilter={setFilter}
            reset={filters.reset}
            view={filters.view}
          />
        }
        content={
          <div className="space-y-4">
            {filters.view === "table" && (
              <div className="flex items-center gap-1 overflow-x-auto border-b border-line">
                {/* {(["all", "today", "upcoming", "overdue"] as const).map((tab) => ( */}
                {(["all", "today", "upcoming"] as const).map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => filters.setTab(tab)}
                    className={`shrink-0 border-b-2 px-4 py-3 text-xs font-semibold capitalize transition-colors ${filters.tab === tab ? "border-brand text-brand-strong" : "border-transparent text-muted hover:text-ink-soft"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
            {filters.view === "calendar" ? (
              <FollowUpCalendar
                items={listQuery.data?.items ?? []}
                total={listQuery.data?.total ?? 0}
                loading={listQuery.isFetching}
                month={filters.calendarMonth}
                onMonthChange={filters.setCalendarMonth}
                onAddFollowUp={(scheduledAt) => {
                  setInitialScheduledAt(scheduledAt);
                  setDialogOpen(true);
                }}
                onEdit={requestEdit}
                onCancel={requestCancel}
                onComplete={requestComplete}
                onNextFollowUp={requestNextFollowUp}
              />
            ) : (
              <FollowUpTable
                items={listQuery.data?.items ?? []}
                total={listQuery.data?.total ?? 0}
                page={filters.page}
                limit={filters.limit}
                loading={listQuery.isFetching}
                onPage={(page) => setFilter("page", page)}
                onItemsPerPageChange={(limit) => setFilter("limit", limit)}
                onEdit={requestEdit}
                onCancel={requestCancel}
                onComplete={requestComplete}
                onNextFollowUp={requestNextFollowUp}
              />
            )}
          </div>
        }
      />
      <AddFollowUpDialog
        open={dialogOpen}
        initialScheduledAt={initialScheduledAt}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setInitialScheduledAt(undefined);
        }}
      />
      {editFollowUp && (
        <FollowUpEditDialog
          followUp={editFollowUp}
          open={Boolean(editFollowUp)}
          onOpenChange={(open) => {
            if (!open) setEditFollowUp(undefined);
          }}
        />
      )}
      {cancelFollowUp && (
        <CancelFollowUpDialog
          open={Boolean(cancelFollowUp)}
          businessName={cancelFollowUp.businessName}
          loading={cancelMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setCancelFollowUp(undefined);
          }}
          onConfirm={confirmCancel}
        />
      )}
      {completeFollowUp && (
        <CompleteFollowUpDialog
          open={Boolean(completeFollowUp)}
          businessName={completeFollowUp.businessName}
          loading={completeMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setCompleteFollowUp(undefined);
          }}
          onConfirm={confirmComplete}
        />
      )}
      {nextFollowUp && (
        <NextFollowUpDialog
          followUp={nextFollowUp}
          open={Boolean(nextFollowUp)}
          onOpenChange={(open) => {
            if (!open) setNextFollowUp(undefined);
          }}
        />
      )}
    </>
  );
}
