/**
 * Pure scheme CRUD + discovery. Matching/applying logic lives in
 * eligibilityController.js to keep this file focused.
 */

const { z } = require("zod");
const prisma = require("../config/prisma");

const criteriaSchema = z.object({
  minIncome: z.number().optional(),
  maxIncome: z.number().optional(),
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  genders: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  occupations: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
});

const createSchemeSchema = z.object({
  code: z.string().min(2).max(30),
  title: z.string().min(3).max(150),
  description: z.string().min(10),
  department: z.string().optional(),
  benefits: z.string().min(3),
  eligibilityCriteria: criteriaSchema,
  documentsRequired: z.string().optional(),
  applicationLink: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

const updateSchemeSchema = createSchemeSchema.partial();

// GET /schemes  (public)
async function listSchemes(req, res, next) {
  try {
    const schemes = await prisma.welfareScheme.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, message: "OK", data: schemes });
  } catch (err) {
    next(err);
  }
}

// GET /schemes/:id  (public)
async function getScheme(req, res, next) {
  try {
    const scheme = await prisma.welfareScheme.findUnique({ where: { id: req.params.id } });
    if (!scheme) return res.status(404).json({ success: false, message: "Scheme not found" });
    res.json({ success: true, message: "OK", data: scheme });
  } catch (err) {
    next(err);
  }
}

// POST /schemes  (admin/authority)
async function createScheme(req, res, next) {
  try {
    const data = createSchemeSchema.parse(req.body);
    const scheme = await prisma.welfareScheme.create({
      data: { ...data, eligibilityCriteria: JSON.stringify(data.eligibilityCriteria) },
    });
    res.status(201).json({ success: true, message: "Scheme created", data: scheme });
  } catch (err) {
    next(err);
  }
}

// PATCH /schemes/:id  (admin/authority)
async function updateScheme(req, res, next) {
  try {
    const data = updateSchemeSchema.parse(req.body);
    const payload = { ...data };
    if (data.eligibilityCriteria) payload.eligibilityCriteria = JSON.stringify(data.eligibilityCriteria);

    const scheme = await prisma.welfareScheme.update({ where: { id: req.params.id }, data: payload });
    res.json({ success: true, message: "Scheme updated", data: scheme });
  } catch (err) {
    next(err);
  }
}

// DELETE /schemes/:id  (admin) — soft delete, keeps application history intact
async function deleteScheme(req, res, next) {
  try {
    await prisma.welfareScheme.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: "Scheme deactivated", data: null });
  } catch (err) {
    next(err);
  }
}

module.exports = { listSchemes, getScheme, createScheme, updateScheme, deleteScheme };