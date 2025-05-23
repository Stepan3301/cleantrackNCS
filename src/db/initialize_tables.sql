-- Function to ensure the extension for UUID generation exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or replace the function for setting timestamps
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create the profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
  ) THEN
    -- Create the profiles table
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('owner', 'head_manager', 'manager', 'supervisor', 'staff')),
      supervisor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );

    -- Enable RLS on the table
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Create a policy for users to see their own profile
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);

    -- Create a policy for supervisors
    CREATE POLICY "Supervisors can view their staff profiles" 
      ON public.profiles 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND (
            p.id = profiles.supervisor_id
            OR p.role IN ('manager', 'head_manager', 'owner')
          )
        )
      );

    -- Create triggers for updated_at
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();

    RAISE NOTICE 'Created profiles table';
  ELSE
    RAISE NOTICE 'profiles table already exists';
  END IF;
END;
$$;

-- Function to create the working_hours table if it doesn't exist
CREATE OR REPLACE FUNCTION create_working_hours_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'working_hours'
  ) THEN
    -- Create the working_hours table
    CREATE TABLE public.working_hours (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      date TEXT NOT NULL, -- Using TEXT for format flexibility
      hours_worked NUMERIC(5, 2) NOT NULL,
      description TEXT,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'approved',
      approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      UNIQUE(user_id, date)
    );

    -- Enable RLS on the table
    ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

    -- Create a policy for select
    CREATE POLICY "Users can view their own hours" 
      ON public.working_hours 
      FOR SELECT 
      USING (auth.uid() = user_id);

    -- Create a policy for insert
    CREATE POLICY "Users can insert their own hours" 
      ON public.working_hours 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);

    -- Create a policy for update
    CREATE POLICY "Users can update their own hours" 
      ON public.working_hours 
      FOR UPDATE 
      USING (auth.uid() = user_id);

    -- Create a policy that allows supervisors to view their staff's hours
    CREATE POLICY "Supervisors can view their staff's hours" 
      ON public.working_hours 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = working_hours.user_id
          AND profiles.supervisor_id = auth.uid()
        )
      );

    -- Create a policy that allows managers to view all hours
    CREATE POLICY "Managers can view all hours" 
      ON public.working_hours 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role = 'manager' OR profiles.role = 'head_manager' OR profiles.role = 'owner')
        )
      );

    -- Create triggers for updated_at
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.working_hours
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();

    RAISE NOTICE 'Created working_hours table';
  ELSE
    RAISE NOTICE 'working_hours table already exists';
  END IF;
END;
$$;

-- Create a function to initialize a new user in the profiles table
-- This will be triggered by a sign-up event
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for new user sign-ups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to initialize all tables
CREATE OR REPLACE FUNCTION initialize_all_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM create_profiles_table();
  PERFORM create_working_hours_table();
  RAISE NOTICE 'All tables initialized';
END;
$$;

-- Execute the initialization
SELECT initialize_all_tables(); 