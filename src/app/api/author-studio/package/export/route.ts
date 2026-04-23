import { authorStudioStubHandler } from "@/lib/author-studio/authorStudioStubRoute";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";

export const dynamic = "force-dynamic";

const route = "author-studio/package/export";

export async function POST(req: Request) {
  return authorStudioStubHandler(
    req,
    route,
    authorStudioOutputKinds.exportPackage,
    "TODO: approved export bundle — checklists, linked tasks/assets — export_package"
  );
}
