import { jsonOk } from "@/lib/api";
import { getProviderStatus } from "@/lib/env";
import { getDashboardData } from "@/features/vocabulary/services/vocabulary-service";

export async function GET() {
  const [dashboard, providers] = await Promise.all([
    getDashboardData(),
    Promise.resolve(getProviderStatus()),
  ]);
  return jsonOk({ ...dashboard, providers });
}
