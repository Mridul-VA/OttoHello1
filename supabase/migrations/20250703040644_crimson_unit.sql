/*
  # Create visitors table for check-in/check-out system

  1. New Tables
    - `visitors`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `reason_for_visit` (text, required)
      - `person_to_meet` (text, required)
      - `photo_base64` (text, optional - base64 encoded image)
      - `phone_number` (text, optional)
      - `checked_in_at` (timestamptz, required)
      - `checked_out_at` (timestamptz, optional)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `visitors` table
    - Add policy for public access (since this is a visitor system)

  3. Indexes
    - Index on checked_in_at for performance
    - Index on full_name for search functionality
*/

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  reason_for_visit text NOT NULL,
  person_to_meet text NOT NULL,
  photo_base64 text,
  phone_number text,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  checked_out_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (visitor management system)
CREATE POLICY "Allow public access to visitors"
  ON visitors
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitors_checked_in_at ON visitors(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_visitors_full_name ON visitors(full_name);
CREATE INDEX IF NOT EXISTS idx_visitors_person_to_meet ON visitors(person_to_meet);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();