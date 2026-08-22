import express from "express";

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl ?? null,
    photo_url: user.photoUrl ?? null,
    language: user.language ?? "en",
    createdAt: user.createdAt,
  };
}

export function createUsersRouter(prisma) {
  const router = express.Router();

  router.get("/me", async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      return res.json({ user: publicUser(user) });
    } catch (error) {
      console.error("GET /users/me", error);
      return res
        .status(500)
        .json({ error: "Something went wrong. Please try again." });
    }
  });

  router.put("/me", async (req, res) => {
    try {
      const { name, photo_url, photoUrl, language } = req.body ?? {};

      const data = {};

      if (name !== undefined) {
        if (!String(name).trim()) {
          return res.status(400).json({ error: "Name cannot be empty." });
        }
        data.name = String(name).trim();
      }

      const inputPhoto = photo_url !== undefined ? photo_url : photoUrl;
      if (inputPhoto !== undefined) {
        data.photoUrl =
          inputPhoto == null || String(inputPhoto).trim() === ""
            ? null
            : String(inputPhoto).trim();
      }

      if (language !== undefined) {
        if (!String(language).trim()) {
          return res.status(400).json({ error: "Language cannot be empty." });
        }
        data.language = String(language).trim().toLowerCase();
      }

      if (Object.keys(data).length === 0) {
        return res
          .status(400)
          .json({ error: "No valid fields provided to update." });
      }

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data,
      });

      return res.json({ user: publicUser(updated) });
    } catch (error) {
      console.error("PUT /users/me", error);
      return res
        .status(500)
        .json({ error: "Something went wrong. Please try again." });
    }
  });

  router.delete("/me", async (req, res) => {
    try {
      const existing = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!existing) {
        return res.status(404).json({ error: "User not found." });
      }

      await prisma.user.delete({
        where: { id: req.user.id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("DELETE /users/me", error);
      return res
        .status(500)
        .json({ error: "Something went wrong. Please try again." });
    }
  });

  return router;
}
