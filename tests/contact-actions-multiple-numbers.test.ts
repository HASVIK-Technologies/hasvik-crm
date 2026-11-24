import { test, describe } from "node:test";
import assert from "node:assert";
import {
  normalizeNumbers,
  labelFor,
  getWhatsAppUrl,
  type ContactNumber,
} from "../lib/business/contact-numbers.ts";

describe("Contact Actions & Multiple Numbers Support", () => {
  describe("normalizeNumbers", () => {
    test("returns empty array for undefined or empty inputs without fallback", () => {
      assert.deepStrictEqual(normalizeNumbers(undefined), []);
      assert.deepStrictEqual(normalizeNumbers([]), []);
    });

    test("includes fallback number when values list is empty", () => {
      const result = normalizeNumbers([], "9876543210");
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].number, "9876543210");
      assert.strictEqual(result[0].digits, "9876543210");
    });

    test("deduplicates numbers with matching digits across objects and strings", () => {
      const inputs: Array<ContactNumber | string> = [
        { number: "+91 98765 43210", type: "Office", isPrimary: true },
        "9876543210", // duplicate
        { number: "+91 91234 56789", type: "Mobile" },
      ];
      const result = normalizeNumbers(inputs, "9876543210"); // fallback duplicate
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].digits, "919876543210");
      assert.strictEqual(result[0].type, "Office");
      assert.strictEqual(result[0].isPrimary, true);
      assert.strictEqual(result[1].digits, "919123456789");
    });

    test("preserves multiple distinct contact numbers in order", () => {
      const inputs = [
        { number: "9876543211", type: "Office", isPrimary: true },
        { number: "9876543212", type: "Mobile", isPrimary: false },
        { number: "9876543213", name: "Manager" },
      ];
      const result = normalizeNumbers(inputs);
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].digits, "9876543211");
      assert.strictEqual(result[1].digits, "9876543212");
      assert.strictEqual(result[2].digits, "9876543213");
    });
  });

  describe("labelFor formatting", () => {
    test("returns 'Primary' when isPrimary is true and no custom descriptor", () => {
      assert.strictEqual(labelFor({ isPrimary: true }, 0), "Primary");
    });

    test("appends '(Primary)' when isPrimary is true and type is present", () => {
      assert.strictEqual(labelFor({ type: "Mobile", isPrimary: true }, 0), "Mobile (Primary)");
      assert.strictEqual(labelFor({ type: "Office", isPrimary: true }, 1), "Office (Primary)");
    });

    test("appends '(Primary)' when isPrimary is true and name is present", () => {
      assert.strictEqual(labelFor({ name: "Founder", isPrimary: true }, 0), "Founder (Primary)");
    });

    test("returns descriptor without primary tag when isPrimary is false", () => {
      assert.strictEqual(labelFor({ type: "Secondary", isPrimary: false }, 1), "Secondary");
      assert.strictEqual(labelFor({ name: "Support" }, 2), "Support");
    });

    test("falls back to 'Number N' when no descriptor and not primary", () => {
      assert.strictEqual(labelFor({}, 0), "Number 1");
      assert.strictEqual(labelFor({ isPrimary: false }, 1), "Number 2");
    });
  });

  describe("getWhatsAppUrl", () => {
    test("appends India country code 91 for 10-digit numbers", () => {
      assert.strictEqual(getWhatsAppUrl("9876543210"), "https://wa.me/919876543210");
    });

    test("retains full digits when number already has country code", () => {
      assert.strictEqual(getWhatsAppUrl("919876543210"), "https://wa.me/919876543210");
      assert.strictEqual(getWhatsAppUrl("14155552671"), "https://wa.me/14155552671");
    });
  });

  describe("Single vs Multiple Decision Logic", () => {
    test("determines direct link vs dropdown based on normalized entry count", () => {
      // 0 numbers -> nothing to render
      const zero = normalizeNumbers([]);
      assert.strictEqual(zero.length, 0);

      // 1 number -> single direct action button
      const single = normalizeNumbers([{ number: "9876543210", isPrimary: true }]);
      assert.strictEqual(single.length, 1);
      assert.strictEqual(single[0].digits, "9876543210");

      // Multiple numbers -> dropdown menu required
      const multiple = normalizeNumbers([
        { number: "9876543210", isPrimary: true, type: "Mobile" },
        { number: "9876543211", type: "Office" },
        { number: "9876543212", type: "WhatsApp" },
      ]);
      assert.strictEqual(multiple.length, 3);
      assert.strictEqual(multiple.length > 1, true);
    });
  });
});
