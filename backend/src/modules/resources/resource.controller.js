import { resourceService } from "./resource.service.js";

export async function createResource(req, res, next) {
  try {
    const resource = await resourceService.createResource(
      req.user,
      req.body
    );

    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
}
