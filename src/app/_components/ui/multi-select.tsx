import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ButtonHTMLAttributes,
} from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, type BadgeProps } from "./badge";
import { Separator } from "./separator";
import { type SeparatorProps } from "@radix-ui/react-separator";
import { Input } from "./input";

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: Event) => void,
) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref?.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

type Position = "top" | "bottom";

// Hook para detectar posicionamento automático
const useAutoPosition = (
  triggerRef: React.RefObject<HTMLElement>,
  contentRef: React.RefObject<HTMLElement>,
  isOpen: boolean,
): Position => {
  const [position, setPosition] = useState<Position>("bottom");

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentHeight = contentRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Espaço disponível abaixo do trigger
      const spaceBelow = viewportHeight - triggerRect.bottom;
      // Espaço disponível acima do trigger
      const spaceAbove = triggerRect.top;

      // Se não há espaço suficiente abaixo e há mais espaço acima
      if (spaceBelow < contentHeight && spaceAbove > spaceBelow) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    };

    // Atualizar posição quando abrir
    updatePosition();

    // Atualizar posição no scroll/resize
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, triggerRef, contentRef]);

  return position;
};

type MultiSelectContext = {
  handleToggle: () => void;
  disabled: boolean;
  isOpen: boolean;
  value: string[];
  handleClear: () => void;
  handleRemove: (value: string) => void;
  searchValue: string;
  setSearchValue: (search: string) => void;
  handleSelect: (search: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  triggerRef: React.RefObject<HTMLButtonElement>;
};

const MultiSelectContext = createContext<MultiSelectContext | null>(null);

const useMultiSelect = () => {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error(
      "MultiSelect components must be used within MultiSelectRoot",
    );
  }
  return context;
};

type MultiBadgeProps = BadgeProps & { onRemove: () => void };
const MultiBadge = React.forwardRef(
  (
    { children, onRemove, className, variant = "secondary" }: MultiBadgeProps,
    ref,
  ) => {
    return (
      <Badge ref={ref} className={cn(className)} variant={variant}>
        {children}
        {!!onRemove && (
          <X
            className="ml-1 size-4 text-muted-foreground duration-150 hover:-rotate-90"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          />
        )}
      </Badge>
    );
  },
);

MultiBadge.displayName = "MultiBadge";

// Root Component - Provider do contexto
type MultiSelectRootProps = {
  value: string[];
  onValueChange: (value: string[]) => void;
  disabled?: boolean;
  children: React.ReactNode;
};

const MultiSelectRoot = ({
  value,
  onValueChange,
  disabled = false,
  children,
  ...props
}: MultiSelectRootProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useClickOutside(containerRef, () => setIsOpen(false));

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    onValueChange?.(newValue);
  };

  const handleRemove = (optionValue: string) => {
    const newValue = value.filter((v) => v !== optionValue);
    onValueChange?.(newValue);
  };

  const handleClear = () => {
    onValueChange?.([]);
  };

  const contextValue = {
    value,
    onValueChange,
    disabled,
    isOpen,
    setIsOpen,
    searchValue,
    setSearchValue,
    containerRef,
    triggerRef,
    handleToggle,
    handleSelect,
    handleRemove,
    handleClear,
  };

  return (
    <MultiSelectContext.Provider value={contextValue}>
      <div ref={containerRef} className="relative" {...props}>
        {children}
      </div>
    </MultiSelectContext.Provider>
  );
};

