import { authorStudioStubHandler } from "@/lib/author-studio/authorStudioStubRoute";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";

export const dynamic = "force-dynamic";

const route = "author-studio/research/web";

export async function POST(req: Request) {
  return authorStudioStubHandler(
    req,
    route,
    authorStudioOutputKinds.researchMemo,
    "TODO: web research + citations — wire browse / search tools; response = research_memo"
  );
}
