"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard",  label: "Dashboard"  },
  { href: "/disease",    label: "Disease"    },
  { href: "/irrigation", label: "Irrigation" },
  { href: "/market",     label: "Market"     },
  { href: "/outbreaks",  label: "Outbreaks"  },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-[#E5E5E5] bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="text-[#0A0A0A] font-semibold text-[17px] tracking-tight">
          Khetwise
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`
                  px-3 py-1.5 rounded-md text-sm transition-colors duration-150
                  ${isActive
                    ? "text-[#0A0A0A] font-medium bg-[#F5F5F5]"
                    : "text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F5F5]"
                  }
                `}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Field pill */}
        <Link
          href="/field"
          className="text-xs px-3 py-1.5 rounded-md border border-[#E5E5E5] text-[#737373] hover:text-[#0A0A0A] hover:border-[#D4D4D4] transition-colors duration-150"
        >
          My Field
        </Link>
      </div>
    </nav>
  );
}
