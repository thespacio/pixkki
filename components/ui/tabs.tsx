"use client";

import * as React from "react";

import { cn } from "./utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} debe usarse dentro de <Tabs>`);
  }
  return context;
}

type TabsProps = {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? "",
  );
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const baseId = React.useId();

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const listRef = React.useRef<HTMLDivElement>(null);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const triggers = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      ) ?? [],
    );
    if (triggers.length === 0) return;

    const currentIndex = triggers.findIndex(
      (trigger) => trigger === document.activeElement,
    );
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % triggers.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = triggers.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    triggers[nextIndex]?.focus();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-xl border border-border bg-secondary/50 p-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type TabsTriggerProps = React.ComponentProps<"button"> & {
  value: string;
};

function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: activeValue, setValue, baseId } = useTabsContext("TabsTrigger");
  const active = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      data-state={active ? "active" : "inactive"}
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        active && "bg-card text-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type TabsContentProps = React.ComponentProps<"div"> & {
  value: string;
};

function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { value: activeValue, baseId } = useTabsContext("TabsContent");
  if (activeValue !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={cn("focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
