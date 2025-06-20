const express = require("express");
const router = express.Router();

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const credentials = require("./credentials.json");

// 🔐 Initialize Firebase only once
initializeApp({
    credential: cert(credentials),
});

const db = getFirestore();

router.get("/update-unread-messages", async (req, res) => {
    try {
        const usersRef = db.collection("users");
        const usersSnap = await usersRef.get();

        for (const userDoc of usersSnap.docs) {
            const userId = userDoc.id;
            const data = userDoc.data();
            const lastOpenedProjects = data.lastOpenedProjects;

            if (!lastOpenedProjects || typeof lastOpenedProjects !== "object") continue;

            let totalUnread = 0;

            for (const [projectId, lastOpened] of Object.entries(lastOpenedProjects)) {
                if (!(lastOpened instanceof Timestamp)) continue;

                const messagesSnap = await db
                    .collection("messages")
                    .where("projectId", "==", projectId)
                    .where("timestamp", ">", lastOpened)
                    .get();

                totalUnread += messagesSnap.size;
            }

            await usersRef.doc(userId).update({
                totalUnreadMessages: totalUnread,
            });

            console.log(`✅ Updated user ${userId} → ${totalUnread} unread messages`);
        }

        res.json({ status: "success", message: "All users updated." });
    } catch (error) {
        console.error("❌ Error updating unread messages:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
