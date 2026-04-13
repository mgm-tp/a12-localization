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

import { strictEqual } from "node:assert/strict";

import { resolvePlaceholders } from "../main/index.js";

describe("com.mgmtp.a12.localization.resolvePlaceholder", () => {
	it("replaces a single placeholder in the template string with its actual value", () => {
		strictEqual(
			resolvePlaceholders("test me with a $placeholder$", {
				placeholder: "value"
			}),
			"test me with a value"
		);
	});

	it("replaces a single placeholder in the template string with its actual value when the value is an empty string", () => {
		strictEqual(
			resolvePlaceholders("test me with a $placeholder$", {
				placeholder: ""
			}),
			"test me with a "
		);
	});

	it("replaces multiple identical placeholders in the template string with their actual value", () => {
		strictEqual(
			resolvePlaceholders("test $placeholder$s me with a $placeholder$ and another $placeholder$", {
				placeholder: "value"
			}),
			"test values me with a value and another value"
		);
	});

	it("replaces multiple different placeholders in the template string with their actual value", () => {
		strictEqual(
			resolvePlaceholders(
				"test this $placeholder$s me with a $placeholder2$ and another $placeholder3$",
				{
					placeholder: "value",
					placeholder2: "value2",
					placeholder3: "value3"
				}
			),
			"test this values me with a value2 and another value3"
		);
	});

	it("retains a placeholder if no value was given for it", () => {
		strictEqual(
			resolvePlaceholders("test me with a $placeholder$ and another $placeholder2$", {
				placeholder: "value"
			}),
			"test me with a value and another $placeholder2$"
		);
	});

	it("replaces a placeholder whose name contains a space", () => {
		strictEqual(
			resolvePlaceholders("test me with a $place holder$", {
				"place holder": "value"
			}),
			"test me with a value"
		);
	});

	it("replaces $$ with $ (delimiter escaping)", () => {
		strictEqual(resolvePlaceholders("give me a $$", {}), "give me a $");
	});

	it("does not replace single $ with $$", () => {
		strictEqual(resolvePlaceholders("I need 100$ now", {}), "I need 100$ now");
	});

	it("replaces placeholders in sequences correctly", () => {
		strictEqual(
			resolvePlaceholders("$placeholder1$placeholder2$placeholder3$", {
				placeholder1: "value1",
				placeholder2: "value2",
				placeholder3: "value3"
			}),
			"value1placeholder2value3"
		);
	});
});
