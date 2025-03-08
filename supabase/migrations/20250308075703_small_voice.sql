/*
  # Fix foreign key constraints

  1. Changes
    - Update investments table foreign key to reference auth.users instead of profiles
    - This ensures investments can be created even if profile is not fully completed

  2. Security
    - Maintain existing RLS policies
*/

-- First drop the existing foreign key
ALTER TABLE investments
DROP CONSTRAINT IF EXISTS investments_user_id_fkey;

-- Add the new foreign key constraint
ALTER TABLE investments
ADD CONSTRAINT investments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;