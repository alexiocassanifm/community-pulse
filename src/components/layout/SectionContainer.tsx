import { cn } from "@/lib/utils"

type Variant = "default" | "muted" | "accent"

interface SectionContainerProps {
  id?: string
  variant?: Variant
  title?: string
  subtitle?: string
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<Variant, string> = {
  default: "bg-background text-foreground",
  muted: "bg-muted text-foreground",
  accent: "bg-primary text-primary-foreground",
}

export function SectionContainer({
  id,
  variant = "default",
  title,
  subtitle,
  className,
  children,
}: SectionContainerProps) {
  return (
    <section id={id} className={cn(variantStyles[variant], "py-16 md:py-24", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={cn(
                  "mt-4 text-lg",
                  variant === "accent" ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
