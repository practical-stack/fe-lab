import { Suspense } from "react";
import { overlay } from "overlay-kit";
import { PrefetchQuery, SuspenseQuery } from "@suspensive/react-query-5";
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

function SolutionSheetBody({ close }: { close: () => void }) {
  return (
    <Suspense fallback={<TermsSkeleton />}>
      <SuspenseQuery {...termsQueryOptions("solution")}>
        {({ data: terms }) => <TermsContent terms={terms} onAgree={close} />}
      </SuspenseQuery>
    </Suspense>
  );
}

export function SolutionDemo() {
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
          <SolutionSheetBody close={close} />
        </SheetContent>
      </Sheet>
    ));
  }

  return (
    <div className="flex items-center gap-4">
      <PrefetchQuery {...termsQueryOptions("solution")} />
      <Button onClick={handleOpen}>시작하기</Button>
      <p className="text-sm text-gray-500">
        Sheet 열림 → 즉시 약관 목록 (Prefetch 캐시 HIT)
      </p>
    </div>
  );
}
