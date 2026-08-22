export const PersonalUserSkeleton = () => {
  return (
    <div className="h-full px-8 pt-8 flex flex-col gap-4 md:gap-6 animate-pulse">
      <div className="sm:self-end text-center font-semibold bg-primary/10 p-2 rounded-md text-primary h-6 w-40"></div>

      <div className="flex flex-col sm:flex-row items-center md:text-2xl font-semibold justify-between gap-2">
        <div className="flex gap-2 items-center">
          <div className="h-8 w-8 bg-foreground/10 rounded-full"></div>
          <div className="h-6 w-32 bg-foreground/10 rounded"></div>
        </div>
        <div className="h-6 w-40 bg-foreground/10 rounded"></div>
      </div>
      <div className="h-px bg-foreground/10"></div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 p-3">
        <div className="text-lg font-semibold col-span-full h-6 w-48 bg-foreground/10 rounded"></div>
        {Array(7).fill(0).map((_, i) => (
          <div key={i} className="h-6 w-full bg-foreground/10 rounded"></div>

        ))}
        <div className="flex items-center gap-6">
          <div className="h-6 w-20 bg-foreground/10 rounded"></div>
          <div className="h-6 w-20 bg-foreground/10 rounded"></div>
        </div>
        <div className="h-6 w-full bg-foreground/10 rounded"></div>
      </div>

      <div className="h-px bg-foreground/10"></div>

      <div className="grid md:grid-cols-2 gap-6 p-3">
        <div className="text-lg font-semibold md:col-span-3 h-6 w-48 bg-foreground/10 rounded"></div>
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="h-6 w-full bg-foreground/10 rounded"></div>
        ))}
      </div>

      <div className="h-px bg-foreground/10"></div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-3">
        <div className="text-lg font-semibold md:col-span-2 lg:col-span-3 h-6 w-48 bg-foreground/10 rounded"></div>
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-6 w-full bg-foreground/10 rounded"></div>
        ))}
      </div>
    </div>
  )
}