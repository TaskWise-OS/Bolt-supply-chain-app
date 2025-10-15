/*
  # Add Automatic Trial Creation

  1. Changes
    - Creates function to automatically initialize 14-day trial for new users
    - Creates trigger that runs after user signup
    - Ensures every new user starts with a trial automatically
  
  2. Security
    - Function runs with SECURITY DEFINER (elevated privileges)
    - Only triggers on new user creation
    - Prevents duplicate trials
*/

-- Create function to initialize trial for new users
CREATE OR REPLACE FUNCTION initialize_user_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert trial subscription for new user
  INSERT INTO user_subscriptions (user_id, status, trial_ends_at, plan_id)
  VALUES (
    NEW.id,
    'trial',
    NOW() + INTERVAL '14 days',
    'free_trial'
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicates if user already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that runs after new user is created
DROP TRIGGER IF EXISTS on_user_created ON auth.users;

CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_trial();
