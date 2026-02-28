-- Create tables for VA Pro App

CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  daily_time_limit_min INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'To Do',
  priority TEXT NOT NULL DEFAULT 'Medium',
  due_date TEXT,
  time_spent NUMERIC DEFAULT 0,
  recurring TEXT DEFAULT 'None',
  estimated_min INTEGER,
  allow_overrun BOOLEAN DEFAULT true,
  file_links TEXT,
  output_links TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  duration NUMERIC NOT NULL,
  date TEXT NOT NULL,
  billable BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only view and edit their own data
CREATE POLICY "Users can manage their own clients" 
  ON clients FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tasks" 
  ON tasks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own time entries" 
  ON time_entries FOR ALL USING (auth.uid() = user_id);
