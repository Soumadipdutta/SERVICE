
import "dotenv/config";
import prisma from "../src/config/prisma.js";

const main = async () => {
    console.log("🌱 Seeding schemes...");

    // Clear existing scheme data
    await prisma.schemeRule.deleteMany();
    await prisma.scheme.deleteMany();

    // ==========================================
    // 1. STUDENT SCHOLARSHIP
    // ==========================================

    await prisma.scheme.create({
        data: {
            externalId: "WB-STUDENT-001",
            name: "West Bengal Student Scholarship",
            category: "Education",
            state: "West Bengal",
            description:
                "Financial assistance for eligible students from West Bengal.",
            benefits:
                "Financial support for education expenses.",
            applicationUrl:
                "https://example.com/student-scholarship",
            source: "Government Scheme",

            rules: {
                create: [
                    {
                        field: "age",
                        operator: "<=",
                        value: "25",
                        mandatory: true,
                    },
                    {
                        field: "studentStatus",
                        operator: "==",
                        value: "true",
                        mandatory: true,
                    },
                    {
                        field: "annualIncome",
                        operator: "<=",
                        value: "300000",
                        mandatory: true,
                    },
                    {
                        field: "state",
                        operator: "==",
                        value: "West Bengal",
                        mandatory: true,
                    },
                    {
                        field: "category",
                        operator: "IN",
                        value: "SC,ST,OBC",
                        mandatory: true,
                    },
                    {
                        field: "state",
                        operator: "NOT_IN",
                        value: "Delhi,Maharashtra",
                        mandatory: true,
                    },
                ],
            },
            documents: {
                create: [
                    {
                        name: "Aadhaar Card",
                        description: "Valid government identity proof",
                        mandatory: true,
                    },
                    {
                        name: "Income Certificate",
                        description: "Latest annual income certificate",
                        mandatory: true,
                    },
                    {
                        name: "Student ID Card",
                        description: "Valid student identification",
                        mandatory: true,
                    },
                    {
                        name: "Bank Account Passbook",
                        description: "Bank account details for scholarship transfer",
                        mandatory: true,
                    },
                ],
            },
        },
    });

    // ==========================================
    // 2. SENIOR CITIZEN ASSISTANCE
    // ==========================================

    await prisma.scheme.create({
        data: {
            externalId: "WB-SENIOR-001",
            name: "Senior Citizen Assistance Scheme",
            category: "Social Security",
            state: "West Bengal",
            description:
                "Financial assistance for eligible senior citizens.",
            benefits:
                "Monthly financial support for eligible senior citizens.",
            applicationUrl:
                "https://example.com/senior-citizen",
            source: "Government Scheme",

            rules: {
                create: [
                    {
                        field: "age",
                        operator: ">=",
                        value: "60",
                        mandatory: true,
                    },
                    {
                        field: "state",
                        operator: "==",
                        value: "West Bengal",
                        mandatory: true,
                    },
                ],
            },
            documents: {
                create: [
                {
                    name: "Aadhaar Card",
                    description: "Valid government identity proof",
                    mandatory: true,
                },
                {
                    name: "Age Proof",
                    description: "Document confirming age",
                    mandatory: true,
                },
                {
                    name: "Income Certificate",
                    description: "Latest income certificate",
                    mandatory: true,
                },
                {
                    name: "Bank Account Passbook",
                    description: "Bank account details",
                    mandatory: true,
                },
            ],
        },
    }
    });

    // ==========================================
    // 3. DISABILITY ASSISTANCE
    // ==========================================

    await prisma.scheme.create({
        data: {
            externalId: "WB-DISABILITY-001",
            name: "Disability Assistance Scheme",
            category: "Social Security",
            state: "West Bengal",
            description:
                "Financial support for citizens with disabilities.",
            benefits:
                "Financial assistance and welfare support.",
            applicationUrl:
                "https://example.com/disability",
            source: "Government Scheme",

            rules: {
                create: [
                    {
                        field: "disabilityStatus",
                        operator: "==",
                        value: "true",
                        mandatory: true,
                    },
                    {
                        field: "annualIncome",
                        operator: "<=",
                        value: "500000",
                        mandatory: true,
                    },
                    {
                        field: "state",
                        operator: "==",
                        value: "West Bengal",
                        mandatory: true,
                    },
                ],
            },
            documents: {
                create: [
                {
                    name: "Aadhaar Card",
                    description: "Valid government identity proof",
                    mandatory: true,
                },
                {
                    name: "Disability Certificate",
                    description: "Valid disability certificate",
                    mandatory: true,
                },
                {
                    name: "Income Certificate",
                    description: "Latest income certificate",
                    mandatory: true,
                },
                {
                    name: "Bank Account Passbook",
                    description: "Bank account details",
                    mandatory: true,
                },
            ],
        },
    }
    });

    // ==========================================
    // 4. LOW INCOME HOUSING
    // ==========================================

    await prisma.scheme.create({
        data: {
            externalId: "WB-HOUSING-001",
            name: "Low Income Housing Assistance",
            category: "Housing",
            state: "West Bengal",
            description:
                "Housing assistance for low-income families.",
            benefits:
                "Financial assistance for housing.",
            applicationUrl:
                "https://example.com/housing",
            source: "Government Scheme",

            rules: {
                create: [
                    {
                        field: "annualIncome",
                        operator: "<=",
                        value: "250000",
                        mandatory: true,
                    },
                    {
                        field: "familySize",
                        operator: ">=",
                        value: "4",
                        mandatory: true,
                    },
                    {
                        field: "state",
                        operator: "==",
                        value: "West Bengal",
                        mandatory: true,
                    },
                ],
            },
            documents: {
                create: [
                    {
                        name: "Aadhaar Card",
                        description: "Valid government identity proof",
                        mandatory: true,
                    },
                    {
                        name: "Income Certificate",
                        description: "Latest annual income certificate",
                        mandatory: true,
                    },
                    {
                        name: "Residence Certificate",
                        description: "Proof of residence in West Bengal",
                        mandatory: true,
                    },
                    {
                        name: "Family Certificate",
                        description: "Proof of family members",
                        mandatory: true,
                    }
                ],
            },
        },
    });

    // ==========================================
    // 5. WOMEN EDUCATION SCHEME
    // ==========================================

    await prisma.scheme.create({
        data: {
            externalId: "WB-WOMEN-EDU-001",
            name: "Women Education Support Scheme",
            category: "Education",
            state: "West Bengal",
            description:
                "Educational assistance for eligible women students.",
            benefits:
                "Financial support for higher education.",
            applicationUrl:
                "https://example.com/women-education",
            source: "Government Scheme",

            rules: {
                create: [
                    {
                        field: "gender",
                        operator: "==",
                        value: "Female",
                        mandatory: true,
                    },
                    {
                        field: "studentStatus",
                        operator: "==",
                        value: "true",
                        mandatory: true,
                    },
                    {
                        field: "age",
                        operator: "<=",
                        value: "30",
                        mandatory: true,
                    },
                ],
            },
            documents: {
                create: [
                    {
                        name: "Aadhaar Card",
                        description: "Valid government identity proof",
                        mandatory: true,
                    },
                    {
                        name: "Student ID Card",
                        description: "Valid student identification",
                        mandatory: true,
                    },
                    {
                        name: "Income Certificate",
                        description: "Latest income certificate",
                        mandatory: true,
                    },
                    {
                        name: "Bank Account Passbook",
                        description: "Bank account details",
                        mandatory: true,
                    }
                ],
            },
        },
    });

    console.log("✅ Created 5 schemes");
    console.log("🎉 Scheme seeding completed!");
};

main()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

