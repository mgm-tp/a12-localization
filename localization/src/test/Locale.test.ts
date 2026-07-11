/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License – EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { deepStrictEqual, ok, strictEqual, throws } from "node:assert/strict";
import { describe, it } from "node:test";

import type { PartialLocale } from "../main/index.js";
import { Locale } from "../main/index.js";

describe("com.mgmtp.a12.localization.Locale", () => {
	describe("isLocale", () => {
		it("returns true when called with a valid Locale parameter", () => {
			const testLocale: Locale = {
				language: "en",
				country: "US"
			};

			ok(Locale.isLocale(testLocale));
		});

		it("returns false when called with a non-Locale parameter", () => {
			const testObject = {
				lang: "en",
				region: "US"
			};

			strictEqual(Locale.isLocale(testObject), false);
		});

		it("returns false when called with a PartialLocale parameter", () => {
			const testLocale: PartialLocale = {
				language: "en"
			};

			strictEqual(Locale.isLocale(testLocale), false);
		});
	});

	describe("isPartialLocale", () => {
		it("returns true when called with a valid PartialLocale parameter", () => {
			const testLocale: PartialLocale = {
				language: "en"
			};

			ok(Locale.isPartialLocale(testLocale));
		});

		it("returns true when called with a valid Locale parameter", () => {
			const testLocale: Locale = {
				language: "en",
				country: "US"
			};

			ok(Locale.isPartialLocale(testLocale));
		});

		it("returns false when called with a non-Locale parameter", () => {
			const testObject = {
				lang: "en",
				region: "US"
			};

			strictEqual(Locale.isPartialLocale(testObject), false);
		});
	});

	describe("fromString", () => {
		it("returns a Locale object when called with a valid locale string", () => {
			deepStrictEqual(Locale.fromString("en_US"), {
				language: "en",
				country: "US"
			});
			deepStrictEqual(Locale.fromString("en_DE"), {
				language: "en",
				country: "DE"
			});
			deepStrictEqual(Locale.fromString("de_DE"), {
				language: "de",
				country: "DE"
			});
			deepStrictEqual(Locale.fromString("de_AT"), {
				language: "de",
				country: "AT"
			});
			deepStrictEqual(Locale.fromString("es_029"), {
				language: "es",
				country: "029"
			});
		});

		it("returns a PartialLocale object when called with a valid language string", () => {
			deepStrictEqual(Locale.fromString("en"), { language: "en" });
			deepStrictEqual(Locale.fromString("de"), { language: "de" });
			deepStrictEqual(Locale.fromString("kok"), {
				language: "kok"
			});
		});

		it("rejects when called with an empty string", () => {
			throws(() => Locale.fromString(""));
		});

		it("rejects when called with an invalid locale string", () => {
			throws(() => Locale.fromString("de-DE"));
			throws(() => Locale.fromString("fr_ca"));
			throws(() => Locale.fromString("enUS"));
			throws(() => Locale.fromString("abcdefghi_DE"));
			throws(() => Locale.fromString("ab_DEF"));
			throws(() => Locale.fromString("ab_12"));
		});
	});

	describe("toString", () => {
		it('returns the serialized representation "en_GB" for a British-English Locale object', () => {
			strictEqual(Locale.toString({ language: "en", country: "GB" }), "en_GB");
		});

		it('returns the serialized representation "fr" for a French PartialLocale object', () => {
			strictEqual(Locale.toString({ language: "fr" }), "fr");
		});
	});
});
