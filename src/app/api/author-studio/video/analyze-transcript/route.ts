import { authorStudioStubHandler } from "@/lib/author-studio/authorStudioStubRoute";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";

export const dynamic = "force-dynamic";

const route = "author-studio/video/analyze-transcript";

export async function POST(req: Request) {
  return authorStudioStubHandler(
    req,
    route,
    authorStudioOutputKinds.videoRepurposePlan,
    "TODO: transcript analysis + moments — video_repurpose_plan (OpenAI / code interpreter)"
  );
}
