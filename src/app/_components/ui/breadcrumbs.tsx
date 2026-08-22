"use client";

import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface BreadcrumbsProps extends React.ComponentPropsWithoutRef<"nav"> {
  segments: {
    title: string;
    href: string;
    isSelect?: boolean;
    customElement?: React.ReactNode;
  }[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumbs({
  segments,
  separator = <span className="text-muted-foreground">/</span>,
  className,
  ...props
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="breadcrumbs"
      className={cn(
        "flex w-full items-center space-x-2 text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      {segments.length > 0 && (
        <Link
          href="/"
          className="flex items-center hover:text-foreground"
          aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>
      )}
      {segments.map((segment, index) => (
        <React.Fragment key={segment.href}>
          <div
            className="flex items-center text-muted-foreground"
            aria-hidden="true"
          >
            {separator}
          </div>
          {segment.isSelect && segment.customElement ? (
            <div className="flex items-center">
              {segment.customElement}
            </div>
          ) : (
            <Link
              href={segment.href}
              className={cn(
                "hover:text-foreground",
                index === segments.length - 1
                  ? "pointer-events-none font-medium text-foreground"
                  : ""
              )}
              aria-current={index === segments.length - 1 ? "page" : undefined}
            >
              {segment.title}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
} 