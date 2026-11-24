export default function BarChart({ data = [], height = 180, caption = 'Monthly activity' }) {
  const max = Math.max(...data.map((item) => item.count), 1)

  if (!data.length) {
    return <p className="py-10 text-center text-sm text-ink-muted">No activity to chart yet.</p>
  }

  return (
    <div>
      <div
        className="flex items-end gap-2 pt-6 sm:gap-4"
        style={{ height }}
        role="img"
        aria-label={`${caption}: ${data.map((item) => `${item.label} ${item.count}`).join(', ')}`}
      >
        {data.map((item) => {
          const percent = item.count === 0 ? 2 : Math.max((item.count / max) * 100, 6)
          return (
            <div key={item.key || item.label} className="group flex h-full flex-1 flex-col justify-end">
              <div className="relative flex w-full flex-1 items-end justify-center">
                <span className="absolute inset-x-0 -top-5 text-center text-[11px] font-semibold tabular-nums text-ink-muted">
                  {item.count}
                </span>
                <div
                  className="w-full max-w-[46px] rounded-t-md bg-forest-600 transition-colors duration-200 group-hover:bg-forest-800"
                  style={{ height: `${percent}%` }}
                  title={`${item.label}: ${item.count}`}
                />
              </div>
              <span className="mt-2 block text-center text-xs font-medium text-ink-faint">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>

      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.key || item.label}>
              <th scope="row">{item.label}</th>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
