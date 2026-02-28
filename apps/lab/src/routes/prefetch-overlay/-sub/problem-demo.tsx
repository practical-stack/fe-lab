import { useQuery } from "@tanstack/react-query";
import { overlay } from "overlay-kit";
import { Button } from "@fe-lab/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@fe-lab/ui/components/sheet";
import { termsQueryOptions } from "./@shared/api/terms.helper";
import { TermsSkeleton } from "./@shared/ui/terms/terms.ui";
import { TermsContent } from "./@shared/ui/terms/terms";

function ProblemSheetBody({ close }: { close: () => void }) {
  const { data: terms, isLoading } = useQuery(
    termsQueryOptions("problem-lazy"),
  );

  if (isLoading || !terms) {
    return <TermsSkeleton />;
  }

  return <TermsContent terms={terms} onAgree={close} />;
}

export function ProblemDemo() {
  function handleOpen() {
    overlay.open(({ isOpen, close }) => (
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-xl">
          <SheetHeader>
            <SheetTitle>약관 동의</SheetTitle>
          </SheetHeader>
          <ProblemSheetBody close={close} />
        </SheetContent>
      </Sheet>
    ));
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleOpen}>시작하기</Button>
      <p className="text-sm text-gray-500">
        Sheet 열림 → Skeleton 800ms → 약관 목록
      </p>
    </div>
  );
}
