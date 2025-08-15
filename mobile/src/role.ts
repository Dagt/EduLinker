import * as SecureStore from "expo-secure-store";

const roleKey = "role";

export async function setRole(r: string){ await SecureStore.setItemAsync(roleKey, r); }
export async function getRole(){ return await SecureStore.getItemAsync(roleKey) || "guest"; }
