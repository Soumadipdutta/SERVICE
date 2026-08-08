
import prisma from "../config/prisma.js";

/**
 * Compare an actual profile value against a rule.
 */
const compareValues = (actual, operator, expected) => {
    switch (operator) {
        case "==":
            return actual == expected;

        case "!=":
            return actual != expected;

        case ">":
            return actual > expected;

        case ">=":
            return actual >= expected;

        case "<":
            return actual < expected;

        case "<=":
            return actual <= expected;

        case "IN":
            return String(expected)
                .split(",")
                .map((value) => value.trim().toLowerCase())
                .includes(String(actual).trim().toLowerCase());

        case "NOT_IN":
            return !String(expected)
                .split(",")
                .map((value) => value.trim().toLowerCase())
                .includes(String(actual).trim().toLowerCase());

        default:
            throw new Error(
                `Unsupported operator: ${operator}`
            );
    }
};


/**
 * Evaluate a single eligibility rule against
 * the citizen's profile.
 */
const evaluateRule = (profile, rule) => {
    const actualValue = profile[rule.field];

    // Profile information is missing
    if (
        actualValue === null ||
        actualValue === undefined
    ) {
        return {
            ruleId: rule.id,
            field: rule.field,
            operator: rule.operator,
            expected: rule.value,
            actual: null,
            passed: false,
            reason: `${rule.field} information is missing`,
            mandatory: rule.mandatory,
        };
    }

    let expectedValue = rule.value;

    // Convert database string to number
    if (typeof actualValue === "number") {
        expectedValue = Number(rule.value);

        if (Number.isNaN(expectedValue)) {
            return {
                ruleId: rule.id,
                field: rule.field,
                operator: rule.operator,
                expected: rule.value,
                actual: actualValue,
                passed: false,
                reason: `Invalid numeric rule value for ${rule.field}`,
                mandatory: rule.mandatory,
            };
        }
    }

    // Convert database string to boolean
    if (typeof actualValue === "boolean") {
        expectedValue =
            String(rule.value).toLowerCase() === "true";
    }

    const passed = compareValues(
        actualValue,
        rule.operator,
        expectedValue
    );

    return {
        ruleId: rule.id,
        field: rule.field,
        operator: rule.operator,
        expected: expectedValue,
        actual: actualValue,
        passed,
        mandatory: rule.mandatory,
        reason: passed
            ? `${rule.field} requirement satisfied`
            : `${rule.field} requirement not satisfied`,
    };
};


/**
 * Check whether a citizen is eligible for
 * one specific scheme.
 */
export const checkSchemeEligibility = async (
    userId,
    schemeId
) => {
    const profile = await prisma.citizenProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!profile) {
        const error = new Error(
            "Citizen profile not found. Please complete your profile first."
        );

        error.statusCode = 404;
        throw error;
    }

    const scheme = await prisma.scheme.findUnique({
        where: {
            id: schemeId,
        },
        include: {
            rules: true,
            documents: true,
        },
    });

    if (!scheme) {
        const error = new Error("Scheme not found");

        error.statusCode = 404;
        throw error;
    }

    if (!scheme.isActive) {
        const error = new Error(
            "This scheme is currently inactive"
        );

        error.statusCode = 400;
        throw error;
    }

    const results = scheme.rules.map((rule) =>
        evaluateRule(profile, rule)
    );

    const failedMandatoryRules = results.filter(
        (result) =>
            result.mandatory && !result.passed
    );

    const eligible =
        failedMandatoryRules.length === 0;

    return {
        eligible,

        scheme: {
            id: scheme.id,
            name: scheme.name,
            category: scheme.category,
            state: scheme.state,
        },

        summary: eligible
            ? "You appear to be eligible for this scheme."
            : "You do not currently meet all mandatory eligibility criteria.",

        rules: results,
        documents: eligible
            ? scheme.documents.map((document) => ({
                id: document.id,
                name: document.name,
                description: document.description,
                mandatory: document.mandatory,
            }))
            : [],
        passedRules: results.filter(
            (result) => result.passed
        ),

        failedRules: results.filter(
            (result) => !result.passed
        ),

        missingInformation: results.filter(
            (result) =>
                result.actual === null ||
                result.actual === undefined
        ),
    };
};


/**
 * Find every active scheme and determine
 * whether the citizen is eligible.
 */
export const findEligibleSchemes = async (userId) => {
    const profile = await prisma.citizenProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!profile) {
        const error = new Error(
            "Citizen profile not found. Please complete your profile first."
        );

        error.statusCode = 404;
        throw error;
    }

    const schemes = await prisma.scheme.findMany({
        where: {
            isActive: true,
        },
        include: {
            rules: true,
            documents: true,
        },
    });

    const results = schemes.map((scheme) => {
        const ruleResults = scheme.rules.map((rule) =>
            evaluateRule(profile, rule)
        );

        const failedMandatoryRules =
            ruleResults.filter(
                (result) =>
                    result.mandatory &&
                    !result.passed
            );

        const eligible =
            failedMandatoryRules.length === 0;

        return {
            scheme: {
                id: scheme.id,
                name: scheme.name,
                category: scheme.category,
                state: scheme.state,
                description: scheme.description,
                benefits: scheme.benefits,
                applicationUrl: scheme.applicationUrl,
            },

            eligible,
            documents: eligible
                ? scheme.documents.map((document) => ({
                    id: document.id,
                    name: document.name,
                    description: document.description,
                    mandatory: document.mandatory,
                }))
                : [],
            passedRules: ruleResults.filter(
                (result) => result.passed
            ),

            failedRules: ruleResults.filter(
                (result) => !result.passed
            ),

            missingInformation: ruleResults.filter(
                (result) =>
                    result.actual === null ||
                    result.actual === undefined
            ),
        };
    });

    return {
        totalSchemes: results.length,

        eligibleCount: results.filter(
            (result) => result.eligible
        ).length,

        ineligibleCount: results.filter(
            (result) => !result.eligible
        ).length,

        eligibleSchemes: results.filter(
            (result) => result.eligible
        ),

        allResults: results,
    };
};

