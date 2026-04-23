import { authorStudioStubHandler } from "@/lib/author-studio/authorStudioStubRoute";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";

export const dynamic = "force-dynamic";

const route = "author-studio/video/generate-captions";

export async function POST(req: Request) {
  return authorStudioStubHandler(
    req,
    route,
    authorStudioOutputKinds.captionPackage,
    "TODO: SRT/VTT generation — caption_package"
  );
}
