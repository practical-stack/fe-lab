import { useQuery } from "@tanstack/react-query";
import { overlay } from "overlay-kit";
import { Button } from "@fe-lab/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@fe-lab/ui/components/sheet";
import type { TermItem } from "./@shared/api/terms.helper";
import { termsQueryOptions } from "./@shared/api/terms.helper";
import { TermsSkeleton } from "./@shared/ui/terms/terms.ui";
import { TermsContent } from "./@shared/ui/terms/terms";

function openTermsSheet(terms: TermItem[]) {
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
        <TermsContent terms={terms} onAgree={close} />
      </SheetContent>
    </Sheet>
  ));
}

export function ProblemEagerDemo() {
  const { data: terms, isLoading } = useQuery(
    termsQueryOptions("problem-eager"),
  );

  if (isLoading || !terms) {
    return <TermsSkeleton />;
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={() => openTermsSheet(terms)}>시작하기</Button>
      <p className="text-sm text-gray-500">
        페이지 로딩 시 Skeleton 800ms → 버튼 표시 → Sheet 즉시
      </p>
    </div>
  );
}
