/**
 * Script to create a test user
 * Run with: npx tsx scripts/create-test-user.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env file manually
const envPath = join(process.cwd(), ".env");
const envContent = readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const serviceRoleKey = envVars["SUPABASE_SERVICE_ROLE_KEY"];

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestUser() {
  const email = "contato@bernardolima.com.br";
  const password = "admin987";
  const fullName = "Bernardo Lima";

  console.log("Creating test user:", email);

  // Step 1: Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === email);

  if (existingUser) {
    console.log("User already exists with ID:", existingUser.id);

    // Check if profile exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", existingUser.id)
      .single();

    if (profile) {
      console.log("Profile exists:", profile);
      return;
    }

    console.log("Profile doesn't exist, creating...");

    // Create organization first
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: "Bernardo Lima Arquitetura",
        slug: "bernardolima-" + Date.now(),
      })
      .select()
      .single();

    if (orgError) {
      console.error("Error creating organization:", orgError);
      return;
    }

    console.log("Organization created:", org.id);

    // Create profile
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: existingUser.id,
        organization_id: org.id,
        full_name: fullName,
        email: email,
        role: "owner",
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return;
    }

    console.log("Profile created:", newProfile);
    return;
  }

  // Step 2: Try to disable the trigger first
  console.log("Attempting to disable trigger...");
  const { error: disableError } = await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;",
  });

  if (disableError) {
    console.log(
      "Could not disable trigger (expected if RPC doesn't exist):",
      disableError.message
    );
  }

  // Step 3: Create organization first
  console.log("Creating organization...");
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: "Bernardo Lima Arquitetura",
      slug: "bernardolima-" + Date.now(),
    })
    .select()
    .single();

  if (orgError) {
    console.error("Error creating organization:", orgError);
    return;
  }

  console.log("Organization created:", org.id);

  // Step 4: Create user with organization_id in metadata
  console.log("Creating user with organization_id in metadata...");
  const { data: userData, error: userError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        organization_id: org.id,
      },
    });

  if (userError) {
    console.error("Error creating user:", userError.message);

    // If user creation failed, try to create profile manually
    console.log("Trying alternative approach...");

    // Check if user was partially created
    const { data: users } = await supabase.auth.admin.listUsers();
    console.log("Total users in system:", users?.users?.length || 0);

    const partialUser = users?.users?.find((u) => u.email === email);

    if (partialUser) {
      console.log("User was partially created:", partialUser.id);

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", partialUser.id)
        .single();

      if (existingProfile) {
        console.log("Profile already exists:", existingProfile);
        console.log("\n=== Test User Ready ===");
        console.log("Email:", email);
        console.log("Password:", password);
        return;
      }

      // Try to create profile manually
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: partialUser.id,
          organization_id: org.id,
          full_name: fullName,
          email: email,
          role: "owner",
        })
        .select()
        .single();

      if (profileError) {
        console.error("Error creating profile:", profileError);
      } else {
        console.log("Profile created manually:", profile);
        console.log("\n=== Test User Ready ===");
        console.log("Email:", email);
        console.log("Password:", password);
      }
    } else {
      console.log("User was NOT created in auth.users");
      console.log("This requires fixing the database trigger directly in Supabase Dashboard");
    }

    return;
  }

  console.log("User created successfully!");
  console.log("User ID:", userData.user.id);
  console.log("Email:", userData.user.email);

  // Verify profile was created by trigger
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userData.user.id)
    .single();

  if (profileError) {
    console.log("Profile not created by trigger, creating manually...");

    const { data: manualProfile, error: manualError } = await supabase
      .from("profiles")
      .insert({
        user_id: userData.user.id,
        organization_id: org.id,
        full_name: fullName,
        email: email,
        role: "owner",
      })
      .select()
      .single();

    if (manualError) {
      console.error("Error creating profile manually:", manualError);
    } else {
      console.log("Profile created manually:", manualProfile);
    }
  } else {
    console.log("Profile created by trigger:", profile);
  }

  // Re-enable trigger
  const { error: enableError } = await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;",
  });

  if (enableError) {
    console.log("Could not re-enable trigger:", enableError.message);
  }

  console.log("\n=== Test User Created ===");
  console.log("Email:", email);
  console.log("Password:", password);
}

createTestUser().catch(console.error);
