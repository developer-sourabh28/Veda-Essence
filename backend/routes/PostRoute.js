const express = require('express');
const router = express.Router();
const Post = require('../schemas/postSchema');
const User = require('../schemas/UserSchema');
const { verifyToken } = require('../middleware/auth');

require('dotenv').config();

// 🔥 POST route: upload product (admin only)
router.post('/api/uploads', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { name, description, type, size, price, group, image } = req.body;

        if (!name || !description || !type || !size || !price || !group || !image) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (isNaN(price)) {
            return res.status(400).json({ message: 'Price must be a valid number' });
        }

        // Create new post
        const newPost = new Post({
            name,
            description,
            type,  // Changed from productType to type
            size,
            price,
            group,
            image,
            createdBy: user._id,
        });

        await newPost.save();

        res.status(200).json({ message: 'Post added successfully!', post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});

// GET route: fetch all posts
router.get('/post', async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// DELETE route: delete post by ID
router.delete('/post/delete/:id', async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
