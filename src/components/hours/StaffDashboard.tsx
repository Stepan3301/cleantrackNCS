
export const StaffDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-lg font-medium mb-3">Monthly Summary</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
            <div className="text-3xl font-bold">65</div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: "65%" }}></div>
          </div>
          <div className="text-xs text-muted-foreground">
            65% of monthly target (100 hours)
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="text-lg font-medium mb-3">Bonus Progress</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="text-sm text-muted-foreground">Current Progress</div>
            <div className="text-sm font-medium">AED 0</div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-muted" style={{ width: "0%" }}></div>
          </div>
          <div className="text-xs text-muted-foreground">
            Bonus starts accruing after target hours (100) are reached
          </div>
          <div className="text-xs text-muted-foreground">
            Earn AED 5 for each hour worked beyond target
          </div>
        </div>
      </div>
    </div>
  );
};
