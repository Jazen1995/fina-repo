"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Gem, TrendingUp, Landmark, BarChart2, Globe2, Building2,
} from "lucide-react";

const navItems = [
  { href: "/precious-metals", label: "大宗", icon: Gem },
  { href: "/us-stocks",       label: "美股", icon: TrendingUp },
  { href: "/us-bonds",        label: "美债", icon: Landmark },
  { href: "/a-shares",        label: "A股",  icon: BarChart2 },
  { href: "/hk-stocks",       label: "港股", icon: Building2 },
  { href: "/others",          label: "全球", icon: Globe2 },
];

/** Compute market open/closed status from UTC hour (approximate) */
function getMarketStatus() {
  const utcHour = new Date().getUTCHours();
  const utcMin  = new Date().getUTCMinutes();
  const utcFrac = utcHour + utcMin / 60;

  // US: 14:30–21:00 UTC (EST) | 13:30–20:00 UTC (EDT, Mar–Nov)
  const usOpen = utcFrac >= 13.5 && utcFrac < 21;
  // HK: 01:30–08:00 UTC
  const hkOpen = utcFrac >= 1.5 && utcFrac < 8;
  // A股: 01:30–07:00 UTC (09:30–15:00 CST)
  const cnOpen = utcFrac >= 1.5 && utcFrac < 7;

  return { usOpen, hkOpen, cnOpen };
}

function Dot({ open }: { open: boolean }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: open ? "var(--down)" : "var(--text-dim)" }}
    />
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { usOpen, hkOpen, cnOpen } = getMarketStatus();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[68px] flex flex-col items-center py-4 z-50"
      style={{ background: "var(--bg)", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="mb-5 w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm select-none"
        style={{ background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid rgba(200,148,26,0.3)" }}
      >
        汇
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 w-full px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-md py-2.5 transition-colors",
                active ? "" : "hover:bg-white/[0.04]"
              )}
            >
              {/* Active left bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                  style={{ background: "var(--gold)" }}
                />
              )}
              <Icon
                size={17}
                style={{ color: active ? "var(--gold)" : "var(--text-dim)" }}
              />
              <span
                className="mt-1 text-[10px] leading-none"
                style={{ color: active ? "var(--gold)" : "var(--text-dim)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Market status */}
      <div className="mt-auto mb-1 flex flex-col items-center gap-2">
        <div
          className="w-full px-2 py-2.5 rounded-md flex flex-col gap-1.5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {[
            { label: "US", open: usOpen },
            { label: "HK", open: hkOpen },
            { label: "A股", open: cnOpen },
          ].map(({ label, open }) => (
            <div key={label} className="flex items-center justify-between gap-1.5 px-0.5">
              <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>{label}</span>
              <Dot open={open} />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
