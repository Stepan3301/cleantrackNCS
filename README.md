# CleanTrack Control Center

An employee management application for CleanTrack that provides features for managing staff, tracking hours, monitoring tasks, and more.

## Features

- Employee management with role-based access control
- Hours tracking and calendar views
- Task management
- Announcements system
- Profile management with image upload capability
- Mobile-responsive design

## Technologies Used

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Supabase for backend and authentication
- Full Calendar for scheduling views

## Setup and Development

```sh
# Clone the repository
git clone https://github.com/Stepan3301/cleantrackNCS.git
cd cleantrackNCS

# Install dependencies
npm install

# Create a .env file with your Supabase credentials
echo "VITE_SUPABASE_URL=your_supabase_url" > .env
echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env

# Start development server
npm run dev
```

## Deployment

This project is set up to deploy to GitHub Pages using GitHub Actions.

### Manual Deployment

You can manually deploy the application using:

```sh
npm run deploy
```

### GitHub Actions Deployment

The project is configured to automatically deploy when changes are pushed to the main branch. To set this up:

1. In your GitHub repository, go to Settings > Secrets and Variables > Actions
2. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
3. Enable GitHub Pages in Settings > Pages
   - Set the source to "GitHub Actions"

## Database Setup

For profile images functionality:

```sql
-- Add avatar_url column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name) 
VALUES ('profile-images', 'Profile Images')
ON CONFLICT DO NOTHING;

-- Set up storage bucket security policies
CREATE POLICY "Allow public read access for profile images"
ON storage.objects FOR SELECT USING (
  bucket_id = 'profile-images'
);

CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Allow users to update their own profile images"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'profile-images'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Allow users to delete their own profile images"
ON storage.objects FOR DELETE USING (
  bucket_id = 'profile-images'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);
```
