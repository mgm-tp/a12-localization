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

import type { QualifiedName } from "ts-morph";
import { SyntaxKind } from "ts-morph";

import type { Recipe } from "@com.mgmtp.a12.devtools/codemod";

const packageName = "@com.mgmtp.a12.utils/utils-localization";
const reactPackageName = "@com.mgmtp.a12.utils/utils-localization-react";

const namespaceMappings: Record<string, Record<string, [string, string] | undefined>> = {
	ValueConversion: {
		ParseError: ["ValueConversionParseError", packageName]
	},
	LocalizerContext: {
		Type: ["LocalizerContextProps", reactPackageName]
	},
	DefaultLocalizerContextProvider: {
		Props: ["DefaultLocalizerContextProviderProps", reactPackageName]
	}
};

function getMapping(name: QualifiedName): [string, string] | undefined {
	const ns = name.getLeft();

	const mapping = namespaceMappings[ns.getText()]?.[name.getRight().getText()];
	if (!mapping) {
		return undefined;
	}

	return ns
		.getSymbol()
		?.getDeclarations()
		.some(decl =>
			decl
				.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
				?.getModuleSpecifierValue()
				.startsWith(mapping[1])
		)
		? mapping
		: undefined;
}

export const namespaceToInterfaceRecipe: Recipe = {
	metadata: {
		id: "namespaceToInterface",
		description: "Converts namespaces with a single interface export to top-level interfaces",
		supportedVersions: "^8.0.0"
	},

	execute(project): void {
		for (const sourceFile of project.getSourceFiles()) {
			sourceFile.getDescendantsOfKind(SyntaxKind.QualifiedName).forEach(name => {
				const mapping = getMapping(name);

				if (mapping) {
					const [newInterfaceName, packageName] = mapping;

					name.replaceWithText(newInterfaceName);

					const id = sourceFile
						.getDescendantsOfKind(SyntaxKind.ImportDeclaration)
						.find(i => i.getModuleSpecifierValue().startsWith(packageName) && i.isTypeOnly());

					if (id) {
						if (!id?.getNamedImports().some(i => i.getName() === newInterfaceName)) {
							id?.addNamedImport({ name: newInterfaceName });
						}
					} else {
						sourceFile.addImportDeclaration({
							moduleSpecifier: packageName,
							isTypeOnly: true,
							namedImports: [{ name: newInterfaceName }]
						});
					}
				}
			});
		}
	}
};
