import { VolunteerCommandCenterClient } from "@/components/admin/volunteers/VolunteerCommandCenterClient";
import { loadVolunteerSystemBundle } from "@/lib/campaign-events/volunteers/load-volunteer-bundle";
import { loadVolunteersStore, seedEmptyVolunteerDataFiles } from "@/lib/campaign-events/volunteers/volunteer-storage";

export const dynamic = "force-dynamic";

export default function VolunteersCommandCenterPage() {
  seedEmptyVolunteerDataFiles();
  const bundle = loadVolunteerSystemBundle();
  const store = loadVolunteersStore();
  return (
    <VolunteerCommandCenterClient
      bundle={JSON.parse(JSON.stringify(bundle))}
      profiles={JSON.parse(JSON.stringify(store.profiles))}
    />
  );
}
