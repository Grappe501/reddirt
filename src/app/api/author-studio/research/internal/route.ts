import { authorStudioStubHandler } from "@/lib/author-studio/authorStudioStubRoute";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";

export const dynamic = "force-dynamic";

const route = "author-studio/research/internal";

export async function POST(req: Request) {
  return authorStudioStubHandler(
    req,
    route,
    authorStudioOutputKinds.researchMemo,
    "TODO: file / internal corpus search — wire OpenAI file search + campaign memory"
  );
}
