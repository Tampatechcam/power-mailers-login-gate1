// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mmzktbgjsvzgfblthdzv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1temt0Ymdqc3Z6Z2ZibHRoZHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTA1MTgsImV4cCI6MjA0OTI2NjUxOH0.s-wwQS7qcMHEezGEUh8TaswwTGU9nzamK4X2aBVj7ko";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);