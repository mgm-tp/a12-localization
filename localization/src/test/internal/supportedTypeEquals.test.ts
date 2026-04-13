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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { strictEqual } from "node:assert/strict";

import { SupportedType } from "../../main/conversion.js";

describe("com.mgmtp.a12.conversion.supportedTypeEquals", () => {
	it("valid SupportedType", () => {
		const values: SupportedType[] = [
			"",
			"hello world",
			0,
			1,
			true,
			false,
			null,
			<any>undefined,
			new Date("2023-11-21T15:59:42.698Z"),
			[new Date("1999-12-31T08:01:07.008Z"), new Date("2023-11-21T15:59:42.698Z")]
		];

		for (let i = 0; i < values.length; i++) {
			for (let j = 0; j < values.length; j++) {
				const valueA = structuredClone(values[i]);
				const valueB = structuredClone(values[j]);
				strictEqual(SupportedType.equals(valueA, valueB), i === j);
			}
		}
	});
});
