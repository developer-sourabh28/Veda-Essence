const express = require('express');
const router = express.Router();
const {Rating, Review} = require('../schemas/RatingReviewSchema');
const {verifyToken} = require('../middleware/auth');
const Post = require('../schemas/postSchema');

router.post("/comment/:id", verifyToken, async (req, res) => {
    try {
        const { comment } = req.body;
        const productId = req.params.id;
        const userId = req.user.id;
        const username = req.user.username;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is missing" });
        }

        if (!comment || !comment.trim()) {
            return res.status(400).json({ message: "Comment cannot be empty" });
        }

        // Verify the product exists
        const product = await Post.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Create a new review
        const newReview = new Review({
            postId: productId,
            userId,
            username,
            comment: comment.trim()
        });

        await newReview.save();

        res.json({ 
            message: "Comment added successfully",
            review: newReview 
        });
    } catch (error) {
        console.error("Error submitting comment:", error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/comment/:id', async (req, res) => {
    try {
        const postId = req.params.id;

        if (!postId) {
            return res.status(400).json({ message: "Post ID is missing" });
        }

        const reviews = await Review.find({ postId })
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json({ comments: reviews });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: error.message });
    }
});

router.delete('/comment/:id', verifyToken, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;

        // Find the review
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check if the user is the owner of the comment
        if (review.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own reviews" });
        }

        // Delete the review
        await Review.findByIdAndDelete(reviewId);
        
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: "Failed to delete review" });
    }
});

module.exports = router;