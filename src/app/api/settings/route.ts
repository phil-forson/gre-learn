import { jsonOk } from "@/lib/api";
import { getProviderStatus } from "@/lib/env";

export async function GET() {
  return jsonOk({ providers: getProviderStatus() });
}
