"use client";
import { useState, useEffect } from 'react';
import { useRecipeStore } from '@/store/recipes';
import { PlannerDays, PlannerSlots, type PlannerDay, type PlannerSlot, type IsoWeekString } from '@/types/recipe';
import { QuickAddDialog } from '@/components/QuickAddDialog';
import Link from 'next/link';

export function MealPlanner() {
  const store = useRecipeStore();
  const [weekId, setWeekId] = useState<IsoWeekString>(() => store.getCurrentIsoWeek());
  const [dialog, setDialog] = useState<{ open: boolean; day: PlannerDay; slot: PlannerSlot } | null>(
    null
  );

  // ensure load
  useEffect(() => {
    if (!store.plannerByWeek[weekId]) {
      store.ensureWeek(weekId);
    }
  }, [weekId, store]);

  const week = store.plannerByWeek[weekId];

  const getTitle = (id: string) => store.recipes.find((r) => r.id === id)?.title ?? 'Unknown';

  // Function to get date range for a week
  const getWeekDateRange = (isoWeek: IsoWeekString): string => {
    const [yearStr, weekStr] = isoWeek.split("-W");
    const year = Number(yearStr);
    const week = Number(weekStr);
    
    // Get the first date of the ISO week (Monday)
    const firstDate = getFirstDateOfIsoWeek(year, week);
    const lastDate = new Date(firstDate);
    lastDate.setUTCDate(lastDate.getUTCDate() + 6); // Add 6 days to get Sunday
    
    // Format as "Sep 15–21, 2025"
    const month = firstDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = firstDate.getUTCDate();
    const endDay = lastDate.getUTCDate();
    
    // If same month, show "Sep 15–21, 2025"
    if (firstDate.getUTCMonth() === lastDate.getUTCMonth()) {
      return `${month} ${startDay}–${endDay}, ${year}`;
    } 
    // If different months, show "Sep 29–Oct 5, 2025"
    else {
      const endMonth = lastDate.toLocaleDateString('en-US', { month: 'short' });
      return `${month} ${startDay}–${endMonth} ${endDay}, ${year}`;
    }
  };

  // Helper function to get first date of ISO week
  const getFirstDateOfIsoWeek = (year: number, week: number): Date => {
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dow = simple.getUTCDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
    else ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
    return ISOweekStart;
  };

  // Function to get date for a specific weekday
  const getWeekdayDate = (dayName: string): string => {
    const [yearStr, weekStr] = weekId.split("-W");
    const year = Number(yearStr);
    const week = Number(weekStr);
    
    // Get Monday as the start of the week
    const monday = getFirstDateOfIsoWeek(year, week);
    
    // Map day names to day offsets
    const dayOffsets: Record<string, number> = {
      'Mon': 0,
      'Tue': 1,
      'Wed': 2,
      'Thu': 3,
      'Fri': 4,
      'Sat': 5,
      'Sun': 6,
    };
    
    const dayDate = new Date(monday);
    dayDate.setUTCDate(monday.getUTCDate() + dayOffsets[dayName]);
    
    // Format as "Sep 15"
    return dayDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Week {weekId}</h2>
          <p className="text-sm text-gray-600">{getWeekDateRange(weekId)}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={() => {
              const prev = store.prevWeek(weekId);
              setWeekId(prev);
            }}
          >
            Previous
          </button>
          <button
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={() => setWeekId(store.getCurrentIsoWeek())}
          >
            This Week
          </button>
          <button
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={() => {
              const next = store.nextWeek(weekId);
              setWeekId(next);
            }}
          >
            Next
          </button>
          <button
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={() => store.clearWeek(weekId)}
          >
            Clear week
          </button>
        </div>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="border-separate border-spacing-4" style={{ tableLayout: 'fixed', width: 'auto', minWidth: '1200px' }}>
          <thead>
            <tr>
              <th className="text-left text-sm text-gray-600 px-2" style={{ width: '120px' }}>Meal</th>
              {PlannerDays.map((day) => (
                <th key={day} className="text-center text-sm text-gray-600 px-3" style={{ width: '160px' }}>
                  <div className="font-medium">{day}</div>
                  <div className="text-xs text-gray-500">{getWeekdayDate(day)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PlannerSlots.map((slot) => (
              <tr key={slot}>
                <td className="align-top text-sm font-medium px-2 py-3" style={{ width: '120px' }}>{slot}</td>
                {PlannerDays.map((day) => (
                  <td key={day} className="align-top px-3" style={{ width: '160px' }}>
                    <div className="min-h-[76px] rounded-xl border p-3">
                      <div className="mb-2 flex justify-end">
                        <button
                          aria-label={`Add ${slot.toLowerCase()} on ${day}`}
                          className="h-6 w-6 rounded-full border text-center text-sm leading-5 hover:bg-gray-50"
                          onClick={() => setDialog({ open: true, day, slot })}
                        >
                          +
                        </button>
                      </div>
                      {week?.data[day][slot].length > 0 ? (
                        <div className="space-y-2">
                          {week.data[day][slot].map((id) => (
                            <div key={id} className="flex items-start justify-between gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
                              <Link 
                                href={`/recipes/${id}`} 
                                className="flex-1 hover:text-indigo-800 transition-colors break-words"
                                title={getTitle(id)}
                              >
                                {getTitle(id)}
                              </Link>
                              <button
                                aria-label={`Remove ${getTitle(id)} from ${day} ${slot.toLowerCase()}`}
                                className="flex-shrink-0 rounded-full px-1 hover:bg-indigo-100 mt-0.5"
                                onClick={() => store.removeFromSlot(weekId, day, slot, id)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 text-center py-4">No meals planned</div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dialog && (
        <QuickAddDialog
          open={dialog.open}
          onOpenChange={(v) => setDialog(v ? dialog : null)}
          weekId={weekId}
          day={dialog.day}
          slot={dialog.slot}
        />
      )}
    </div>
  );
}






