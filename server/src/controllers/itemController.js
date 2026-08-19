const Item = require("../models/items");
const User = require("../models/users");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const { apiResponse } = require("../helpers");
const { triggerAIMatching } = require("../helpers/aiMatcher");

// Helper to stream upload files with automatic background removal
const uploadItemImages = async (files) => {
  const urls = [];
  if (!files || files.length === 0) return urls;
  for (const file of files) {
    const url = await uploadToCloudinary(file.buffer, file.originalname, "Items", true);
    urls.push(url);
  }
  return urls;
};

const reportLostItem = async (req, res, next) => {
  try {
    const { title, category, description, locationLost, dateLost, contactInfo } = req.body;
    
    // Auth token info is stored in req.decoded
    const reportedBy = req.decoded && req.decoded.id;

    if (!reportedBy) {
      return apiResponse(res, 401, false, "Unauthorized! User session not found.");
    }

    if (!title || !category || !description || !locationLost || !dateLost) {
      return apiResponse(res, 400, false, "All required fields (title, category, description, location, date) must be filled!");
    }

    // req.files is populated by multer array middleware
    const files = req.files || [];
    let images = await uploadItemImages(files);
    if (images.length === 0 && req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const item = new Item({
      title,
      category,
      description,
      locationLost,
      dateLost: new Date(dateLost),
      contactInfo,
      images,
      reportedBy,
      type: "lost",
      status: "reported",
    });

    await item.save();
    triggerAIMatching(item).catch(err => console.error("AI Match trigger error:", err));

    return apiResponse(res, 201, true, "Item reported successfully!", item);
  } catch (error) {
    next(error);
  }
};

const getMyStats = async (req, res, next) => {
  try {
    const userId = req.decoded && req.decoded.id;
    if (!userId) {
      return apiResponse(res, 401, false, "Unauthorized!");
    }

    const lostCount = await Item.countDocuments({ reportedBy: userId, type: "lost" });
    const matchCount = await Item.countDocuments({ reportedBy: userId, type: "lost", status: "matched" });
    const resolvedCount = await Item.countDocuments({ reportedBy: userId, type: "lost", status: "resolved" });

    const total = lostCount + resolvedCount;
    const successRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

    return apiResponse(res, 200, true, "Stats fetched successfully!", {
      lostCount,
      matchCount,
      notificationsCount: 0,
      resolvedCount,
      successRate,
    });
  } catch (error) {
    next(error);
  }
};

const getMyItems = async (req, res, next) => {
  try {
    const userId = req.decoded && req.decoded.id;
    if (!userId) {
      return apiResponse(res, 401, false, "Unauthorized!");
    }

    const items = await Item.find({ reportedBy: userId }).sort({ createdAt: -1 });
    return apiResponse(res, 200, true, "Items fetched successfully!", items);
  } catch (error) {
    next(error);
  }
};

const reportFoundItem = async (req, res, next) => {
  try {
    const { title, category, description, locationFound, dateFound, contactInfo } = req.body;
    const reportedBy = req.decoded && req.decoded.id;

    if (!reportedBy) {
      return apiResponse(res, 401, false, "Unauthorized! User session not found.");
    }

    if (!title || !category || !description || !locationFound || !dateFound) {
      return apiResponse(res, 400, false, "All required fields (title, category, description, location, date) must be filled!");
    }

    const files = req.files || [];
    let images = await uploadItemImages(files);
    if (images.length === 0 && req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const item = new Item({
      title,
      category,
      description,
      locationLost: locationFound,
      dateLost: new Date(dateFound),
      contactInfo,
      images,
      reportedBy,
      type: "found",
      status: "reported",
    });

    await item.save();
    triggerAIMatching(item).catch(err => console.error("AI Match trigger error:", err));

    return apiResponse(res, 201, true, "Found item reported successfully!", item);
  } catch (error) {
    next(error);
  }
};

const getAllItems = async (req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    return apiResponse(res, 200, true, "All items fetched successfully!", items);
  } catch (error) {
    next(error);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const Match = require("../models/matches");
    const totalLostItems = await Item.countDocuments({ type: "lost" });
    const totalFoundItems = await Item.countDocuments({ type: "found" });
    const totalItemsInDb = await Item.countDocuments({});
    const totalItems = totalItemsInDb > 0 ? totalItemsInDb : (totalLostItems + totalFoundItems);

    const totalMatches = await Item.countDocuments({ status: "matched" });
    const matchCollPending = await Match.countDocuments({ status: { $in: ["pending", "claimed"] } });
    const pendingMatches = Math.max(totalMatches, matchCollPending);

    const itemsRecovered = await Item.countDocuments({ status: "resolved" });
    const matchCollVerified = await Match.countDocuments({ status: "verified" });
    const verifiedItems = Math.max(itemsRecovered, matchCollVerified);

    const activeUsers = await User.countDocuments();

    const successRate = totalItems > 0 ? Math.round((verifiedItems / totalItems) * 100) : 0;

    // Aggregate monthly trends for the past 6 months using real database records
    const monthlyData = [];
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = monthNames[d.getMonth()];
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const lostCount = await Item.countDocuments({ type: "lost", createdAt: { $gte: startOfMonth, $lte: endOfMonth } });
      const foundCount = await Item.countDocuments({ type: "found", createdAt: { $gte: startOfMonth, $lte: endOfMonth } });
      const matchesCount = await Item.countDocuments({ status: "matched", updatedAt: { $gte: startOfMonth, $lte: endOfMonth } });
      const recoveredCount = await Item.countDocuments({ status: "resolved", updatedAt: { $gte: startOfMonth, $lte: endOfMonth } });

      const monthTotal = lostCount + foundCount;
      // Real rate aligned with real MongoDB documents
      const rate = monthTotal > 0 
        ? Math.round((recoveredCount / monthTotal) * 100) 
        : (i === 0 ? successRate : 0);

      monthlyData.push({
        month: mLabel,
        lost: lostCount,
        found: foundCount,
        matches: matchesCount,
        recovered: recoveredCount,
        rate,
      });
    }

    // Aggregate category breakdown
    const categoryAgg = await Item.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const categoryData = categoryAgg.map(c => ({
      category: c._id || 'Others',
      count: c.count
    }));

    // Fetch the 5 most recent users and 5 most recent items to synthesize logs
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
    const recentItems = await Item.find({}).sort({ updatedAt: -1 }).limit(5);

    const logs = [];

    recentUsers.forEach(user => {
      logs.push({
        id: `user-${user._id}-${user.createdAt.getTime()}`,
        action: 'User registered',
        details: `${user.fullName || user.name} signed up`,
        time: user.createdAt.toISOString(),
        type: 'info'
      });
    });

    recentItems.forEach(item => {
      let action = item.type === 'lost' ? 'Lost Item reported' : 'Found Item reported';
      let details = `'${item.title}' reported in ${item.locationLost}`;
      let logType = 'info';

      if (item.status === 'resolved') {
        action = 'Handover Completed';
        details = `'${item.title}' successfully recovered`;
        logType = 'success';
      } else if (item.status === 'matched') {
        action = 'AI Match identified';
        details = `'${item.title}' matched automatically`;
        logType = 'success';
      }

      logs.push({
        id: `item-${item._id}-${item.updatedAt.getTime()}`,
        action,
        details,
        time: item.updatedAt.toISOString(),
        type: logType
      });
    });

    // Sort combined logs by time descending and take top 5
    const recentLogs = logs
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    return apiResponse(res, 200, true, "Admin stats fetched successfully!", {
      totalItems,
      totalLostItems,
      totalFoundItems,
      totalMatches,
      pendingMatches,
      itemsRecovered: verifiedItems,
      verifiedItems,
      activeUsers,
      successRate,
      monthlyData,
      categoryData,
      recentLogs,
    });
  } catch (error) {
    next(error);
  }
};

