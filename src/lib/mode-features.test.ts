import { describe, expect, it } from "vitest";

import {
  getDefaultTaskStatus,
  getHomeRoute,
  getOrgFeatures,
  isFeatureEnabled,
} from "./mode-features";

describe("mode-features", () => {
  describe("getOrgFeatures", () => {
    it("should return all features enabled for operations mode", () => {
      const features = getOrgFeatures("operations");

      expect(features.timeTracking).toBe(true);
      expect(features.timesheet).toBe(true);
      expect(features.reports).toBe(true);
      expect(features.auditLogs).toBe(true);
      expect(features.loginLogs).toBe(true);
      expect(features.calendar).toBe(true);
      expect(features.taskBoard).toBe(true);
      expect(features.activityFeed).toBe(true);
    });

    it("should disable operations-focused features in product mode", () => {
      const features = getOrgFeatures("product");

      expect(features.timeTracking).toBe(false);
      expect(features.timesheet).toBe(false);
      expect(features.reports).toBe(false);
      expect(features.auditLogs).toBe(false);
      expect(features.loginLogs).toBe(false);
      expect(features.activityFeed).toBe(false);
      // But keep taskBoard enabled
      expect(features.taskBoard).toBe(true);
    });

    it("should respect calendar configuration in product mode", () => {
      // Calendar disabled by default
      const featuresDisabled = getOrgFeatures("product", {
        modeSettings: { features: { calendar: false } },
      });
      expect(featuresDisabled.calendar).toBe(false);

      // Calendar can be enabled via settings
      const featuresEnabled = getOrgFeatures("product", {
        modeSettings: { features: { calendar: true } },
      });
      expect(featuresEnabled.calendar).toBe(true);
    });

    it("should default to operations mode when undefined", () => {
      const features = getOrgFeatures(undefined);
      expect(features.timeTracking).toBe(true);
      expect(features.reports).toBe(true);
    });
  });

  describe("isFeatureEnabled", () => {
    it("should correctly check feature availability", () => {
      const features = getOrgFeatures("product");

      expect(isFeatureEnabled(features, "timeTracking")).toBe(false);
      expect(isFeatureEnabled(features, "taskBoard")).toBe(true);
    });

    it("should return false for unknown features", () => {
      const features = getOrgFeatures("operations");
      // @ts-expect-error - testing unknown feature
      expect(isFeatureEnabled(features, "unknownFeature")).toBe(false);
    });
  });

  describe("getHomeRoute", () => {
    it("should return /inbox for product mode", () => {
      expect(getHomeRoute("product")).toBe("/inbox");
    });

    it("should return /dashboard for operations mode", () => {
      expect(getHomeRoute("operations")).toBe("/dashboard");
    });

    it("should default to /dashboard when undefined", () => {
      expect(getHomeRoute(undefined)).toBe("/dashboard");
    });
  });

  describe("getDefaultTaskStatus", () => {
    it("should return todo regardless of mode", () => {
      // Function doesn't take mode argument - it always returns "todo"
      expect(getDefaultTaskStatus()).toBe("todo");
    });
  });
});
