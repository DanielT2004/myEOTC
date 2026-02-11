-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Roles Enum
CREATE TYPE user_role AS ENUM ('user', 'church_admin', 'super_admin');

-- Church Status Enum
CREATE TYPE church_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Churches table
CREATE TABLE public.churches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  phone TEXT,
  description TEXT,
  image_url TEXT,
  interior_image_url TEXT,
  members INTEGER DEFAULT 0,
  services TEXT[] DEFAULT '{}',
  service_schedule JSONB DEFAULT '[]',
  languages TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '{}',
  donation_info JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  status church_status DEFAULT 'pending' NOT NULL,
  coordinates JSONB NOT NULL, -- {lat: number, lng: number}
  verification_document_url TEXT, -- URL to uploaded verification document
  admin_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Church Admins table (links users to churches)
CREATE TABLE public.church_admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, church_id)
);

-- Clergy Members table
CREATE TABLE public.clergy_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Followed Churches (for users to save favorite churches)
CREATE TABLE public.followed_churches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, church_id)
);

-- Indexes for performance
CREATE INDEX idx_churches_status ON public.churches(status);
CREATE INDEX idx_churches_admin_id ON public.churches(admin_id);
CREATE INDEX idx_churches_city ON public.churches(city);
CREATE INDEX idx_church_admins_user_id ON public.church_admins(user_id);
CREATE INDEX idx_church_admins_church_id ON public.church_admins(church_id);
CREATE INDEX idx_events_church_id ON public.events(church_id);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_followed_churches_user_id ON public.followed_churches(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clergy_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followed_churches ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Churches policies
CREATE POLICY "Anyone can view approved churches"
  ON public.churches FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Church admins can view their own churches (even if pending)"
  ON public.churches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.church_admins
      WHERE church_admins.church_id = churches.id
      AND church_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can view all churches"
  ON public.churches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Authenticated users can create churches (pending status)"
  ON public.churches FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND status = 'pending');

CREATE POLICY "Church admins can update their own churches"
  ON public.churches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.church_admins
      WHERE church_admins.church_id = churches.id
      AND church_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can update any church"
  ON public.churches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Church Admins policies
CREATE POLICY "Users can view their own church admin records"
  ON public.church_admins FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all church admin records"
  ON public.church_admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Authenticated users can create church admin records for themselves"
  ON public.church_admins FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.churches
      WHERE churches.id = church_id
      AND churches.admin_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can create church admin records"
  ON public.church_admins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Clergy Members policies
CREATE POLICY "Anyone can view clergy of approved churches"
  ON public.clergy_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.churches
      WHERE churches.id = clergy_members.church_id
      AND churches.status = 'approved'
    )
  );

CREATE POLICY "Church admins can manage clergy of their churches"
  ON public.clergy_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.church_admins
      WHERE church_admins.church_id = clergy_members.church_id
      AND church_admins.user_id = auth.uid()
    )
  );

-- Events policies
CREATE POLICY "Anyone can view events of approved churches"
  ON public.events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.churches
      WHERE churches.id = events.church_id
      AND churches.status = 'approved'
    )
  );

CREATE POLICY "Church admins can manage events of their churches"
  ON public.events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.church_admins
      WHERE church_admins.church_id = events.church_id
      AND church_admins.user_id = auth.uid()
    )
  );

-- Followed Churches policies
CREATE POLICY "Users can view their own followed churches"
  ON public.followed_churches FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own followed churches"
  ON public.followed_churches FOR ALL
  USING (user_id = auth.uid());

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_churches_updated_at BEFORE UPDATE ON public.churches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

