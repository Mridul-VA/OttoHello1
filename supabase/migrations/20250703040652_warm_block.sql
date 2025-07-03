/*
  # Create late check-ins table for employee late arrivals

  1. New Tables
    - `late_checkins`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `reason_for_late` (text, required)
      - `timestamp` (timestamptz, required)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `late_checkins` table
    - Add policy for public access

  3. Indexes
    - Index on timestamp for performance
    - Index on full_name for search functionality
*/

-- Create late_checkins table
CREATE TABLE IF NOT EXISTS late_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  reason_for_late text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE late_checkins ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to late_checkins"
  ON late_checkins
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_late_checkins_timestamp ON late_checkins(timestamp);
CREATE INDEX IF NOT EXISTS idx_late_checkins_full_name ON late_checkins(full_name);