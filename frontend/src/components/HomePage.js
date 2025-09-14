import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { jwtDecode } from 'jwt-decode';
// import { useNavigate } from 'react-router-dom';
import { FaStar } from "react-icons/fa";
import { QRCodeSVG } from 'qrcode.react';
import { Package, X, Star, BarChart3, Trash2, FileText, Info, Ruler, Tag, DollarSign, Grid, ShoppingCart, MessageCircle, Edit3, Send, User, Calendar } from 'lucide-react';

export default function HomePage({ productId }) {
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [size, setSize] = useState('');
    const [productType, setProductType] = useState('');
    const [price, setPrice] = useState('');
    const [group, setGroup] = useState('');
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [activePost, setActivePost] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [category, setCategory] = useState('All');
    const [sortItem, setSortItem] = useState('');
    const [showBestSeller, setShowBestSeller] = useState(false);
    const [showCrazyDeals, setShowCrazyDeals] = useState(false);
    const [showNewArrivals, setShowNewArrivals] = useState(false);
    const [rating, setRating] = useState(0);
    const [avgRating, setAvgRating] = useState(0);
    const [totalRating, setTotalRating] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPaymentQR, setShowPaymentQR] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [address, setAddress] = useState({
        fullName: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        phoneNumber: ''
    });
    const [darkMode, setDarkMode] = useState(() => {
        // Check localStorage for persisted mode
        const stored = localStorage.getItem('veda_dark_mode');
        return stored ? JSON.parse(stored) : false;
    });

    const images = [
        'https://i.pinimg.com/736x/be/06/8b/be068b572e0be145fa97fe58d5580d3a.jpg',
        'https://i.pinimg.com/736x/0e/d1/13/0ed11392a8bc272f9a6d4f108a8f63b4.jpg',
        'https://i.pinimg.com/736x/aa/ea/6c/aaea6c0a8f31bc8f029c154533891539.jpg',
        'https://i.pinimg.com/736x/a2/82/24/a28224c051048fe259b540e2a5ae722c.jpg'
    ];

    // const reviewPerProduct = 5;
    // const [currentReview, setCurrentReview] = useState(1);

    // const startIndex = (currentReview - 1) * reviewPerProduct;
    // const endIndex = startIndex + reviewPerProduct;

    // const totalReview = Math.ceil(data.length / reviewPerProduct);

    // const handleNext = () => {

    // }
    // const [displayedItems, setDisplayedItems] = useState([]); 
    // const navigate = useNavigate();


    const SortAscItem = () => {
        const sortAsc = (prevItems => [...prevItems].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        setItems(sortAsc(items));
    }

    const handleSortItem = (value) => {

        // if(sortItem === value) return;
        setSortItem(value);
        if (value === 'Ascending') {
            SortAscItem();
        } else {
            setItems([...items])
        }
    }


    const filterCat = category === 'All'
        ? items
        : items.filter(item => item.type === category)

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    }

    const sortedAndFilteredItems = filterCat.sort((a, b) =>
        sortItem === 'Ascending' ? a.price - b.price : sortItem === 'Descending' ? b.price - a.price : 0
    );

    const filteredItems = sortedAndFilteredItems.filter(item => {
        if (showBestSeller) return item.group === 'bestseller';
        if (showCrazyDeals) return item.group === 'crazydeals';
        return true;
    })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const displayedItems = Array.isArray(filteredItems) ?
        (showNewArrivals ? filteredItems.slice(0, 10) : filteredItems) : [];


    const handleImageClick = async (post) => {
        setActivePost(post);
        if (post && post._id) {
            await fetchRating(post._id);
            await fetchComments(post._id);
        }
    };

    const handleClosePost = () => {
        setActivePost(null);
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileSubmit = async (e) => {
        e.preventDefault();

        // Ensure all fields are filled
        if (!file || !name || !description || !size || !productType || !price || !group) {
            alert('All fields are required');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'Perfume_website');
            formData.append('folder', 'eCommerce');

            console.log('Uploading to Cloudinary...');
            const cloudinaryResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/dkqzeypto/image/upload`,
                formData
            );

            const imageUrl = cloudinaryResponse.data.secure_url;
            console.log('Cloudinary upload successful:', imageUrl);

            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Authorization token is missing');
                return;
            }

            const productData = {
                name,
                description,
                size,
                type: productType,  // Changed from productType to type to match backend
                price: Number(price),  // Ensure price is a number
                group,
                image: imageUrl
            };

            console.log('Sending data to backend:', productData);
            
            const response = await axios.post(
                'http://localhost:8000/api/uploads',
                productData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    withCredentials: true
                }
            );

            console.log('Backend response:', response.data);
            alert(response.data.message || 'Product uploaded successfully');
            setItems([...items, response.data.post]);
            resetForm();
        } catch (error) {
            console.error('Full error object:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error message:', error.message);
            
            let errorMessage = 'An error occurred while uploading the product. ';
            if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            } else if (error.message) {
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        }
    };

    // Helper function to reset form fields
    const resetForm = () => {
        setName('');
        setDescription('');
        setSize('');
        setProductType('');
        setPrice('');
        setGroup('');
        setFile(null);
    };

    useEffect(() => {
        GetPost();
        checkAdminStatus();
    }, []);

    useEffect(() => {
        if (activePost?._id) {
            console.log("Active Post ID:", activePost._id);
            fetchComments(activePost._id);
        }
    }, [activePost]);

    useEffect(() => {
        const interval = setInterval(() => { 
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('veda_dark_mode', JSON.stringify(darkMode));
    }, [darkMode]);

    const GetPost = async () => {
        try {
            const response = await axios.get('http://localhost:8000/post', {
                withCredentials: true,
            });
            setItems(response.data);
        } catch (error) {
            setError('Failed to fetch data');
        }
    };

    const validateToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return null;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp < currentTime) {
                localStorage.removeItem('authToken');
                return null;
            }
            
            return token;
        } catch (error) {
            localStorage.removeItem('authToken');
            return null;
        }
    };

    const fetchRating = async (productId) => {
        if (!productId) return;

        try {
            const response = await axios.get(
                `http://localhost:8000/rating/${productId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            );
            
            if (response.data) {
                const avgRatingNum = parseFloat(response.data.averageRating) || 0;
                setAvgRating(avgRatingNum);
                setTotalRating(response.data.totalRating || 0);
                setRating(response.data.userRating || 0);
            }
        } catch (error) {
            console.error("Error fetching rating", error);
            setAvgRating(0);
            setTotalRating(0);
            setRating(0);
        }
    };

    const submitRating = async (newRating, productId) => {
        try {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                alert('Please log in to rate products');
                return;
            }

            const response = await axios.post(
                `http://localhost:8000/rate/${productId}`,
                { rating: newRating },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                // Update local state with the new rating data
                setRating(newRating);
                setAvgRating(parseFloat(response.data.averageRating) || 0);
                setTotalRating(response.data.totalRatings || 0);
            }
        } catch (error) {
            console.error("Error submitting rating", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('authToken');
                alert('Authentication failed. Please log in again.');
            } else {
                alert(error.response?.data?.message || 'Failed to submit rating');
            }
        }
    };

    const fetchComments = async (productId) => {
        if (!productId) return;

        try {
            const response = await axios.get(`http://localhost:8000/comment/${productId}`);
            if (response.data && response.data.comments) {
                setComments(response.data.comments);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const deleteComments = async (reviewId) => {
        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                alert("User not authenticated. Please log in again.");
                return;
            }

            const response = await axios.delete(
                `http://localhost:8000/comment/${reviewId}`,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    }
                }
            );

            if (response.data) {
                // Refresh comments after successful deletion
                fetchComments(activePost._id);
            }
        } catch (error) {
            console.error("Error deleting review:", error);
            if (error.response?.status === 403) {
                alert("You can only delete your own reviews");
            } else {
                alert(error.response?.data?.message || "Failed to delete review");
            }
        }
    };

    // Add this function to check if the comment belongs to current user
    const isCurrentUserComment = (comment) => {
        const token = localStorage.getItem('authToken');
        if (!token) return false;
        
        try {
            const decoded = jwtDecode(token);
            return decoded.id === comment.userId;
        } catch (error) {
            return false;
        }
    };

    const submitComment = async (productId) => {
        try {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                alert('Please log in to add comments');
                return;
            }

            if (!newComment.trim()) {
                alert('Please enter a comment');
                return;
            }

            const decoded = jwtDecode(token);
            const userId = decoded.id;
            const username = decoded.username;

            const response = await axios.post(
                `http://localhost:8000/comment/${productId}`,
                {
                    userId: userId,
                    username: username,
                    comment: newComment.trim()
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true
                }
            );

            if (response.data) {
                setNewComment("");
                fetchComments(productId);
                alert('Comment added successfully');
            }
        } catch (error) {
            console.error("Error submitting comment", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('authToken');
                alert('Authentication failed. Please log in again.');
            } else {
                alert(error.response?.data?.message || 'Failed to submit comment');
            }
        }
    };

    const handleSubmit = () => {
        console.log("Submitting comment for:", activePost?._id);  // Debugging log

        if (!activePost?._id) {
            alert("Product ID is missing");
            return;
        }

        submitComment(activePost._id);
    };

    const checkAdminStatus = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            await axios.get('http://localhost:8000/permission/admin', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsAdmin(true);
        } catch (error) {
            console.log('Error checking admin status:', error.response?.data || error.message);
            setIsAdmin(false);
        }
    };

    const handleAddToCart = async (item) => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            alert('You must be logged in to add items to the cart');
            return;
        }

        const userId = jwtDecode(token).id;
        try {
            const response = await axios.post(
                'http://localhost:8000/api/cart/add',
                {
                    userId,
                    itemId: item._id,
                    itemName: item.name,
                    itemPrice: item.price,
                    itemSize: item.size,
                    itemType: item.type,
                    itemImage: item.image
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert(response.data.message);
        } catch (error) {
            console.log('Error adding item to cart:', error.response?.data || error.message);
            alert('Failed to add item to cart');
        }
    }

    const handleFetchCart = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            alert('You must be logged in to view your cart');
            return;
        }

        const userId = jwtDecode(token).id;
        console.log('User ID', userId);

        try {
            const response = await axios.get(`http://localhost:8000/api/cart/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Cart items', response.data);
            setCartItems(response.data);  // Update the state with fetched cart items
        } catch (error) {
            console.log('Error fetching cart:', error.response?.data || error.message);
            alert('Failed to fetch cart');
        }
    };

    const handleDeletePost = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/post/delete/${id}`, {
                withCredentials: true,
            });
            alert('Post delete success')
        } catch (error) {
            console.error(error.response?.data || 'Failed to delete post');
            alert(error.response?.data?.message || 'Failed to delete post');
        }
    }


    const handleCartButtonClick = async () => {
        await handleFetchCart();
        setIsCartOpen(true);
    };

    const handleCloseCart = () => {
        setIsCartOpen(false);
    }

    const handleDeleteCart = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/cart/${id}`,
                { withCredentials: true }
            )
            setCartItems(prevItems => prevItems.filter(item => item._id !== id))
        } catch (error) {
            alert('Failed to delete item')
        }
    }

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePlaceOrder = () => {
        const total = cartItems.reduce((sum, item) => sum + Number(item.itemPrice), 0);
        setPaymentAmount(total);
        setShowAddressForm(true);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please log in to continue');
            return;
        }

        const userId = jwtDecode(token).id;
        try {
            const response = await axios.post(
                'http://localhost:8000/api/address/add',
                {
                    userId,
                    ...address
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data) {
                setShowAddressForm(false);
                setShowPaymentOptions(true);
            }
        } catch (error) {
            console.error('Error saving address:', error.response?.data || error.message);
            alert('Failed to save address. Please try again.');
        }
    };

    const handlePaymentMethod = (method) => {
        setSelectedPaymentMethod(method);
        if (method === 'gpay') {
            setShowPaymentOptions(false);
            setShowPaymentQR(true);
        } else if (method === 'cod') {
            setShowPaymentOptions(false);
            // Handle cash on delivery
            alert('Order placed successfully! You will pay on delivery.');
            // Here you can add the order to database
            setCartItems([]);
            setIsCartOpen(false);
        }
    };

    const generateGPayURL = (amount) => {
        // Format amount to 2 decimal places
        const formattedAmount = amount.toFixed(2);
        // Create GPay URL with amount
        return `upi://pay?pa=bunnybansotiya@okaxis&pn=VedaEssencee&am=${formattedAmount}&cu=INR&tn=Perfume Purchase`;
    };

    return (
        <div className="min-h-screen">

            {/* Dark Mode Toggle Button */}
            <div className="relative flex justify-end items-center p-4">
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <span className="text-lg font-semibold italic dark:text-gray-200 ">~ Veda Essence ~</span>
                </div>
                {/* Modern Switch for Dark/Light Mode */}
                <label className="flex items-center cursor-pointer select-none">
                    <span className="sr-only">Toggle dark mode</span>
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode((prev) => !prev)}
                        className="hidden"
                    />
                    <span
                        className={`w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
                    >
                        <span
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-lg ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
                        >
                            {darkMode ? '🌙' : '☀️'}
                        </span>
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {darkMode ? 'Dark' : 'Light'}
                    </span>
                </label>
            </div>

            {/* Navbar */}
            <Navbar
                OnCartClick={handleCartButtonClick}
                OnCategoryClick={handleCategoryChange}
                OnArrivalClick={handleSortItem}
                selectedSort={sortItem}
                showBestSeller={showBestSeller} 
                setShowBestSeller={setShowBestSeller}
                showCrazyDeals={showCrazyDeals} 
                setShowCrazyDeals={setShowCrazyDeals}
                showNewArrivals={showNewArrivals} 
                setShowNewArrivals={setShowNewArrivals}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-white dark:bg-black transition-colors duration-300">
                {/* Image Carousel */}
                <div className="mb-6 sm:mb-8 lg:mb-12">
                    <div className="relative h-[200px] sm:h-[300px] lg:h-[400px] rounded-xl sm:rounded-2xl overflow-hidden">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                className={`absolute top-0 left-0 w-full h-[120%] object-cover transition-opacity duration-500 ${
                                    currentImageIndex === index ? 'opacity-100' : 'opacity-0'
                                }`}
                                src={image}
                                alt={`homeImg${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Admin Form */}
                {isAdmin && (
                    <div className="mb-6 sm:mb-8 lg:mb-12">
                        <button
                            className="w-full sm:w-auto bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors mb-4"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? 'Close Form' : 'Add New Product'}
                        </button>

                        {isOpen && (
                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                                <form onSubmit={handleFileSubmit} className="space-y-4">
                                    <div>
                                        <input 
                                            type="file" 
                                            onChange={handleFileChange}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter Name"
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Enter Description"
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        />
                                        <select 
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                            defaultValue=""
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="" disabled>Select Size</option>
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                        </select>
                                        <select 
                                            value={productType}
                                            onChange={(e) => setProductType(e.target.value)}
                                            defaultValue=""
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="" disabled>Select Type</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="unisex">Unisex</option>
                                        </select>
                                        <select
                                            value={group}
                                            onChange={(e) => setGroup(e.target.value)}
                                            defaultValue=""
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="" disabled>Select Category</option>
                                            <option value="bestseller">Best Seller</option>
                                            <option value="crazydeals">Crazy Deals</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="Enter Price"
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                                    >
                                        Upload
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {Array.isArray(displayedItems) && displayedItems.length > 0 ? (
                        displayedItems.map(item => (
                            <div key={item._id} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                {!activePost && item.image && (
                                    <div>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-[200px] sm:h-[220px] lg:h-[250px] object-cover cursor-pointer transition-transform hover:scale-105"
                                            onClick={() => handleImageClick(item)}
                                        />
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg sm:text-xl mb-2 text-black dark:text-white">{item.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-300">${item.price}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-300 col-span-full">No items found</p>
                    )}
                </div>
            </div>

            {/* Modals */}
            {/* Cart Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                        <div className="p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-black dark:text-white">Your Cart</h2>
                                <button
                                    className="text-red-500 hover:text-red-600"
                                    onClick={handleCloseCart}
                                >
                                    <i className="text-2xl sm:text-3xl fa-regular fa-circle-xmark"></i>
                                </button>
                            </div>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item, index) => (
                                        <div key={index} className="mb-6 last:mb-0">
                                            <div className="flex gap-4">
                                                <div className="w-24 h-24 flex-shrink-0">
                                                    <img
                                                        src={item.itemImage || 'images/default-product.png'}
                                                        alt={item.itemName}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                </div>
                                                
                                                <div className="flex-grow">
                                                    <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">{item.itemName}</h3>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <p><span className="text-gray-600 dark:text-gray-300">Price:</span> <span className="text-black dark:text-white">${item.itemPrice}</span></p>
                                                        <p><span className="text-gray-600 dark:text-gray-300">Size:</span> <span className="text-black dark:text-white">{item.itemSize}</span></p>
                                                        <p><span className="text-gray-600 dark:text-gray-300">Type:</span> <span className="text-black dark:text-white">{item.itemType}</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 flex justify-end">
                                                <button
                                                    onClick={() => handleDeleteCart(item._id)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200 flex items-center gap-2"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                    Remove
                                                </button>
                                            </div>
                                            
                                            {index < cartItems.length - 1 && (
                                                <hr className="my-4 border-gray-200 dark:border-gray-700" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <i className="fas fa-shopping-cart text-4xl text-gray-400 mb-4"></i>
                                        <p className="text-gray-500 dark:text-gray-300">Your Cart is Empty</p>
                                    </div>
                                )}
                            </div>
                            {cartItems.length > 0 && (
                                <div className="mt-6">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                                        <div className="flex justify-between items-center text-lg font-semibold text-black dark:text-white">
                                            <span>Total Amount:</span>
                                            <span>${cartItems.reduce((total, item) => total + Number(item.itemPrice), 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePlaceOrder}
                                        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-200 text-base lg:text-lg font-semibold flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-shopping-bag"></i>
                                        Place Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Address Form Modal */}
            {showAddressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/80 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black dark:text-white">Delivery Address</h2>
                            <button
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setShowAddressForm(false)}
                            >
                                <i className="text-2xl fa-regular fa-circle-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={address.fullName}
                                    onChange={handleAddressChange}
                                    required
                                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    name="streetAddress"
                                    value={address.streetAddress}
                                    onChange={handleAddressChange}
                                    required
                                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="Enter street address"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={address.city}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        placeholder="Enter city"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={address.state}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        placeholder="Enter state"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={address.postalCode}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        placeholder="Enter postal code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={address.phoneNumber}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-200 text-base font-semibold"
                                >
                                    Proceed to Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment QR Modal */}
            {showPaymentQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/80 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black dark:text-white">Scan to Pay</h2>
                            <button
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setShowPaymentQR(false)}
                            >
                                <i className="text-2xl fa-regular fa-circle-xmark"></i>
                            </button>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
                                <QRCodeSVG
                                    value={generateGPayURL(paymentAmount)}
                                    size={256}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <p className="text-lg font-semibold mb-2 text-black dark:text-white">Amount: ${paymentAmount.toFixed(2)}</p>
                            <div className="text-sm text-gray-600 dark:text-gray-300 text-center space-y-2">
                                <p>Scan this QR code with your GPay app to make the payment</p>
                                <p className="font-medium">Delivery Address:</p>
                                <p>{address.fullName}</p>
                                <p>{address.streetAddress}</p>
                                <p>{address.city}, {address.state} {address.postalCode}</p>
                                <p>Phone: {address.phoneNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Options Modal */}
            {showPaymentOptions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/80 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black dark:text-white">Select Payment Method</h2>
                            <button
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setShowPaymentOptions(false)}
                            >
                                <i className="text-2xl fa-regular fa-circle-xmark"></i>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <button
                                onClick={() => handlePaymentMethod('gpay')}
                                className="w-full bg-white dark:bg-gray-800 border-2 border-blue-500 text-blue-500 py-3 px-6 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition duration-200 text-base font-semibold flex items-center justify-center gap-2"
                            >
                                <i className="fab fa-google-pay"></i>
                                Pay with GPay
                            </button>
                            <button
                                onClick={() => handlePaymentMethod('cod')}
                                className="w-full bg-white dark:bg-gray-800 border-2 border-green-500 text-green-500 py-3 px-6 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition duration-200 text-base font-semibold flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-money-bill-wave"></i>
                                Cash on Delivery
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Detail Modal */}
            {activePost && activePost._id && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden relative border border-white/20 dark:border-gray-700/50">
            {/* Header with Glass Effect */}
            <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/50 p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl lg:text-2xl font-bold text-black dark:text-white truncate pr-4">
                        {activePost.name}
                    </h2>
                </div>
                            <button 
                    className="flex items-center gap-2 bg-red-500/90 hover:bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
                                onClick={handleClosePost}
                            >
                    <X className="w-4 h-4" />
                    
                            </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        {/* Left Column - Image and Rating */}
                        <div className="space-y-6">
                            <div className="relative">
                                    <img
                                        src={activePost.image}
                                        alt={activePost.name}
                                    className="w-full h-[280px] sm:h-[350px] lg:h-[450px] object-cover rounded-xl shadow-lg"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                            </div>
                            
                            {/* Rating Section with Glass Effect */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-4 rounded-xl border border-white/20 dark:border-gray-700/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    <h3 className="text-lg font-semibold text-black dark:text-white">Rate Product</h3>
                                </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar
                                                    key={star}
                                            className={`cursor-pointer text-2xl transition-colors duration-200 ${
                                                star <= (rating || 0) ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'
                                                    }`}
                                                    onClick={() => submitRating(star, activePost._id)}
                                                />
                                            ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <BarChart3 className="w-4 h-4 text-gray-500" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {typeof avgRating === 'number' ? avgRating.toFixed(1) : '0.0'} from {totalRating} ratings
                                    </p>
                                        </div>
                                    </div>
                                </div>

                        {/* Right Column - Product Details */}
                                <div className="space-y-6">
                            {/* Admin Delete Button */}
                                        {isAdmin && (
                                <div className="flex justify-end">
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this product?')) {
                                                        handleDeletePost(activePost._id);
                                                        handleClosePost();
                                                    }
                                                }}
                                        className="flex items-center gap-2 bg-red-500/90 hover:bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
                                            >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                            </button>
                                </div>
                            )}

                            {/* Description */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-4 rounded-xl border border-white/20 dark:border-gray-700/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="text-lg font-semibold text-black dark:text-white">Description</h3>
                                    </div>
                                <p className="text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed">
                                    {activePost.description}
                                </p>
                            </div>
                            
                            {/* Product Details Grid */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-4 rounded-xl border border-white/20 dark:border-gray-700/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <h3 className="text-lg font-semibold text-black dark:text-white">Product Details</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between py-2 border-b border-white/20 dark:border-gray-700/50">
                                        <div className="flex items-center gap-2">
                                            <Ruler className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Size:</span>
                                        </div>
                                        <span className="text-black dark:text-white">{activePost.size}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-white/20 dark:border-gray-700/50">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>
                                        </div>
                                        <span className="text-black dark:text-white">{activePost.type}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-white/20 dark:border-gray-700/50">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Price:</span>
                                        </div>
                                        <span className="text-black dark:text-white font-semibold">${activePost.price}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-white/20 dark:border-gray-700/50">
                                        <div className="flex items-center gap-2">
                                            <Grid className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Category:</span>
                                        </div>
                                        <span className="text-black dark:text-white">{activePost.group}</span>
                                    </div>
                                </div>
                                    </div>

                            {/* Add to Cart Button */}
                                    <button 
                                className="w-full bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm text-white py-3 px-6 rounded-xl transition duration-200 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                        onClick={() => handleAddToCart(activePost)}
                                    >
                                <ShoppingCart className="w-5 h-5" />
                                        Add to Cart
                                    </button>

                            {/* Reviews Section */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-4 rounded-xl border border-white/20 dark:border-gray-700/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    <h3 className="text-lg font-semibold text-black dark:text-white">Customer Reviews</h3>
                                </div>
                                
                                {/* Review Input */}
                                        <div className="flex gap-2 mb-4">
                                    <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Write a review..."
                                            className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            />
                                        <Edit3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                            <button
                                                onClick={handleSubmit}
                                        className="bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg transition duration-200 font-medium whitespace-nowrap flex items-center gap-2"
                                            >
                                        <Send className="w-4 h-4" />
                                            </button>
                                        </div>

                                {/* Reviews List */}
                                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                                    {comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <div key={comment._id} className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm p-4 rounded-lg border border-white/30 dark:border-gray-600/50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        <p className="font-semibold text-black dark:text-white">{comment.username}</p>
                                                    </div>
                                                        {isCurrentUserComment(comment) && (
                                                            <button
                                                                onClick={() => deleteComments(comment._id)}
                                                            className="text-red-500 hover:text-red-600 text-sm font-medium transition duration-200 flex items-center gap-1"
                                                            >
                                                            <Trash2 className="w-3 h-3" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.comment}</p>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                        </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                No reviews yet. Be the first to review this product!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
