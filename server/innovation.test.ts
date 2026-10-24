import { describe, expect, it } from "vitest";
import { approveRescue, createReferral, getInnovationSnapshot, resetInnovation, simulateDisaster, transitionReferral } from "./innovationStore";

describe("MedRisq AI innovation workflows", () => {
  it("recalculates a disaster projection from scenario severity", () => {
    resetInnovation();
    const baseline = getInnovationSnapshot();
    const projection = simulateDisaster({ scenario: "earthquake", severity: 92 });
    expect(projection.selectedScenario).toBe("earthquake");
    expect(projection.projection.demandIndex).toBeGreaterThan(baseline.projection.demandIndex);
    expect(projection.projection.suggestions.length).toBeGreaterThan(0);
  });

  it("requires acceptance before a referral can be completed", () => {
    resetInnovation();
    const referral = createReferral({ origin: "Northbridge General", need: "ICU bed", capability: "ICU", urgency: "High" });
    expect(referral.status).toBe("Request Sent");
    expect(() => transitionReferral({ id: referral.id, status: "Completed" })).toThrow();
    const accepted = transitionReferral({ id: referral.id, status: "Accepted" });
    expect(accepted.status).toBe("Accepted");
    const completed = transitionReferral({ id: referral.id, status: "Completed" });
    expect(completed.status).toBe("Completed");
  });

  it("approves verified rescue stock and rejects missing items", () => {
    resetInnovation();
    const before = getInnovationSnapshot().rescueItems.find(item => item.id === "rescue-1");
    expect(before?.verification).toBe("Verified");
    expect(approveRescue({ id: "rescue-1" }).status).toBe("Approved");
    expect(() => approveRescue({ id: "does-not-exist" })).toThrow();
  });
});
