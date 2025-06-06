const express = require('express');
const router = express.Router();
const {Rating} = require('../schemas/RatingReviewSchema');
const {verifyToken} = require('../middleware/auth');
const Post = require('../schemas/postSchema');

// Add or update rating
router.post("/rate/:id", verifyToken, async (req, res) => {
    try {
        const { rating } = req.body;
        const userId = req.user.id; // Get userId from token
        const productId = req.params.id;

        // Validate rating
        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Find or create rating document
        let ratingDoc = await Rating.findOne({ productId });
        
        if (!ratingDoc) {
            // Verify product exists before creating rating doc
            const productExists = await Post.findById(productId);
            if (!productExists) {
                return res.status(404).json({ message: "Product not found" });
            }

            ratingDoc = new Rating({
                productId,
                ratings: []
            });
        }

        // Find existing rating by this user
        const existingRatingIndex = ratingDoc.ratings.findIndex(
            r => r.userId.toString() === userId
        );

        if (existingRatingIndex > -1) {
            // Update existing rating
            ratingDoc.ratings[existingRatingIndex].rating = ratingNum;
        } else {
            // Add new rating
            ratingDoc.ratings.push({ userId, rating: ratingNum });
        }

        await ratingDoc.save();

        // Calculate average
        const avgRating = ratingDoc.ratings.length > 0
            ? ratingDoc.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingDoc.ratings.length
            : 0;

        res.json({
            message: "Rating updated successfully",
            averageRating: Number(avgRating.toFixed(1)),
            totalRatings: ratingDoc.ratings.length,
            userRating: ratingNum
        });

    } catch (error) {
        console.error("Rating error:", error);
        res.status(500).json({ message: "Failed to update rating" });
    }
});

// Get ratings for a product
router.get("/rating/:productId", verifyToken, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id; // Get userId from token

        const ratingDoc = await Rating.findOne({ productId });
        
        if (!ratingDoc) {
            return res.json({
                averageRating: 0,
                totalRating: 0,
                userRating: 0
            });
        }

        // Calculate average rating
        const totalRating = ratingDoc.ratings.length;
        const avgRating = totalRating > 0
            ? ratingDoc.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRating
            : 0;

        // Get user's rating if it exists
        const userRating = ratingDoc.ratings.find(r => r.userId.toString() === userId)?.rating || 0;

        res.json({
            averageRating: Number(avgRating.toFixed(1)),
            totalRating,
            userRating
        });

    } catch (error) {
        console.error("Get rating error:", error);
        res.status(500).json({ message: "Failed to fetch ratings" });
    }
});

module.exports = router;