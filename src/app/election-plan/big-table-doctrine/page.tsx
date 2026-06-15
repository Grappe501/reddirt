import { BigTableDoctrinePanel } from "@/components/election-plan/BigTableDoctrinePanel";
import { BIG_TABLE_DOCTRINE } from "@/lib/election-plan/big-table-doctrine-content";

export const metadata = {
  title: "Big Table Democrat Doctrine | Kelly Grappe Victory Plan",
  description: BIG_TABLE_DOCTRINE.subtitle,
  robots: { index: false, follow: false },
};

export default function BigTableDoctrinePage() {
  return (
    <>
      <div className="ep-classification">Internal · Theory of Victory · Governing philosophy</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <BigTableDoctrinePanel standalone />
        </div>
      </div>
    </>
  );
}
