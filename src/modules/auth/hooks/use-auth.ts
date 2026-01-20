"use client";

import { useAuthContext } from "../context";

export function useAuth() {
  return useAuthContext();
}
