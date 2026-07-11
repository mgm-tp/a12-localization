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

import { deepStrictEqual, fail, strictEqual, throws } from "node:assert/strict";
import { describe, it } from "node:test";

import type { LocalizableArgs, LocalizationTreeMap, LocalizedModelText } from "../main/index.js";
import { localizableFromLocalizationTreeMap, localizableFromModel } from "../main/index.js";

describe("com.mgmtp.a12.localization.LocalizableFactory", () => {
	describe("localizableFromModel", () => {
		it("returns a Localizable with the respective defaults and args when given a number of model texts and a number of args ", () => {
			const modelTexts: LocalizedModelText = [
				{
					locale: "en",
					text: "test [en]"
				},
				{
					locale: "de",
					text: "test [de]"
				},
				{
					locale: "en_GB",
					text: "test [en_GB]"
				},
				{
					locale: "de_DE",
					text: "test [de_DE]"
				}
			];

			const args: LocalizableArgs = {
				foo: {
					type: "plain",
					value: "bar"
				},
				test: {
					type: "plain",
					value: 123
				}
			};

			const localizable = localizableFromModel("test.me", modelTexts, args);

			deepStrictEqual(localizable.args, args);

			if (localizable.defaults) {
				deepStrictEqual(localizable.defaults["en"], "test [en]");
				deepStrictEqual(localizable.defaults["de"], "test [de]");
				deepStrictEqual(localizable.defaults["en_GB"], "test [en_GB]");
				deepStrictEqual(localizable.defaults["de_DE"], "test [de_DE]");
			} else {
				fail("The localizable is expected to contain defaults!");
			}
		});
		it("returns a Localizable without any defaults when given an empty array of model texts", () => {
			const localizable = localizableFromModel("test.me", []);

			deepStrictEqual(localizable.defaults, {});
		});

		it("returns a Localizable with args set to undefined when given no args", () => {
			const localizable = localizableFromModel("test.me", []);

			strictEqual(localizable.args, undefined);
		});

		it("throws an error when given an empty key", () => {
			throws(() => localizableFromModel("", []));
		});
	});

	describe("localizableFromLocalizationTreeMap", () => {
		it("returns a Localizable with the respective defaults and args when given a localization tree map with texts and a number of args ", () => {
			const translations: LocalizationTreeMap = {
				en: {
					test: {
						me: "test [en]",
						foo: "bar [en]"
					}
				},
				en_GB: {
					test: {
						me: "test [en_GB]",
						foo: "bar [en_GB]"
					}
				},
				de: {
					test: {
						me: "test [de]",
						foo: "bar [de]"
					}
				},
				de_DE: {
					test: {
						me: "test [de_DE]",
						foo: "bar [de_DE]"
					}
				}
			};

			const args: LocalizableArgs = {
				foo: {
					type: "plain",
					value: "bar"
				},
				test: {
					type: "plain",
					value: 123
				}
			};

			// note: accessing the translations from a localization tree must be done using a "resources" prefix
			const localizable = localizableFromLocalizationTreeMap("test.me", translations, args);

			deepStrictEqual(localizable.args, args);

			if (localizable.defaults) {
				deepStrictEqual(localizable.defaults["en"], "test [en]");
				deepStrictEqual(localizable.defaults["de"], "test [de]");
				deepStrictEqual(localizable.defaults["en_GB"], "test [en_GB]");
				deepStrictEqual(localizable.defaults["de_DE"], "test [de_DE]");
			} else {
				fail("The localizable is expected to contain defaults!");
			}
		});
		it("returns a Localizable without any defaults when given an empty array of model texts", () => {
			const localizable = localizableFromLocalizationTreeMap("test.me", {});

			deepStrictEqual(localizable.defaults, {});
		});

		it("returns a Localizable with args set to undefined when given no args", () => {
			const localizable = localizableFromLocalizationTreeMap("test.me", {});

			strictEqual(localizable.args, undefined);
		});

		it("throws an error when given an empty key", () => {
			throws(() => localizableFromLocalizationTreeMap("", {}));
		});
	});
});
