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

import { deepStrictEqual, strictEqual } from "node:assert/strict";

import type { DataFormats } from "@com.mgmtp.a12.utils/utils-localization";
import { defaultDataFormats } from "@com.mgmtp.a12.utils/utils-localization";

import type { DefaultLocalizerContextProvider } from "../main/index.js";
import { getLocalizerContextDefaults } from "../main/internal/LocalizerContext.js";

describe("com.mgmtp.a12.localization-react.defaults", () => {
	it("when given only a locale returns the locale and the respective defaults for DataFormats, ValueConversion and localizer", () => {
		const input: DefaultLocalizerContextProvider.Props = {
			locale: { language: "de", country: "DE" }
		};

		const defaults = getLocalizerContextDefaults(input);

		deepStrictEqual(defaults.locale, input.locale);
		deepStrictEqual(defaults.dataFormats, defaultDataFormats(input.locale));
		strictEqual(defaults.conversion.formatValue(10.25, { type: "NumberType" }), "10,25");
		strictEqual(
			defaults.localizer({
				key: "foo",
				defaults: {
					en: "This text is in English.",
					de: "Dieser Text ist Deutsch."
				}
			}),
			"Dieser Text ist Deutsch."
		);
	});

	it("when given a locale & DataFormats returns the locale, the DataFormats and the respective defaults for ValueConversion and localizer", () => {
		const locale = { language: "de", country: "DE" };
		const dataFormats: Partial<DataFormats> = {
			...defaultDataFormats({ language: "de" }),
			decimalSeparator: ".",
			thousandsSeparator: "~"
		};

		const input: DefaultLocalizerContextProvider.Props = {
			locale,
			dataFormats
		};

		const defaults = getLocalizerContextDefaults(input);

		deepStrictEqual(defaults.locale, input.locale);
		deepStrictEqual(defaults.dataFormats, input.dataFormats);
		strictEqual(defaults.conversion.formatValue(10.25, { type: "NumberType" }), "10.25");
		strictEqual(
			defaults.localizer({
				key: "foo",
				defaults: {
					en: "This text is in English.",
					de: "Dieser Text ist Deutsch."
				}
			}),
			"Dieser Text ist Deutsch."
		);
	});

	it("when given a locale, DataFormats & ValueConversion returns the locale, DataFormats & ValueConversion and the respective default localizer", () => {
		const locale = { language: "de", country: "DE" };
		const dataFormats: Partial<DataFormats> = {
			...defaultDataFormats({ language: "de" }),
			decimalSeparator: ".",
			thousandsSeparator: "~"
		};
		const valueConversion = {
			formatValue: () => "abc",
			parseValue: () => ({ value: undefined })
		};

		const input: DefaultLocalizerContextProvider.Props = {
			locale,
			dataFormats,
			valueConversion
		};

		const defaults = getLocalizerContextDefaults(input);

		deepStrictEqual(defaults.locale, input.locale);
		deepStrictEqual(defaults.dataFormats, input.dataFormats);
		strictEqual(defaults.conversion, input.valueConversion);
		strictEqual(
			defaults.localizer({
				key: "foo",
				defaults: {
					en: "This text is in English.",
					de: "Dieser Text ist Deutsch."
				}
			}),
			"Dieser Text ist Deutsch."
		);
	});
});
