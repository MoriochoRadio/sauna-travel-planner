// @vitest-environment jsdom
import { createElement, useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sortVerificationRecords, VerificationEditor, type Verification } from "./Admin";

afterEach(() => document.body.replaceChildren());

describe("admin verification review queue", () => {
  const record: Verification = {
    placeId: "spaland-centum-city",
    name: "스파랜드 센텀시티",
    region: "부산",
    status: "verified",
    sourceUrl: "https://example.com/source",
    verifiedAt: new Date("2026-08-13T00:00:00.000Z"),
    reviewBy: new Date("2026-08-12T00:00:00.000Z"),
    reviewPriority: "overdue",
    reviewDueInDays: -2,
    internalNote: "공식 출처 재확인",
    updatedAt: new Date("2026-08-13T00:00:00.000Z"),
  };

  it("shows the review priority and saves an updated next-review date", () => {
    const onSave = vi.fn();
    render(createElement(VerificationEditor, { record, onSave, saving: false }));

    expect(screen.getByText("검토 기한 경과 · 2일 지남")).toBeTruthy();
    const reviewDate = screen.getByLabelText("스파랜드 센텀시티 다음 검토일") as HTMLInputElement;
    expect(reviewDate.value).toBe("2026-08-12");
    fireEvent.change(reviewDate, { target: { value: "2026-08-28" } });
    fireEvent.click(screen.getByRole("button", { name: "검증 레코드 저장" }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      placeId: "spaland-centum-city",
      reviewBy: new Date("2026-08-28T00:00:00.000Z"),
    }));
  });

  it("moves a newly overdue record to the front of the queue after its review date is saved", () => {
    const scheduled: Verification = { ...record, placeId: "scheduled", name: "일정 검토", reviewBy: new Date("2026-09-30T00:00:00.000Z"), reviewPriority: "scheduled", reviewDueInDays: 47 };
    const dueSoon: Verification = { ...record, placeId: "due-soon", name: "우선 검토", reviewBy: new Date("2026-08-20T00:00:00.000Z"), reviewPriority: "due-soon", reviewDueInDays: 6 };
    function QueueHarness() {
      const [records, setRecords] = useState([scheduled, dueSoon]);
      return createElement("div", { "data-testid": "verification-queue" }, sortVerificationRecords(records).map(item => createElement(VerificationEditor, {
        key: item.placeId,
        record: item,
        saving: false,
        onSave: input => setRecords(current => current.map(existing => existing.placeId === input.placeId ? { ...existing, reviewBy: input.reviewBy, reviewPriority: "overdue", reviewDueInDays: -1 } : existing)),
      })));
    }

    render(createElement(QueueHarness));
    const queue = screen.getByTestId("verification-queue");
    expect(within(queue).getAllByRole("article").map(item => item.textContent).join(" ")).toMatch(/우선 검토.*일정 검토/);
    const scheduledCard = within(queue).getByText("일정 검토").closest("article")!;
    fireEvent.change(within(scheduledCard).getByLabelText("일정 검토 다음 검토일"), { target: { value: "2026-08-13" } });
    fireEvent.click(within(scheduledCard).getByRole("button", { name: "검증 레코드 저장" }));

    expect(within(queue).getAllByRole("article").map(item => item.textContent).join(" ")).toMatch(/일정 검토.*우선 검토/);
  });
});
