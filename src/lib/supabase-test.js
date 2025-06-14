// Supabase connection test utility
import { supabase } from './supabase';

export class SupabaseTest {
  // Test basic connection
  static async testConnection() {
    try {

      
      // Test 1: Check if client is initialized
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      // Test 2: Try to get session (this doesn't require database access)
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      
      // Test 3: Try a simple database query
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database query error:', error);
        throw error;
      }
      

      return { success: true, message: 'All tests passed' };
      
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return { 
        success: false, 
        error: error.message,
        details: error
      };
    }
  }
  
  // Test specific table access
  static async testTableAccess(tableName) {
    try {

      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`Error accessing ${tableName}:`, error);
        return { success: false, error: error.message };
      }
      

      return { success: true, data };
      
    } catch (error) {
      console.error(`Failed to access ${tableName}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Test all required tables
  static async testAllTables() {
    const tables = ['profiles', 'projects', 'meetings', 'project_members', 'attendance'];
    const results = {};
    
    for (const table of tables) {
      results[table] = await this.testTableAccess(table);
    }
    
    return results;
  }
  
  // Get environment info
  static getEnvironmentInfo() {
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
      isClient: typeof window !== 'undefined'
    };
  }
}

// Export for use in components
export const testSupabaseConnection = SupabaseTest.testConnection;
export const testSupabaseTables = SupabaseTest.testAllTables;
