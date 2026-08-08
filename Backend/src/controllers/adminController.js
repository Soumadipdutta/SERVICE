const prisma = require("../config/prisma");

// GET /admin/dashboard/public  (public — no auth) — the "transparent
// dashboard of complaint status and resolution time" the problem
// statement explicitly asks for.
async function publicDashboard(req, res, next) {
  try {
    const [statusCounts, categoryCounts, resolved] = await Promise.all([
      prisma.grievance.groupBy({ by: ["status"], _count: true }),
      prisma.grievance.groupBy({ by: ["category"], _count: true }),
      prisma.grievance.findMany({
        where: { status: "RESOLVED", resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
    ]);

    const avgResolutionHours =
      resolved.length === 0
        ? null
        : resolved.reduce((sum, g) => sum + (new Date(g.resolvedAt) - new Date(g.createdAt)) / 36e5, 0) /
          resolved.length;

    res.json({
      success: true,
      message: "OK",
      data: {
        statusCounts,
        categoryCounts,
        totalResolved: resolved.length,
        avgResolutionHours: avgResolutionHours ? Math.round(avgResolutionHours * 10) / 10 : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /admin/dashboard/schemes  (admin) — scheme uptake analytics
async function schemeAnalytics(req, res, next) {
  try {
    const applicationsByStatus = await prisma.schemeApplication.groupBy({ by: ["status"], _count: true });

    const topSchemes = await prisma.welfareScheme.findMany({
      select: {
        id: true,
        title: true,
        code: true,
        _count: { select: { applications: true } },
      },
      orderBy: { applications: { _count: "desc" } },
      take: 10,
    });

    res.json({ success: true, message: "OK", data: { applicationsByStatus, topSchemes } });
  } catch (err) {
    next(err);
  }
}

// GET /admin/authorities  (admin) — used when assigning complaints
async function listAuthorities(req, res, next) {
  try {
    const authorities = await prisma.user.findMany({
      where: { role: { in: ["AUTHORITY", "ADMIN"] } },
      select: { id: true, name: true, email: true, role: true, district: true, state: true },
    });
    res.json({ success: true, message: "OK", data: authorities });
  } catch (err) {
    next(err);
  }
}

module.exports = { publicDashboard, schemeAnalytics, listAuthorities };