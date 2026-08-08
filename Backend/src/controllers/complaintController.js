/**
 * Anonymous-friendly grievance/complaint filing + transparent tracking.
 *
 * Triage (category/priority) below is a temporary inline keyword
 * heuristic — once you share your services/ folder, move it into
 * services/grievanceTriage.js and swap the `// AI HOOK` line for a
 * call to services/aiService.js.
 *
 * Assumes multer is applied at the route level as:
 *   router.post("/", optionalAuthenticate, upload.array("evidence", 5), ctrl.fileComplaint)
 * so `req.files` may be present here.
 */

const { z } = require("zod");
const prisma = require("../config/prisma");

const createComplaintSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20),
  category: z
    .enum(["HARASSMENT", "CORRUPTION", "INFRASTRUCTURE", "SAFETY", "CIVIC_ISSUE", "OTHER"])
    .optional(),
  isAnonymous: z.boolean().optional(),
  anonymousContact: z.string().max(120).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(250).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS", "ESCALATED", "RESOLVED", "REJECTED"]),
  note: z.string().max(500).optional(),
});

const CRITICAL_WORDS = ["assault", "violence", "life threat", "abuse", "weapon", "fire", "collapse"];
const HIGH_WORDS = ["harassment", "bribe", "corruption", "unsafe", "threat", "molest"];

// AI HOOK: swap for `await aiService.triageGrievance(description, lang)` later.
function keywordTriage(description, suggestedCategory) {
  const t = description.toLowerCase();
  let priority = "LOW";
  if (CRITICAL_WORDS.some((w) => t.includes(w))) priority = "CRITICAL";
  else if (HIGH_WORDS.some((w) => t.includes(w))) priority = "HIGH";
  else if (t.length > 200) priority = "MEDIUM";

  return { category: suggestedCategory || "OTHER", priority };
}

function generateTrackingId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0, I/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `GR-${code}`;
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads/complaints";

// POST /complaints  (optional auth — supports true anonymity)
async function fileComplaint(req, res, next) {
  try {
    const data = createComplaintSchema.parse({
      ...req.body,
      latitude: req.body.latitude !== undefined ? Number(req.body.latitude) : undefined,
      longitude: req.body.longitude !== undefined ? Number(req.body.longitude) : undefined,
      isAnonymous: req.body.isAnonymous === "true" || req.body.isAnonymous === true,
    });

    const { category, priority } = keywordTriage(data.description, data.category);

    let trackingId;
    for (let i = 0; i < 5; i++) {
      trackingId = generateTrackingId();
      const clash = await prisma.grievance.findUnique({ where: { trackingId } });
      if (!clash) break;
    }

    const complaint = await prisma.grievance.create({
      data: {
        trackingId,
        title: data.title,
        description: data.description,
        category,
        priority,
        isAnonymous: !!data.isAnonymous,
        reporterId: data.isAnonymous ? null : req.user?.id ?? null,
        anonymousContact: data.isAnonymous ? data.anonymousContact ?? null : null,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        statusLogs: {
          create: { status: "SUBMITTED", note: "Complaint filed", changedById: req.user?.id ?? null },
        },
      },
    });

    if (req.files?.length) {
      await prisma.grievanceEvidence.createMany({
        data: req.files.map((f) => ({
          grievanceId: complaint.id,
          fileUrl: `/${UPLOAD_DIR}/${f.filename}`,
          fileType: f.mimetype,
        })),
      });
    }

    res.status(201).json({
      success: true,
      message: "Complaint submitted",
      data: { trackingId: complaint.trackingId, id: complaint.id, category, priority },
    });
  } catch (err) {
    next(err);
  }
}

// GET /complaints/track/:trackingId  (public — this is "transparent redressal")
async function trackComplaint(req, res, next) {
  try {
    const complaint = await prisma.grievance.findUnique({
      where: { trackingId: req.params.trackingId },
      include: { statusLogs: { orderBy: { changedAt: "asc" } }, evidence: true },
    });
    if (!complaint) {
      return res.status(404).json({ success: false, message: "No complaint found with this tracking ID" });
    }

    // Never leak reporter identity on the public tracking endpoint,
    // even for non-anonymous complaints.
    const { reporterId, anonymousContact, ...publicView } = complaint;
    res.json({ success: true, message: "OK", data: publicView });
  } catch (err) {
    next(err);
  }
}

// GET /complaints/me  (protected)
async function myComplaints(req, res, next) {
  try {
    const complaints = await prisma.grievance.findMany({
      where: { reporterId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { statusLogs: true, evidence: true },
    });
    res.json({ success: true, message: "OK", data: complaints });
  } catch (err) {
    next(err);
  }
}

// GET /complaints  (admin/authority) — supports ?status&category&priority filters
async function listComplaints(req, res, next) {
  try {
    const { status, category, priority } = req.query;
    const complaints = await prisma.grievance.findMany({
      where: {
        ...(status && { status }),
        ...(category && { category }),
        ...(priority && { priority }),
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      include: { evidence: true, assignedAuthority: { select: { id: true, name: true } } },
    });
    res.json({ success: true, message: "OK", data: complaints });
  } catch (err) {
    next(err);
  }
}

// PATCH /complaints/:id/status  (admin/authority) — writes to the public timeline
async function updateComplaintStatus(req, res, next) {
  try {
    const { status, note } = updateStatusSchema.parse(req.body);

    const data = { status };
    if (status === "RESOLVED") data.resolvedAt = new Date();
    if (status === "ESCALATED") data.escalatedAt = new Date();

    const complaint = await prisma.grievance.update({
      where: { id: req.params.id },
      data: { ...data, statusLogs: { create: { status, note, changedById: req.user.id } } },
    });

    res.json({ success: true, message: "Status updated", data: complaint });
  } catch (err) {
    next(err);
  }
}

// PATCH /complaints/:id/assign  (admin)
async function assignAuthority(req, res, next) {
  try {
    const { authorityId } = req.body;
    const authority = await prisma.user.findUnique({ where: { id: authorityId } });
    if (!authority || !["AUTHORITY", "ADMIN"].includes(authority.role)) {
      return res.status(422).json({ success: false, message: "Target user is not an authority" });
    }

    const complaint = await prisma.grievance.update({
      where: { id: req.params.id },
      data: {
        assignedAuthorityId: authorityId,
        status: "ACKNOWLEDGED",
        statusLogs: {
          create: { status: "ACKNOWLEDGED", note: `Assigned to ${authority.name}`, changedById: req.user.id },
        },
      },
    });

    res.json({ success: true, message: "Complaint assigned", data: complaint });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  fileComplaint,
  trackComplaint,
  myComplaints,
  listComplaints,
  updateComplaintStatus,
  assignAuthority,
};