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

import { Node, SyntaxKind, type Identifier, type SourceFile } from "ts-morph";

import type { Recipe } from "@com.mgmtp.a12.devtools/codemod";

const packageName = "@com.mgmtp.a12.utils/utils-localization";

/**
 * Checks if an identifier is imported from our package
 */
function isImportedFromPackage(identifier: Identifier): boolean {
	return (
		identifier
			.getSymbol()
			?.getDeclarations()
			.at(0)
			?.asKind(SyntaxKind.ImportSpecifier)
			?.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
			?.getModuleSpecifierValue()
			.startsWith(packageName) ?? false
	);
}

/**
 * Replaces <enumName>.XXX enum accesses with string literals
 */
function replaceEnumAccesses(file: SourceFile, enumName: string): void {
	// Find all property access expressions like <enumName>.XXX
	const propertyAccesses = file.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

	for (const access of propertyAccesses) {
		const expression = access.getExpression();
		const propertyName = access.getName();

		// Check if this is <enumName>.XXX and enumName is imported from our package
		if (
			Node.isIdentifier(expression) &&
			expression.getText() === enumName &&
			isImportedFromPackage(expression)
		) {
			access.replaceWithText(`"${propertyName}"`);
		}
	}

	migrateImport(file, enumName);
}

/**
 * Converts `import { enumName }` to `import type { enumName }` if enumName is still
 * used as a type annotation, or removes the import entirely if not needed.
 */
function migrateImport(file: SourceFile, enumName: string): void {
	const importDeclarations = file.getImportDeclarations();

	for (const importDecl of importDeclarations) {
		const moduleSpecifier = importDecl.getModuleSpecifierValue();

		// Only process imports from our package
		if (!moduleSpecifier.startsWith(packageName)) {
			continue;
		}

		const namedImports = importDecl.getNamedImports();
		const enumImport = namedImports.find(ni => ni.getName() === enumName);

		if (!enumImport) {
			continue;
		}

		// Check if <enumName> is used as a type annotation somewhere in the file
		const isUsedAsType = checkIfUsedAsType(file, enumName);

		if (isUsedAsType) {
			// Convert to type-only import if not already
			if (!enumImport.isTypeOnly() && !importDecl.isTypeOnly()) {
				enumImport.setIsTypeOnly(true);
			}
		} else {
			// Remove the import entirely
			enumImport.remove();

			// If no named imports left, remove the whole declaration
			if (importDecl.getNamedImports().length === 0) {
				importDecl.remove();
			}
		}
	}
}

/**
 * Checks if an identifier is used as a type annotation in the file
 */
function checkIfUsedAsType(file: SourceFile, identifierName: string): boolean {
	// Look for type references
	const typeRefs = file.getDescendantsOfKind(SyntaxKind.TypeReference);
	for (const ref of typeRefs) {
		if (ref.getText() === identifierName) {
			return true;
		}
	}

	return false;
}

export const enumToUnionRecipe: Recipe = {
	metadata: {
		id: "enumToUnion",
		description: "Migrates enum usage to union of string literals",
		supportedVersions: "^8.0.0"
	},

	execute(project): void {
		project.getSourceFiles().forEach(file => {
			replaceEnumAccesses(file, "InterpretationOfYear");
			replaceEnumAccesses(file, "DatePrecision");
		});
	}
};
