const axios = require("axios");
const Match = require("../models/matches");
const Item = require("../models/items");

const triggerAIMatching = async (newItem) => {
  try {
    const aiServiceURL = process.env.AI_SERVICE_URL || "http://localhost:5000";

    const oppositeType = newItem.type === "lost" ? "found" : "lost";
    const candidates = await Item.find({ 
      type: oppositeType, 
      status: { $in: ["reported", "matched"] } 
    });

    if (candidates.length === 0) {
      console.log("No matching candidates available for AI comparison.");
      return;
    }

    const payload = {
      target_item: {
        id: newItem._id.toString(),
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        images: newItem.images || [],
        location: newItem.locationLost,
        date: newItem.dateLost,
      },
      candidate_items: candidates.map(c => ({
        id: c._id.toString(),
        title: c.title,
        description: c.description,
        category: c.category,
        images: c.images || [],
        location: c.locationLost,
        date: c.dateLost,
      })),
    };

    console.log(`Sending matching request to AI service: ${aiServiceURL}/match`);
    const response = await axios.post(`${aiServiceURL}/match`, payload, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        "User-Agent": "LostAndFoundServer"
      }
    });

    if (response.data && response.data.status && response.data.matches) {
      const matches = response.data.matches;
      console.log(`AI matching computed ${matches.length} scores.`);
      
      // Save top matches with score >= 0.80 (allowing matches with high similarity to be stored)
      for (const m of matches) {
        if (m.score >= 0.80) {
          const lostId = newItem.type === "lost" ? newItem._id : m.candidate_id;
          const foundId = newItem.type === "lost" ? m.candidate_id : newItem._id;

          const existingMatch = await Match.findOne({ lostItemId: lostId, foundItemId: foundId });
          if (!existingMatch) {
            const matchEntry = new Match({
              lostItemId: lostId,
              foundItemId: foundId,
              similarityScore: m.score,
              status: "pending"
            });
            await matchEntry.save();
            console.log(`Saved new match suggestion: Lost ${lostId} <-> Found ${foundId} (Score: ${m.score})`);

            await Item.updateMany(
              { _id: { $in: [lostId, foundId] }, status: "reported" },
              { status: "matched" }
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error running AI matching background trigger:", error.message);
  }
};

module.exports = {
  triggerAIMatching,
};
