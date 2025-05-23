-- SQL to add phone_number and address columns to the profiles table

-- Add phone_number column
ALTER TABLE profiles 
ADD COLUMN phone_number VARCHAR(20);

-- Add address column
ALTER TABLE profiles 
ADD COLUMN address TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.phone_number IS 'User phone number, including country code';
COMMENT ON COLUMN profiles.address IS 'User physical address';

-- Create an index on phone_number for faster lookups
CREATE INDEX idx_profiles_phone_number ON profiles(phone_number); 