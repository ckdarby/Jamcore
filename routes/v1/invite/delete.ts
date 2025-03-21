import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import db from "@helper/db";
import authUser from "@middleware/authUser";
import getUser from "@middleware/getUser";

const router = Router();

/**
 * Route to delete an invite
 */
router.delete(
  "/",
  rateLimit(),

  authUser,
  getUser,

  async (req, res) => {
    const { accept, inviteId } = req.body;

    const invite = await db.teamInvite.findUnique({
      where: {
        id: inviteId,
      },
    });

    if (!invite) {
      res.status(401).send({ message: "Invalid invite" });
      return;
    }

    await db.teamInvite.delete({
      where: {
        id: inviteId,
      },
    });

    if (accept) {
      await db.team.update({
        where: { id: invite.teamId },
        data: {
          users: {
            connect: {
              id: res.locals.user.id,
            },
          },
        },
      });
    }

    res.send({ message: "Invite accepted" });
  }
);

export default router;
