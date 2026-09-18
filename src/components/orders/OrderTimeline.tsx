import { ORDER_FLOW, statusLabel, isException, flowIndex } from "@/lib/order-status";

export type HistoryRow = {
  id: string;
  to_status: string;
  note?: string | null;
  created_at: string;
};

/** Visual tracking timeline built from the order's recorded status history. */
export function OrderTimeline({
  status,
  history,
}: {
  status: string;
  history: HistoryRow[];
}) {
  const reached = new Map<string, HistoryRow>();
  for (const row of history) if (!reached.has(row.to_status)) reached.set(row.to_status, row);

  const currentIndex = flowIndex(status);
  const exception = isException(status);

  return (
    <div className="space-y-4">
      {exception && (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          This order is marked {statusLabel(status)}.
        </p>
      )}
      <ol className="space-y-0">
        {ORDER_FLOW.map((step, i) => {
          const hit = reached.get(step);
          const done = currentIndex >= i && !exception;
          return (
            <li key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 h-2.5 w-2.5 rounded-full border ${
                    done ? "border-gold bg-gold" : "border-border bg-transparent"
                  }`}
                />
                {i < ORDER_FLOW.length - 1 && (
                  <span className={`w-px flex-1 ${done ? "bg-gold/50" : "bg-border"}`} />
                )}
              </div>
              <div className="pb-5">
                <p className={`text-sm ${done ? "text-ivory" : "text-muted-foreground"}`}>
                  {statusLabel(step)}
                </p>
                {hit && (
                  <p className="text-[0.7rem] text-muted-foreground">
                    {new Date(hit.created_at).toLocaleString("en-IN")}
                    {hit.note ? ` • ${hit.note}` : ""}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
