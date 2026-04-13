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

import { deepStrictEqual, strictEqual, throws } from "node:assert/strict";

import { localizableKeyFromSegments, segmentsFromLocalizableKey } from "../main/index.js";

describe("com.mgmtp.a12.localization.localizableKeyFactory", () => {
	describe("localizableKeyFromSegments", () => {
		it("creates a localizable key string of the given segments", () => {
			strictEqual(localizableKeyFromSegments(["abc", "def", "ghi"]), "abc.def.ghi");
		});

		it("escapes '.' characters in the given segments when creating the key string", () => {
			strictEqual(localizableKeyFromSegments(["ab.c", "d.ef", "gh.i"]), "ab\\pc.d\\pef.gh\\pi");
		});

		it("escapes the escape character '\\' in the given segments when creating the key string", () => {
			strictEqual(
				localizableKeyFromSegments(["ab\\c", "d\\ef", "gh\\i"]),
				"ab\\\\c.d\\\\ef.gh\\\\i"
			);
		});

		it("correctly escapes the '\\' and '.' character if they follow one another", () => {
			strictEqual(
				localizableKeyFromSegments(["ab\\.c", "d\\e.f", "gh.\\i"]),
				"ab\\\\\\pc.d\\\\e\\pf.gh\\p\\\\i"
			);
		});
	});

	describe("segmentsFromLocalizableKey", () => {
		it("returns the segments for the given localizable key", () => {
			deepStrictEqual(segmentsFromLocalizableKey("abc.def.ghi"), ["abc", "def", "ghi"]);
		});

		it("unescapes escaped '.' characters in the given key string", () => {
			deepStrictEqual(segmentsFromLocalizableKey("ab\\pc.d\\pef.gh\\pi"), ["ab.c", "d.ef", "gh.i"]);
		});

		it("unescapes the escaped escape character '\\' in the given key string", () => {
			deepStrictEqual(segmentsFromLocalizableKey("ab\\\\c.d\\\\ef.gh\\\\i"), [
				"ab\\c",
				"d\\ef",
				"gh\\i"
			]);
		});

		it("correctly unescapes the escaped '\\' and '.' character if they follow one another", () => {
			deepStrictEqual(segmentsFromLocalizableKey("ab\\\\\\pc.d\\\\e\\pf.gh\\p\\\\i"), [
				"ab\\.c",
				"d\\e.f",
				"gh.\\i"
			]);
		});

		it("correctly unescapes '\\\\p' to '\\p'", () => {
			deepStrictEqual(segmentsFromLocalizableKey("\\\\p"), ["\\p"]);
		});

		it("throws an error if escape characters occur before other characters than '.' and '\\'", () => {
			throws(
				() => segmentsFromLocalizableKey("ab\\c.de\\f.ghi"),
				"Invalid occurrence of '\\' encountered in input string 'ab\\c' at position '2'"
			);
		});
	});
});
