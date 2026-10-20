import { test, describe } from "node:test";
import assert from "node:assert";
import {
  getValidLocationUrl,
  getValidLocationQuery,
  getMapEmbedUrl,
  getLocationData,
  openGoogleMapsOnce,
} from "../lib/business/location.ts";

describe("Location & Google Maps Utilities", () => {
  describe("getValidLocationUrl", () => {
    test("accepts valid http and https URLs", () => {
      const valid = "https://maps.google.com/?q=28.6139,77.2090";
      assert.strictEqual(getValidLocationUrl(valid), valid);
    });

    test("extracts src from iframe embed code", () => {
      const iframe = '<iframe src="https://www.google.com/maps/embed?pb=!1m18" width="600"></iframe>';
      assert.strictEqual(
        getValidLocationUrl(iframe),
        "https://www.google.com/maps/embed?pb=!1m18"
      );
    });

    test("rejects dummy, example.com, and placeholder URLs", () => {
      assert.strictEqual(getValidLocationUrl("dummy"), null);
      assert.strictEqual(getValidLocationUrl("https://example.com/map"), null);
      assert.strictEqual(getValidLocationUrl("https://maps.google.com/..."), null);
      assert.strictEqual(getValidLocationUrl("http://dummy"), null);
      assert.strictEqual(getValidLocationUrl("https://dummy.local"), null);
    });

    test("rejects plain text non-URLs like addresses", () => {
      assert.strictEqual(getValidLocationUrl("Ballia, U.P."), null);
      assert.strictEqual(getValidLocationUrl("Near Main Market, Station Road"), null);
      assert.strictEqual(getValidLocationUrl(""), null);
      assert.strictEqual(getValidLocationUrl(undefined), null);
    });
  });

  describe("getValidLocationQuery", () => {
    test("derives query when address or city is provided", () => {
      const business = {
        name: "Acme Corp",
        address: "123 Main Street",
        city: "Mumbai",
      };
      assert.strictEqual(getValidLocationQuery(business), "Acme Corp, 123 Main Street, Mumbai");
    });

    test("returns null when only dummy address/city values are provided", () => {
      assert.strictEqual(
        getValidLocationQuery({
          name: "Acme Corp",
          address: "Address not provided",
          city: "All Cities",
        }),
        null
      );
      assert.strictEqual(
        getValidLocationQuery({
          name: "Acme Corp",
          address: "Location not available",
          city: "",
        }),
        null
      );
    });
  });

  describe("getMapEmbedUrl", () => {
    test("appends output=embed for standard Google Maps URLs", () => {
      const embed = getMapEmbedUrl("https://maps.google.com/maps?q=Connaught+Place");
      assert.ok(embed?.includes("output=embed"));
    });

    test("returns embed query when physical fallbackQuery is provided", () => {
      const embed = getMapEmbedUrl(null, "Hasvik, Ballia");
      assert.ok(embed?.includes("Hasvik"));
      assert.ok(embed?.includes("output=embed"));
    });

    test("returns null when neither valid url nor query is provided", () => {
      assert.strictEqual(getMapEmbedUrl("dummy", ""), null);
    });
  });

  describe("getLocationData", () => {
    test("returns isAvailable: true and correct mapLink when valid URL is present", () => {
      const business = {
        name: "Shop 1",
        locationUrl: "https://maps.google.com/?q=Connaught+Place",
      };
      const result = getLocationData(business);
      assert.strictEqual(result.isAvailable, true);
      assert.strictEqual(result.mapLink, "https://maps.google.com/?q=Connaught+Place");
      assert.ok(result.embedSrc?.includes("output=embed"));
    });

    test("returns isAvailable: true using physical address when URL is absent", () => {
      const business = {
        name: "Hasvik Tech",
        address: "Ballia, U.P.",
        city: "Ballia",
      };
      const result = getLocationData(business);
      assert.strictEqual(result.isAvailable, true);
      assert.ok(result.mapLink?.includes("Ballia"));
      assert.ok(result.embedSrc?.includes("Ballia"));
    });

    test("returns isAvailable: false and displayText 'Location not available' when no valid data exists", () => {
      const business = {
        name: "Empty Biz",
        locationUrl: "dummy",
        address: "Address not provided",
        city: "",
      };
      const result = getLocationData(business);
      assert.strictEqual(result.isAvailable, false);
      assert.strictEqual(result.mapLink, null);
      assert.strictEqual(result.embedSrc, null);
      assert.strictEqual(result.displayText, "Location not available");
    });

    test("handles null or undefined business gracefully", () => {
      const result = getLocationData(null);
      assert.strictEqual(result.isAvailable, false);
      assert.strictEqual(result.mapLink, null);
      assert.strictEqual(result.displayText, "Location not available");
    });
  });

  describe("openGoogleMapsOnce", () => {
    test("prevents default navigation, stops propagation, and triggers window.open once", () => {
      let prevented = false;
      let stopped = false;
      let openedUrl: string | null = null;
      let openedTarget: string | null = null;

      const mockEvent = {
        preventDefault: () => {
          prevented = true;
        },
        stopPropagation: () => {
          stopped = true;
        },
      };

      type WindowMock = { open?: (url: string, target: string) => void };
      const globalObj = globalThis as unknown as { window?: WindowMock };
      const originalWindow = globalObj.window;

      globalObj.window = {
        open: (url: string, target: string) => {
          openedUrl = url;
          openedTarget = target;
        },
      };

      try {
        openGoogleMapsOnce(mockEvent, "https://maps.google.com/?q=Delhi");

        assert.strictEqual(prevented, true, "preventDefault must be called to stop double opening");
        assert.strictEqual(stopped, true, "stopPropagation must be called");
        assert.strictEqual(openedUrl, "https://maps.google.com/?q=Delhi");
        assert.strictEqual(openedTarget, "_blank");
      } finally {
        globalObj.window = originalWindow;
      }
    });
  });
});
