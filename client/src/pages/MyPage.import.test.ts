// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { focusImportedPlanCard, IMPORTED_PLAN_HIGHLIGHT_MS, StaticPlanImportCard, useImportedPlanHighlight } from "./MyPage";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => cleanup());

describe("static itinerary import completion", () => {
  it("scrolls and focuses the newly created plan card by its server plan ID", () => {
    const scrollIntoView = vi.fn();
    const focus = vi.fn();
    const getElementById = vi.fn().mockReturnValue({ scrollIntoView, focus });
    vi.stubGlobal("document", { getElementById });

    focusImportedPlanCard(91);

    expect(getElementById).toHaveBeenCalledWith("trip-plan-91");
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    vi.unstubAllGlobals();
  });

  it("renders skipped-item reasons and a direct plan confirmation action after import", () => {
    const markup = renderToStaticMarkup(createElement(StaticPlanImportCard, {
      code: "",
      onCodeChange: vi.fn(),
      onImport: vi.fn(),
      isImporting: false,
      result: { planId: 91, importedCount: 2, skippedCount: 2, skipped: { unmappedCount: 1, duplicateCount: 1 } },
      onViewPlan: vi.fn(),
    }));

    expect(markup).toContain('role="status"');
    expect(markup).toContain("새 플랜에 2곳을 담았어요.");
    expect(markup).toContain("등록되지 않은 장소 1곳, 중복 장소 1곳입니다.");
    expect(markup).toContain("새 플랜 확인하기");
  });

  it("calls the direct plan action with the created plan ID when the completion button is clicked", () => {
    const onViewPlan = vi.fn();
    render(createElement(StaticPlanImportCard, {
      code: "",
      onCodeChange: vi.fn(),
      onImport: vi.fn(),
      isImporting: false,
      result: { planId: 91, importedCount: 1, skippedCount: 0, skipped: { unmappedCount: 0, duplicateCount: 0 } },
      onViewPlan,
    }));

    fireEvent.click(screen.getByRole("button", { name: "새 플랜 확인하기" }));
    expect(onViewPlan).toHaveBeenCalledWith(91);
  });

  it("moves from the completion card to the matching plan card and clears its highlight after the timeout", () => {
    vi.useFakeTimers();
    function ImportHarness() {
      const { highlightedPlanId, highlightPlan } = useImportedPlanHighlight([91]);
      return createElement("div", null,
        createElement(StaticPlanImportCard, {
          code: "",
          onCodeChange: vi.fn(),
          onImport: vi.fn(),
          isImporting: false,
          result: { planId: 91, importedCount: 1, skippedCount: 0, skipped: { unmappedCount: 0, duplicateCount: 0 } },
          onViewPlan: highlightPlan,
        }),
        createElement("div", { id: "trip-plan-91", tabIndex: -1, className: highlightedPlanId === 91 ? "imported-plan-highlight" : "" }, "새 플랜"),
      );
    }

    render(createElement(ImportHarness));
    const card = document.getElementById("trip-plan-91") as HTMLElement;
    const scrollIntoView = vi.fn();
    const focus = vi.fn();
    Object.assign(card, { scrollIntoView, focus });
    fireEvent.click(screen.getByRole("button", { name: "새 플랜 확인하기" }));
    expect(card.className).toContain("imported-plan-highlight");
    act(() => vi.advanceTimersByTime(1));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    act(() => vi.advanceTimersByTime(IMPORTED_PLAN_HIGHLIGHT_MS));
    expect(card.className).not.toContain("imported-plan-highlight");
    vi.useRealTimers();
  });

  it("focuses then clears the imported plan highlight after the configured duration", () => {
    vi.useFakeTimers();
    const card = document.createElement("div");
    const scrollIntoView = vi.fn();
    const focus = vi.fn();
    card.id = "trip-plan-91";
    Object.assign(card, { scrollIntoView, focus });
    document.body.append(card);
    const { result, unmount } = renderHook(() => useImportedPlanHighlight([91]));

    act(() => result.current.highlightPlan(91));
    expect(result.current.highlightedPlanId).toBe(91);
    act(() => vi.advanceTimersByTime(1));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    act(() => vi.advanceTimersByTime(IMPORTED_PLAN_HIGHLIGHT_MS));
    expect(result.current.highlightedPlanId).toBeNull();
    unmount();
    card.remove();
    vi.useRealTimers();
  });
});