type MultiSelectTriggerProps = {
  className?: string;
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;
const MultiSelectTrigger = React.forwardRef(
  ({ className, children, ...props }: MultiSelectTriggerProps, ref) => {
    const { handleToggle, disabled, isOpen, triggerRef } = useMultiSelect();
    const combinedRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(combinedRef.current);
        } else {
          ref.current = combinedRef.current;
        }
      }
      triggerRef.current = combinedRef.current;
    }, [ref, triggerRef]);

    return (
      <button
        ref={combinedRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={cn(
          "flex min-h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);

MultiSelectTrigger.displayName = "MultiSelectTrigger";

type MultiSelectValueProps = {
  placeholder?: string;
  maxDisplay: number;
  className?: string;
  selected?: string[] | { label: string; value: string }[];
  children?: React.ReactNode;
};
const MultiSelectValue = ({
  placeholder = "Selecione...",
  maxDisplay = 3,
  className,
  children,
  selected,
}: MultiSelectValueProps) => {
  const { value: itemValue } = useMultiSelect();

  const valueSelected = selected ?? itemValue;

  if (children) {
    return (
      <div className={cn("min-w-0 flex-1 text-left", className)}>
        {children}
      </div>
    );
  }

  if (valueSelected.length === 0) {
    return (
      <div className={cn("min-w-0 flex-1 text-left", className)}>
        <span className="text-muted-foreground">{placeholder}</span>
      </div>
    );
  }

  return (
    <div className={cn("min-w-0 flex-1 text-left", className)}>
      <div className="flex flex-wrap gap-1">
        {valueSelected.slice(0, maxDisplay).map((val) => {
          const isString = typeof val === "string";
          const value = isString ? val : val.value;
          const label = isString ? val : val.label;
          return (
            <MultiSelectValueItem key={value} label={label} value={value} />
          );
        })}
        {valueSelected.length > maxDisplay && (
          <Badge variant="secondary">
            +{valueSelected.length - maxDisplay} mais
          </Badge>
        )}
      </div>
    </div>
  );
};

type MultiSelectValueItemProps = {
  value: string;
  label?: string;
  onRemove?: (value: string) => void;
};

const MultiSelectValueItem: React.FC<MultiSelectValueItemProps> = ({
  value: itemValue,
  label,
  onRemove,
}) => {
  const { handleRemove } = useMultiSelect();

  const handleItemRemove = (): void => {
    if (onRemove) {
      onRemove(itemValue);
    } else {
      handleRemove(itemValue);
    }
  };

  return (
    <MultiBadge
      onRemove={() => {
        handleItemRemove();
        onRemove && onRemove(itemValue);
      }}
    >
      {label ?? itemValue}
    </MultiBadge>
  );
};

type MultiSelectActionProps = {
  showClear?: boolean;
  children?: React.ReactNode;
};
const MultiSelectActions = ({
  showClear = true,
  children,
}: MultiSelectActionProps) => {
  const { value, handleClear, isOpen } = useMultiSelect();

  if (children) {
    return <div className="flex items-center gap-2">{children}</div>;
  }

  return (
    <div className="flex items-center gap-2">
      {showClear && value.length > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <ChevronDown
        className={cn(
          "h-4 w-4 opacity-50 transition-transform",
          isOpen && "rotate-180",
        )}
      />
    </div>
  );
};

type MultiSelectContentProps = {
  className?: string;
  children: React.ReactNode;
  position?: Position;
};

const MultiSelectContent = React.forwardRef<
  HTMLDivElement,
  MultiSelectContentProps
>(({ className, children, position: forcedPosition, ...props }, ref) => {
  const { isOpen, triggerRef } = useMultiSelect();
  const contentRef = useRef<HTMLDivElement>(null);
  const autoPosition = useAutoPosition(triggerRef, contentRef, isOpen);

  const position = forcedPosition ?? autoPosition;

  if (!isOpen) return null;

  const positionClasses = {
    top: "bottom-full mb-1 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
    bottom: "top-full mt-1 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
  };

  return (
    <div
      ref={ref ?? contentRef}
      className={cn(
        "absolute left-0 right-0 z-50 max-h-60 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        positionClasses[position],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

MultiSelectContent.displayName = "MultiSelectContent";

type MultiSelectProps = {
  placeholder?: string;
  className?: string;
};
const MultiSelectSearch = ({
  placeholder = "Buscar...",
  className,
  ...props
}: MultiSelectProps) => {
  const { searchValue, setSearchValue } = useMultiSelect();
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Input
      ref={inputRef}
      className={cn(
        "flex h-10 w-full rounded-md border-none bg-background text-sm placeholder:text-muted-foreground focus-within:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      placeholder={placeholder}
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      leftIcon={<Search className="h-4 w-4 shrink-0 opacity-50" />}
      {...props}
    />
  );
};

type MultiSelectOptionsProps = {
  className?: string;
  children: React.ReactNode;
};
const MultiSelectOptions = ({
  className,
  children,
  ...props
}: MultiSelectOptionsProps) => {
  const { searchValue } = useMultiSelect();

  // Verificar se há opções visíveis
  const visibleChildren = React.Children.toArray(children).filter((child) => {
    if (React.isValidElement(child) && child.type === MultiSelectOption) {
      const childValue = child.props.value || "";
      const childText = child.props.children?.toString() || "";

      return (
        !searchValue ||
        childText.toLowerCase().includes(searchValue.toLowerCase()) ||
        childValue.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    return true;
  });

  const hasVisibleOptions = visibleChildren.length > 0;

  return (
    <div
      className={cn("max-h-48 space-y-1 overflow-auto p-1", className)}
      {...props}
    >
      {hasVisibleOptions ? children : <MultiSelectEmpty />}
    </div>
  );
};

type MultiSelectOptionProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};
const MultiSelectOption = ({
  value: optionValue,
  children,
  className,
  disabled = false,
  ...props
}: MultiSelectOptionProps) => {
  const { value, handleSelect, searchValue } = useMultiSelect();
  const isSelected = value.includes(optionValue);

  // Filter based on search
  const shouldShow =
    !searchValue ||
    children?.toString().toLowerCase().includes(searchValue.toLowerCase()) ||
    optionValue.toLowerCase().includes(searchValue.toLowerCase());

  console.log(optionValue.toLowerCase().includes(searchValue.toLowerCase()));

  if (!shouldShow) return null;

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onClick={() => !disabled && handleSelect(optionValue)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children ?? optionValue}
    </div>
  );
};

type MultiSelectEmptyProps = {
  children?: React.ReactNode;
  className?: string;
};
const MultiSelectEmpty = ({ children, className }: MultiSelectEmptyProps) => {
  return (
    <div className={cn("py-6 text-center text-sm", className)}>
      {children ?? "Nenhum resultado encontrado."}
    </div>
  );
};

type MultiSelectGroupProps = {
  children: React.ReactNode;
  className?: string;
  label?: string;
};
const MultiSelectGroup = ({
  label,
  children,
  className,
}: MultiSelectGroupProps) => {
  return (
    <div className={className}>
      {label && (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {label}
        </div>
      )}
      {children}
    </div>
  );
};

const MultiSelectSeparator = ({ ...props }: SeparatorProps) => {
  return <Separator {...props} />;
};

export {
  MultiSelectRoot,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectValueItem,
  MultiSelectActions,
  MultiSelectContent,
  MultiSelectSearch,
  MultiSelectOptions,
  MultiSelectOption,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectSeparator,
  MultiBadge,
};
