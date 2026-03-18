import { auditService } from "./audit.service.js";

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await auditService.getLogs(req.user);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}
