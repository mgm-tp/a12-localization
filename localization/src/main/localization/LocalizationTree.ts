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

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Localizable } from "./Localizable.js";
import type { Locale, PartialLocale } from "./Locale.js";

/**
 * Provides localized texts in a tree structure.
 * Each localized text resides in a leaf of the tree.
 * The combination of the name of the nodes on the path to the leaf corresponds to the {@link Localizable}'s key.
 *
 * **Note that the node names may not contain a '.' character. If they do, the resulting localizable key does not match
 * the tree structure any longer and localization will likely fail.**
 *
 * Example:
 * {
 *	example: {
 *		button: {
 *			label: "Please click",
 *			hint: "It's magic :)"
 *		}
 *	}
 * }
 *
 * Resulting button label localizable:
 * 	key: "example.button.label"
 * 	value: "Please click"
 */
export interface LocalizationTree {
	[key: string]: LocalizationTree | string;
}

/**
 * Provides all translations of a {@link LocalizationTree} for multiple Locales.
 *
 * The key consists of a serialized {@link PartialLocale} or {@link Locale}.
 */
export interface LocalizationTreeMap {
	readonly [locale: string]: LocalizationTree | undefined;
}

/**
 * A tree structure which holds keys for {@link Localizable}s
 *
 * The combination of the name of the nodes on the path to the leaf corresponds to the {@link Localizable}'s key.
 *
 * **Note that the node names may not contain a '.' character. If they do, the resulting localizable key does not match
 * the tree structure any longer and localization will likely fail.**
 */
export interface LocalizationKeyTree {
	[key: string]: LocalizationKeyTree | string;
}

/**
 * This function injects the keys into the string properties of the provided
 * object.
 * A key consists of the period-separated path to the string property
 * (e.g. `warningModal.dialog.confirm`).
 *
 * @param tree is a structure that contains the keys in its string properties
 *             after the function has finished
 */
export function initializeKeys(tree: LocalizationKeyTree): void {
	internalInitializeKeys(tree, "");
}

function internalInitializeKeys(tree: LocalizationKeyTree, keyContext: string): void {
	for (const propertyName of Object.keys(tree)) {
		const key = keyContext.length > 0 ? `${keyContext}.${propertyName}` : propertyName;
		const node = tree[propertyName];
		if (typeof node === "string") {
			// End is reached and the generated key is injected
			tree[propertyName] = key;
		} else {
			internalInitializeKeys(node, key);
		}
	}
}

/**
 * This function resolves a localization text by a key from a {@link LocalizationTree}.
 *
 * @param tree is a structure that contains the translations in its string properties
 * @param key is a localization key that should be used to resolve the entry
 *
 * @return If the key matches exactly the path to an entry then the entry is
 *         returned. Otherwise undefined is returned.
 */
export function resolveLocalizationText(tree: LocalizationTree, key: string): string | undefined {
	let node = tree;
	for (
		// we can assume that all node names do not contain a '.' at this point
		let [propertyName, ...propertyNames] = key.split(".");
		propertyName !== undefined;
		[propertyName, ...propertyNames] = propertyNames
	) {
		const property = node[propertyName];

		if (typeof property === "string") {
			// If the key is too long we return undefined because it is not a proper match
			return propertyNames.length === 0 ? property : undefined;
		} else if (typeof property !== "object" || property === null) {
			// If the property is not a string or object then stop.
			// This is typically the case if the property is undefined...
			break;
		}

		node = property;
	}

	return undefined;
}