const getMatches = async (req, res, next) => {
  try {
    const Match = require("../models/matches");
    const userId = req.decoded && req.decoded.id;
    const role = req.decoded && req.decoded.role;

    let matches = await Match.find({})
      .populate({
        path: "lostItemId",
        populate: { path: "reportedBy", select: "name fullName email phone contactInfo studentId" }
      })
      .populate({
        path: "foundItemId",
        populate: { path: "reportedBy", select: "name fullName email phone contactInfo studentId" }
      })
      .populate({
        path: "claimedBy",
        select: "name fullName email phone contactInfo"
      })
      .sort({ createdAt: -1 });

    if (role !== "admin") {
      // Filter matches to only include the student's items
      matches = matches.filter(m => {
        const getReportedById = (item) => {
          if (!item || !item.reportedBy) return null;
          return item.reportedBy._id ? item.reportedBy._id.toString() : item.reportedBy.toString();
        };
        const lostReportedBy = getReportedById(m.lostItemId);
        const foundReportedBy = getReportedById(m.foundItemId);
        return lostReportedBy === userId || foundReportedBy === userId;
      });
    }

    return apiResponse(res, 200, true, "Matches retrieved successfully", { matches });
  } catch (error) {
    next(error);
  }
};

const approveMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Match = require("../models/matches");
    const { sendHandoverSuccessNotification } = require("../helpers/emailService");
    
    const match = await Match.findById(id).populate("lostItemId foundItemId");
    if (!match) {
      return apiResponse(res, 404, false, "Match not found!");
    }

    match.status = "verified";
    await match.save();

    const lostId = match.lostItemId?._id || match.lostItemId;
    const foundId = match.foundItemId?._id || match.foundItemId;

    await Item.updateMany(
      { _id: { $in: [lostId, foundId] } },
      { status: "resolved" }
    );

    // Trigger handover success email notifications
    try {
      const lostOwnerId = typeof match.lostItemId?.reportedBy === 'object' ? match.lostItemId?.reportedBy?._id : match.lostItemId?.reportedBy;
      const foundOwnerId = typeof match.foundItemId?.reportedBy === 'object' ? match.foundItemId?.reportedBy?._id : match.foundItemId?.reportedBy;

      const lostOwner = lostOwnerId ? await User.findById(lostOwnerId) : null;
      const foundOwner = foundOwnerId ? await User.findById(foundOwnerId) : null;

      const lostTitle = match.lostItemId?.title || "Lost Item";
      const foundTitle = match.foundItemId?.title || "Found Item";

      if (lostOwner && lostOwner.email) {
        sendHandoverSuccessNotification(lostOwner.email, lostOwner.name || "User", lostTitle, foundTitle)
          .catch(err => console.error("Handover email error (lost owner):", err));
      }
      if (foundOwner && foundOwner.email && (!lostOwner || String(foundOwner._id) !== String(lostOwner._id))) {
        sendHandoverSuccessNotification(foundOwner.email, foundOwner.name || "User", lostTitle, foundTitle)
          .catch(err => console.error("Handover email error (found owner):", err));
      }
    } catch (emailErr) {
      console.error("Error triggering handover success emails:", emailErr);
    }

    return apiResponse(res, 200, true, "Match successfully verified and items resolved!", match);
  } catch (error) {
    next(error);
  }
};

const dismissMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Match = require("../models/matches");

    const match = await Match.findById(id);
    if (!match) {
      return apiResponse(res, 404, false, "Match not found!");
    }

    match.status = "dismissed";
    await match.save();

    const items = [match.lostItemId, match.foundItemId];
    for (const itemId of items) {
      const activeMatchesCount = await Match.countDocuments({
        _id: { $ne: match._id },
        $or: [{ lostItemId: itemId }, { foundItemId: itemId }],
        status: { $in: ["pending", "verified"] }
      });
      
      if (activeMatchesCount === 0) {
        await Item.findByIdAndUpdate(itemId, { status: "reported" });
      }
    }

    return apiResponse(res, 200, true, "Match successfully dismissed!", match);
  } catch (error) {
    next(error);
  }
};

const verifyOwner = async (req, res, next) => {
  try {
    const { id } = req.params; // found item ID
    const { lostItemId, score } = req.body; // Optional manual override from frontend
    const axios = require("axios");
    const Match = require("../models/matches");
    const { sendOwnerNotification } = require("../helpers/emailService");

    // 1. Find found item
    const foundItem = await Item.findById(id);
    if (!foundItem) {
      return apiResponse(res, 404, false, "Found item not found!");
    }

    if (foundItem.type !== "found") {
      return apiResponse(res, 400, false, "This action is only applicable to found items!");
    }

    let matchingLostItemId = lostItemId;
    let finalScore = score;

    if (!matchingLostItemId) {
      // 2. Get candidates (all lost items with status reported/matched)
      const candidates = await Item.find({
        type: "lost",
        status: { $in: ["reported", "matched"] }
      });

      if (candidates.length === 0) {
        return apiResponse(res, 404, false, "No lost item candidates in database to compare against!");
      }

      // 3. Query AI Service to score matches
      const aiServiceURL = process.env.AI_SERVICE_URL || "http://localhost:5000";
      const payload = {
        target_item: {
          id: foundItem._id.toString(),
          title: foundItem.title,
          description: foundItem.description,
          category: foundItem.category,
          images: foundItem.images || [],
          location: foundItem.locationLost,
          date: foundItem.dateLost,
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

      let matches = [];
      try {
        let aiResponse;
        try {
          aiResponse = await axios.post(`${aiServiceURL}/match`, payload, {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "User-Agent": "LostAndFoundServer"
            },
            timeout: 30000
          });
          if (typeof aiResponse.data !== "object" || aiResponse.data === null || !aiResponse.data.status) {
            throw new Error("Invalid AI service response format");
          }
        } catch (primErr) {
          if (aiServiceURL !== "http://localhost:5000") {
            console.warn(`Primary AI Service (${aiServiceURL}) failed in verifyOwner (${primErr.message}). Retrying with http://localhost:5000...`);
            aiResponse = await axios.post("http://localhost:5000/match", payload, { timeout: 30000 });
          } else {
            throw primErr;
          }
        }
        if (aiResponse.data && aiResponse.data.status) {
          matches = aiResponse.data.matches;
        }
      } catch (err) {
        console.error("FastAPI AI matching request failed during verifyOwner:", err.message);
        console.log("Using backend word overlap fallback matching...");
        matches = candidates.map(c => {
          const title1 = foundItem.title.toLowerCase();
          const title2 = c.title.toLowerCase();
          const words1 = new Set(title1.split(" "));
          const words2 = new Set(title2.split(" "));
          const intersection = [...words1].filter(x => words2.has(x));
          const scoreVal = intersection.length / Math.max(words1.size, words2.size);
          return { candidate_id: c._id.toString(), score: scoreVal };
        }).sort((a, b) => b.score - a.score);
      }

      // 4. Select best candidate (similarity must be >= 0.65)
      const bestMatch = matches[0];
      if (!bestMatch || bestMatch.score < 0.65) {
        return apiResponse(res, 404, false, "AI could not identify a confident matching owner (similarity score below 65%).");
      }

      matchingLostItemId = bestMatch.candidate_id;
      finalScore = bestMatch.score;
    }

    if (finalScore === undefined || finalScore === null) {
      finalScore = 1.0;
    }

    // 5. Retrieve matching lost item and owner
    const matchingLostItem = await Item.findById(matchingLostItemId).populate("reportedBy");
    if (!matchingLostItem) {
      return apiResponse(res, 404, false, "Matching lost item record not found in database!");
    }

    const owner = matchingLostItem.reportedBy;
    if (!owner) {
      return apiResponse(res, 404, false, "Owner user account not found for this matching lost item!");
    }

    // 6. Save or update Match suggestion
    let matchEntry = await Match.findOne({
      lostItemId: matchingLostItemId,
      foundItemId: foundItem._id
    });

    if (!matchEntry) {
      matchEntry = new Match({
        lostItemId: matchingLostItemId,
        foundItemId: foundItem._id,
        similarityScore: finalScore,
        status: "verified"
      });
    } else {
      matchEntry.status = "verified";
      matchEntry.similarityScore = finalScore;
    }
    await matchEntry.save();

    // 7. Resolve item statuses
    foundItem.status = "resolved";
    await foundItem.save();
    
    matchingLostItem.status = "resolved";
    await matchingLostItem.save();

    // 8. Dispatch Email Notification
    const ownerEmail = owner.email;
    const ownerName = owner.fullName || owner.name || "DIU Student";
    const emailSent = await sendOwnerNotification(ownerEmail, ownerName, matchingLostItem.title, foundItem.title);

    return apiResponse(res, 200, true, "AI successfully matched owner and notification dispatched!", {
      owner: {
        name: ownerName,
        email: ownerEmail,
      },
      matchedItemTitle: matchingLostItem.title,
      score: finalScore,
      emailSent
    });
  } catch (error) {
    next(error);
  }
};

const checkOwnerMatch = async (req, res, next) => {
  try {
    const { id } = req.params; // found item ID
    const axios = require("axios");
    const Item = require("../models/items");

    // 1. Find found item
    const foundItem = await Item.findById(id);
    if (!foundItem) {
      return apiResponse(res, 404, false, "Found item not found!");
    }

    if (foundItem.type !== "found") {
      return apiResponse(res, 400, false, "This action is only applicable to found items!");
    }

    // 2. Get candidates (all lost items with status reported/matched)
    const candidates = await Item.find({
      type: "lost",
      status: { $in: ["reported", "matched"] }
    });

    if (candidates.length === 0) {
      return apiResponse(res, 404, false, "No lost item candidates in database to compare against!");
    }

    // 3. Query AI Service to score matches
    const aiServiceURL = process.env.AI_SERVICE_URL || "http://localhost:5000";
    const payload = {
      target_item: {
        id: foundItem._id.toString(),
        title: foundItem.title,
        description: foundItem.description,
        category: foundItem.category,
        images: foundItem.images || [],
        location: foundItem.locationLost,
        date: foundItem.dateLost,
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

    let matches = [];
    try {
      let aiResponse;
      try {
        aiResponse = await axios.post(`${aiServiceURL}/match`, payload, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "User-Agent": "LostAndFoundServer"
          },
          timeout: 30000
        });
        if (typeof aiResponse.data !== "object" || aiResponse.data === null || !aiResponse.data.status) {
          throw new Error("Invalid AI service response format");
        }
      } catch (primErr) {
        if (aiServiceURL !== "http://localhost:5000") {
          console.warn(`Primary AI Service (${aiServiceURL}) failed in checkOwnerMatch (${primErr.message}). Retrying with http://localhost:5000...`);
          aiResponse = await axios.post("http://localhost:5000/match", payload, { timeout: 30000 });
        } else {
          throw primErr;
        }
      }
      if (aiResponse.data && aiResponse.data.status) {
        matches = aiResponse.data.matches;
      }
    } catch (err) {
      console.error("FastAPI AI matching request failed during checkOwnerMatch:", err.message);
      console.log("Using backend word overlap fallback matching...");
      matches = candidates.map(c => {
        const title1 = foundItem.title.toLowerCase();
        const title2 = c.title.toLowerCase();
        const words1 = new Set(title1.split(" "));
        const words2 = new Set(title2.split(" "));
        const intersection = [...words1].filter(x => words2.has(x));
        const score = intersection.length / Math.max(words1.size, words2.size);
        return { candidate_id: c._id.toString(), score };
      }).sort((a, b) => b.score - a.score);
    }

    // Select best candidate
    const bestMatch = matches[0];
    if (!bestMatch) {
      return apiResponse(res, 404, false, "No matching candidates found.");
    }

    const matchingLostItemId = bestMatch.candidate_id;
    const matchingLostItem = await Item.findById(matchingLostItemId).populate("reportedBy");
    if (!matchingLostItem) {
      return apiResponse(res, 404, false, "Matching lost item record not found in database!");
    }

    const owner = matchingLostItem.reportedBy;
    const ownerName = owner ? (owner.fullName || owner.name || "DIU Student") : "Unknown";
    const ownerEmail = owner ? owner.email : "Unknown";

    return apiResponse(res, 200, true, "AI match preview retrieved successfully", {
      foundItem: {
        id: foundItem._id,
        title: foundItem.title,
        description: foundItem.description,
        images: foundItem.images,
        location: foundItem.locationLost || "Unknown",
        date: foundItem.dateLost || foundItem.createdAt
      },
      matchedItem: {
        id: matchingLostItem._id,
        title: matchingLostItem.title,
        description: matchingLostItem.description,
        images: matchingLostItem.images,
        location: matchingLostItem.locationLost || "Unknown",
        date: matchingLostItem.dateLost || matchingLostItem.createdAt,
        owner: {
          name: ownerName,
          email: ownerEmail
        }
      },
      score: bestMatch.score
    });
  } catch (error) {
    next(error);
  }
};

const getGlobalStats = async (req, res, next) => {
  try {
    const totalLostItems = await Item.countDocuments({ type: "lost" });
    const totalFoundItems = await Item.countDocuments({ type: "found" });
    const totalMatches = await Item.countDocuments({ type: "lost", status: "matched" });
    const itemsRecovered = await Item.countDocuments({ type: "lost", status: "resolved" });
    const registeredUsers = await User.countDocuments();

    const lostByCategoryRaw = await Item.aggregate([
      { $match: { type: "lost" } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const foundByCategoryRaw = await Item.aggregate([
      { $match: { type: "found" } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const matchesByCategoryRaw = await Item.aggregate([
      { $match: { type: "lost", status: "matched" } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const recoveredByCategoryRaw = await Item.aggregate([
      { $match: { type: "lost", status: "resolved" } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const mapCategoryToGroup = (cat) => {
      if (!cat) return "Others";
      const c = cat.toString().trim().toLowerCase();
      if (c === "laptop" || c === "mobile" || c === "watch" || c === "headphones" || c === "electronics") {
        return "Electronics";
      }
      if (c === "wallets" || c === "wallet" || c === "cash") {
        return "Wallets";
      }
      if (c === "bags" || c === "bag" || c === "accessories" || c === "backpack") {
        return "Accessories";
      }
      if (c === "id card" || c === "documents" || c === "document" || c === "id" || c === "books" || c === "book") {
        return "Documents";
      }
      if (c === "keys" || c === "key" || c === "keychain") {
        return "Keys";
      }
      if (c === "clothings" || c === "clothing" || c === "clothes" || c === "wearable") {
        return "Clothing";
      }
      return "Others";
    };

    const formatCategoryMap = (rawList) => {
      const map = {
        Electronics: 0,
        Wallets: 0,
        Documents: 0,
        Accessories: 0,
        Clothing: 0,
        Keys: 0,
        Others: 0,
      };
      rawList.forEach((item) => {
        if (item._id) {
          const group = mapCategoryToGroup(item._id);
          map[group] = (map[group] || 0) + item.count;
        }
      });
      return map;
    };

    return apiResponse(res, 200, true, "Global stats retrieved successfully!", {
      totalLostItems,
      totalFoundItems,
      totalMatches,
      itemsRecovered,
      registeredUsers,
      lostByCategory: formatCategoryMap(lostByCategoryRaw),
      foundByCategory: formatCategoryMap(foundByCategoryRaw),
      matchesByCategory: formatCategoryMap(matchesByCategoryRaw),
      recoveredByCategory: formatCategoryMap(recoveredByCategoryRaw),
    });
  } catch (error) {
    next(error);
  }
};

const claimMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.decoded && req.decoded.id;
    const Match = require("../models/matches");

    const match = await Match.findById(id);
    if (!match) {
      return apiResponse(res, 404, false, "Match record not found!");
    }

    match.status = "claimed";
    match.claimedBy = userId;
    match.claimedAt = new Date();
    await match.save();

    return apiResponse(res, 200, true, "Item match successfully claimed!", match);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reportLostItem,
  getMyStats,
  getMyItems,
  reportFoundItem,
  getAllItems,
  getAdminStats,
  getMatches,
  approveMatch,
  dismissMatch,
  verifyOwner,
  checkOwnerMatch,
  getGlobalStats,
  claimMatch,
};

