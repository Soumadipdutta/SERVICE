import { z } from "zod";
import prisma from "../config/prisma.js";

const createReportSchema = z.object({
    description: z.string().min(20),
    category: z.string().optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    mediaUrl: z.string().optional(),
    region: z.string().optional(),
});

const updateStatusSchema = z.object({
    status: z.enum(["reported", "review", "escalated", "resolved"]),
    note: z.string().max(500).optional(),
});

function formatReport(report) {
    return {
        id: String(report.id),
        description: report.description,
        lat: report.latitude,
        lng: report.longitude,
        category: report.category,
        status: report.status,
        mediaUrl: report.evidence?.[0]?.fileUrl || null,
        createdAt: report.createdAt,
        region: report.address || report.region || "Unspecified",
    };
}

export async function createReport(req, res, next) {
    try {
        const payload = createReportSchema.parse(req.body);

        const report = await prisma.complaint.create({
            data: {
                title: payload.description.slice(0, 140),
                description: payload.description,
                category: payload.category || "Other",
                priority: "LOW",
                status: "reported",
                latitude: payload.lat,
                longitude: payload.lng,
                address: payload.region || null,
                anonymous: true,
                evidence: payload.mediaUrl
                    ? {
                          create: [{ fileUrl: payload.mediaUrl, fileType: "unknown" }],
                      }
                    : undefined,
            },
            include: { evidence: true },
        });

        res.status(201).json(formatReport(report));
    } catch (err) {
        next(err);
    }
}

export async function listReports(req, res, next) {
    try {
        const reports = await prisma.complaint.findMany({
            orderBy: { createdAt: "desc" },
            include: { evidence: true },
        });
        res.json(reports.map(formatReport));
    } catch (err) {
        next(err);
    }
}

export async function getReport(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ success: false, message: "Invalid report ID" });
        }

        const report = await prisma.complaint.findUnique({
            where: { id },
            include: { evidence: true },
        });

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        res.json(formatReport(report));
    } catch (err) {
        next(err);
    }
}

export async function updateReportStatus(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ success: false, message: "Invalid report ID" });
        }

        const payload = updateStatusSchema.parse(req.body);

        const updated = await prisma.complaint.update({
            where: { id },
            data: {
                status: payload.status,
                statusHistory: {
                    create: {
                        status: payload.status,
                        note: payload.note || null,
                    },
                },
            },
            include: { evidence: true },
        });

        res.json(formatReport(updated));
    } catch (err) {
        next(err);
    }
}
