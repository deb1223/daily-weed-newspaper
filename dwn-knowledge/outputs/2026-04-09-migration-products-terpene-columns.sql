-- =============================================================================
-- Migration: Add terpene / COA columns to public.products
-- Approved by Dan: 2026-04-09
-- Idempotent: safe to run multiple times (ADD COLUMN IF NOT EXISTS throughout)
-- Target: Supabase / PostgreSQL 15+
-- =============================================================================
--
-- PURPOSE
-- Adds one DOUBLE PRECISION column per primary terpene (maps 1:1 to Talk to
-- Ziggy's 10 effect-profile terpenes), plus a JSONB overflow column for full
-- COA profiles, and two metadata columns for source tracking.
--
-- NULL SEMANTICS — important for downstream queries:
--   NULL  = COA not available / terpene not tested for this product
--   0.0   = COA tested this terpene; result was below detection limit
--   Never write NULL when you mean "not detected" — they are different states.
--
-- terpene_pinene represents alpha-pinene (α-pinene), the primary cognition /
-- counterbalance terpene. If beta-pinene is separately available on a COA,
-- store it in terpenes_raw.
-- =============================================================================

BEGIN;

ALTER TABLE public.products

  -- -------------------------------------------------------------------------
  -- Primary terpene columns
  -- Unit: percentage by weight (e.g. 0.75 = 0.75%), matching thc_percentage
  -- -------------------------------------------------------------------------
  ADD COLUMN IF NOT EXISTS terpene_myrcene        DOUBLE PRECISION
    CONSTRAINT chk_terpene_myrcene_gte_0        CHECK (terpene_myrcene >= 0),

  ADD COLUMN IF NOT EXISTS terpene_limonene       DOUBLE PRECISION
    CONSTRAINT chk_terpene_limonene_gte_0       CHECK (terpene_limonene >= 0),

  ADD COLUMN IF NOT EXISTS terpene_caryophyllene  DOUBLE PRECISION
    CONSTRAINT chk_terpene_caryophyllene_gte_0  CHECK (terpene_caryophyllene >= 0),

  ADD COLUMN IF NOT EXISTS terpene_linalool       DOUBLE PRECISION
    CONSTRAINT chk_terpene_linalool_gte_0       CHECK (terpene_linalool >= 0),

  ADD COLUMN IF NOT EXISTS terpene_pinene         DOUBLE PRECISION  -- alpha-pinene
    CONSTRAINT chk_terpene_pinene_gte_0         CHECK (terpene_pinene >= 0),

  ADD COLUMN IF NOT EXISTS terpene_terpinolene    DOUBLE PRECISION
    CONSTRAINT chk_terpene_terpinolene_gte_0    CHECK (terpene_terpinolene >= 0),

  ADD COLUMN IF NOT EXISTS terpene_ocimene        DOUBLE PRECISION
    CONSTRAINT chk_terpene_ocimene_gte_0        CHECK (terpene_ocimene >= 0),

  ADD COLUMN IF NOT EXISTS terpene_humulene       DOUBLE PRECISION
    CONSTRAINT chk_terpene_humulene_gte_0       CHECK (terpene_humulene >= 0),

  ADD COLUMN IF NOT EXISTS terpene_nerolidol      DOUBLE PRECISION
    CONSTRAINT chk_terpene_nerolidol_gte_0      CHECK (terpene_nerolidol >= 0),

  ADD COLUMN IF NOT EXISTS terpene_bisabolol      DOUBLE PRECISION
    CONSTRAINT chk_terpene_bisabolol_gte_0      CHECK (terpene_bisabolol >= 0),

  -- -------------------------------------------------------------------------
  -- Full COA terpene profile (JSONB overflow)
  -- Stores the complete lab-reported terpene list including secondary terpenes
  -- (farnesene, guaiol, bisabolene, etc.) that don't have dedicated columns.
  -- Also useful for storing exact lab names / raw values before normalisation.
  -- Example: {"beta_pinene": 0.12, "farnesene": 0.08, "lab": "Steep Hill"}
  -- -------------------------------------------------------------------------
  ADD COLUMN IF NOT EXISTS terpenes_raw           JSONB,

  -- -------------------------------------------------------------------------
  -- Source and verification metadata
  -- -------------------------------------------------------------------------
  ADD COLUMN IF NOT EXISTS coa_url                TEXT,           -- direct link to COA PDF/page
  ADD COLUMN IF NOT EXISTS terpenes_verified_at   TIMESTAMPTZ;   -- last confirmed date; NULL = never verified

COMMIT;

-- =============================================================================
-- VERIFICATION QUERY
-- Run this after the migration to confirm all columns are present.
-- Expected: 13 rows returned (one per new column).
-- =============================================================================

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'products'
  AND column_name IN (
    'terpene_myrcene', 'terpene_limonene', 'terpene_caryophyllene',
    'terpene_linalool', 'terpene_pinene', 'terpene_terpinolene',
    'terpene_ocimene', 'terpene_humulene', 'terpene_nerolidol',
    'terpene_bisabolol', 'terpenes_raw', 'coa_url', 'terpenes_verified_at'
  )
ORDER BY column_name;
