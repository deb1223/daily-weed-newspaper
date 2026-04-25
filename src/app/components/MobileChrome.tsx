"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AuthLabel from "./AuthLabel";

interface Props {
  editionNum: string;
  shortDate: string;
}

export default function MobileChrome({ editionNum, shortDate }: Props) {
  const [indexOpen, setIndexOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!indexOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndexOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [indexOpen]);

  const open = () => setIndexOpen(true);
  const close = () => setIndexOpen(false);

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <div className="mbar">
        <button className="mbar-hamb" aria-label="Open index" onClick={open}>
          <span />
          <span />
          <span />
        </button>
        <span className="mbar-pill">VOL. I · № {editionNum}</span>
        <span className="mbar-auth">
          <AuthLabel />
        </span>
      </div>

      {/* ── Sheet backdrop ─────────────────────────────────────── */}
      <div
        className={`sheet-backdrop${indexOpen ? " open" : ""}`}
        aria-hidden="true"
        onClick={close}
      />

      {/* ── Index sheet drawer ─────────────────────────────────── */}
      <aside
        className={`index-sheet${indexOpen ? " open" : ""}`}
        aria-label="Today's Index"
        aria-modal={indexOpen ? true : undefined}
      >
        <button
          ref={closeRef}
          className="sheet-x"
          aria-label="Close"
          onClick={close}
        >
          ✕
        </button>

        <div className="sheet-head">Today&apos;s Index</div>
        <dl className="sheet-dl">
          <dt><Link href="/">Front Page</Link></dt><dd>01</dd>
          <dt><Link href="/#sheet">The Sheet</Link></dt><dd>02</dd>
          <dt><Link href="#">The Closer</Link></dt><dd>03</dd>
          <dt><Link href="#">Market Data</Link></dt><dd>04</dd>
          <dt><Link href="#">Ziggy&apos;s Column</Link></dt><dd>05</dd>
          <dt><Link href="#">Big Mike&apos;s Tea</Link></dt><dd>02</dd>
          <dt><Link href="#">Tourist Terry</Link></dt><dd>03</dd>
        </dl>

        <div className="sheet-subhead">Today&apos;s Almanac</div>
        <dl className="sheet-dl sheet-almanac">
          <dt>Sunrise</dt><dd>05:58</dd>
          <dt>Sunset</dt><dd>19:14</dd>
          <dt>High / Low</dt><dd>78° / 54°</dd>
          <dt>Humidity</dt><dd>18%</dd>
          <dt>Moon</dt><dd>Waxing Gibbous</dd>
        </dl>

        <div className="sheet-subhead">Edition</div>
        <dl className="sheet-dl">
          <dt>Volume</dt><dd>I</dd>
          <dt>Number</dt><dd>{editionNum}</dd>
          <dt>Date</dt><dd>{shortDate}</dd>
          <dt>Latitude</dt><dd>36°10′N</dd>
          <dt>Longitude</dt><dd>115°08′W</dd>
        </dl>

        <div className="sheet-footer">
          &ldquo;All the Deals That&apos;s Fit to Print.&rdquo;<br />
          — Est. April 2026
        </div>
      </aside>

      {/* ── Bottom navigation ──────────────────────────────────── */}
      <nav className="mbottom" aria-label="Sections">
        <Link href="/" className="mbottom-link mbottom-current">
          <span className="mbottom-glyph">¶</span>Front
        </Link>
        <Link href="/#sheet" className="mbottom-link">
          <span className="mbottom-glyph">$</span>The Sheet
        </Link>
        <Link href="/#top10" className="mbottom-link">
          <span className="mbottom-glyph">★</span>Top&nbsp;10
        </Link>
        <Link href="#" className="mbottom-link">
          <span className="mbottom-glyph">☕</span>Tea
        </Link>
        <Link href="#" className="mbottom-link">
          <span className="mbottom-glyph">Z</span>Ziggy
        </Link>
      </nav>
    </>
  );
}
