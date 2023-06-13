import { createClient } from "@supabase/supabase-js";
import { supabaseKey } from "./envar.js";

const supabaseUrl = "https://mjmsdlsrtxxchzznofrs.supabase.co";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
