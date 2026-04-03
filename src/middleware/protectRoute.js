import { requireAuth, clerkClient } from '@clerk/express';
import User from '../models/User.js';

export const protectRoute = [
    requireAuth(),
    async (req, res, next) => {
        try {
            const auth = req.auth();
            const clerkId = auth.userId;

            let user = await User.findOne({ clerkId });

            if (!user) {
                const clerkUser = await clerkClient.users.getUser(clerkId);

                const email = clerkUser.emailAddresses[0].emailAddress;

                // 🔥 Check if email already exists
                user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        clerkId,
                        email,
                        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`,
                        profileImage: clerkUser.imageUrl,
                    });
                } else {
                    // 🔥 If user exists by email, attach clerkId
                    user.clerkId = clerkId;
                    await user.save();
                }
            }

            req.user = user;
            next();

        } catch (error) {
            console.error("Error in protectRoute middleware", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },
];