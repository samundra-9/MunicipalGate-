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

export async function submitResource(req, res, next) {
  try {
    const resourceId = Number(req.params.id);

    const resource = await resourceService.submitResource(
      req.user,
      resourceId
    );

    res.json(resource);
  } catch (error) {
    next(error);
  }
}


export async function publishResource(req, res, next) {
  try {
    const resourceId = Number(req.params.id);

    const resource = await resourceService.publishResource(
      req.user,
      resourceId
    );

    res.json(resource);
  } catch (error) {
    next(error);
  }
};

export async function listPublicResources(req, res, next) {
  try {
    const resources = await resourceService.listPublicResources(
      req.query
    );
    res.json(resources);
  } catch (error) {
    next(error);
  }
};

export async function createSlot(req, res, next) {
  try {
    const resourceId = Number(req.params.id);
    const { startTime, endTime } = req.body;

    const slot = await resourceService.createSlot(
      req.user,
      resourceId,
      startTime,
      endTime
    );

    res.status(201).json(slot);
  } catch (error) {
    next(error);
  }
};


export async function getResourceSlots(req, res, next) {
  try {
    const slots = await resourceService.getSlots(
      Number(req.params.id)
    );
    res.json(slots);
  } catch (e) {
    next(e);
  }
};
export async function listMyResources(req, res, next) {
  try {
    const resources = await resourceService.listMyResources(req.user);
    res.json(resources);
  } catch (error) {
    next(error);
  }
};
export async function updateResource(req, res, next) {
  try {
    const resourceId = Number(req.params.id);
    const updated = await resourceService.updateDraftResource(
      req.user,
      resourceId,
      req.body
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export async function addResourceMedia(req, res, next) {
  try {
    const resourceId = Number(req.params.id);

    const media = await resourceService.addMedia(
      req.user,
      resourceId,
      req.body
    );

    res.status(201).json(media);
  } catch (err) {
    next(err);
  }
}

export async function removeResourceMedia(req, res, next) {
  try {
    await resourceService.removeMedia(
      req.user,
      Number(req.params.mediaId)
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}


