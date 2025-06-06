import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { jwtDecode } from 'jwt-decode';
// import { useNavigate } from 'react-router-dom';
import { FaStar } from "react-icons/fa";
import { QRCodeSVG } from 'qrcode.react';

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

    const images = [
        'https://i.pinimg.com/736x/be/06/8b/be068b572e0be145fa97fe58d5580d3a.jpg',
        'https://i.pinimg.com/736x/0e/d1/13/0ed11392a8bc272f9a6d4f108a8f63b4.jpg',
        'https://i.pinimg.com/736x/23/21/c9/2321c925e022d3efbae27645424c76c6.jpg',
        'https://i.pinimg.com/736x/85/e8/52/85e852988f11565f4aed2d03c91bb570.jpg'
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
        <div className="min-h-screen bg-white">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Image Carousel */}
                <div className="mb-6 sm:mb-8 lg:mb-12">
                    <div className="relative h-[200px] sm:h-[300px] lg:h-[400px] rounded-xl sm:rounded-2xl overflow-hidden">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${
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
                            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                                <form onSubmit={handleFileSubmit} className="space-y-4">
                                    <div>
                                        <input 
                                            type="file" 
                                            onChange={handleFileChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter Name"
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Enter Description"
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <select 
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                            defaultValue=""
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                {!activePost && item.image && (
                                    <div>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-[200px] sm:h-[220px] lg:h-[250px] object-cover cursor-pointer transition-transform hover:scale-105"
                                            onClick={() => handleImageClick(item)}
                                        />
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg sm:text-xl mb-2">{item.name}</h3>
                                            <p className="text-gray-600">${item.price}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 col-span-full">No items found</p>
                    )}
                </div>
            </div>

            {/* Modals */}
            {/* Cart Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Your Cart</h2>
                                <button
                                    className="text-red-500 hover:text-red-600"
                                    onClick={handleCloseCart}
                                >
                                    <i className="text-2xl sm:text-3xl fa-regular fa-circle-xmark"></i>
                                </button>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
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
                                                    <h3 className="font-semibold text-lg mb-2">{item.itemName}</h3>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <p><span className="text-gray-600">Price:</span> ${item.itemPrice}</p>
                                                        <p><span className="text-gray-600">Size:</span> {item.itemSize}</p>
                                                        <p><span className="text-gray-600">Type:</span> {item.itemType}</p>
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
                                                <hr className="my-4 border-gray-200" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <i className="fas fa-shopping-cart text-4xl text-gray-400 mb-4"></i>
                                        <p className="text-gray-500">Your Cart is Empty</p>
                                    </div>
                                )}
                            </div>
                            {cartItems.length > 0 && (
                                <div className="mt-6">
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <div className="flex justify-between items-center text-lg font-semibold">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Delivery Address</h2>
                            <button
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setShowAddressForm(false)}
                            >
                                <i className="text-2xl fa-regular fa-circle-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={address.fullName}
                                    onChange={handleAddressChange}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    name="streetAddress"
                                    value={address.streetAddress}
                                    onChange={handleAddressChange}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter street address"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={address.city}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter city"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={address.state}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter state"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={address.postalCode}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter postal code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={address.phoneNumber}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Scan to Pay</h2>
                            <button
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setShowPaymentQR(false)}
                            >
                                <i className="text-2xl fa-regular fa-circle-xmark"></i>
                            </button>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                                <QRCodeSVG
                                    value={generateGPayURL(paymentAmount)}
                                    size={256}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <p className="text-lg font-semibold mb-2">Amount: ${paymentAmount.toFixed(2)}</p>
                            <div className="text-sm text-gray-600 text-center space-y-2">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Select Payment Method</h2>
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
                                className="w-full bg-white border-2 border-blue-500 text-blue-500 py-3 px-6 rounded-lg hover:bg-blue-50 transition duration-200 text-base font-semibold flex items-center justify-center gap-2"
                            >
                                <i className="fab fa-google-pay"></i>
                                Pay with GPay
                            </button>
                            <button
                                onClick={() => handlePaymentMethod('cod')}
                                className="w-full bg-white border-2 border-green-500 text-green-500 py-3 px-6 rounded-lg hover:bg-green-50 transition duration-200 text-base font-semibold flex items-center justify-center gap-2"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <button 
                                className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={handleClosePost}
                            >
                                Close
                            </button>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8">
                                <div>
                                    <img
                                        src={activePost.image}
                                        alt={activePost.name}
                                        className="w-full h-[250px] sm:h-[350px] lg:h-[500px] object-cover rounded-2xl"
                                    />
                                    <div className="mt-6">
                                        <h3 className="text-xl font-semibold mb-2">Rate this Product</h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar
                                                    key={star}
                                                    className={`cursor-pointer text-2xl ${
                                                        star <= (rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}
                                                    onClick={() => submitRating(star, activePost._id)}
                                                />
                                            ))}
                                            <span className="ml-2 text-sm sm:text-base">
                                                ({typeof avgRating === 'number' ? avgRating.toFixed(1) : '0.0'} avg from {totalRating} ratings)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl lg:text-3xl font-bold">{activePost.name}</h2>
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this product?')) {
                                                        handleDeletePost(activePost._id);
                                                        handleClosePost();
                                                    }
                                                }}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                                            >
                                                Delete Product
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-base lg:text-lg">{activePost.description}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <p className="text-base lg:text-lg"><span className="font-semibold">Size:</span> {activePost.size}</p>
                                        <p className="text-base lg:text-lg"><span className="font-semibold">Type:</span> {activePost.type}</p>
                                        <p className="text-base lg:text-lg"><span className="font-semibold">Price:</span> ${activePost.price}</p>
                                        <p className="text-base lg:text-lg"><span className="font-semibold">Category:</span> {activePost.group}</p>
                                    </div>

                                    <button 
                                        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-200 text-base lg:text-lg font-semibold"
                                        onClick={() => handleAddToCart(activePost)}
                                    >
                                        Add to Cart
                                    </button>

                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-4">Reviews</h3>
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Write a review..."
                                                className="flex-1 p-2 border border-gray-300 rounded"
                                            />
                                            <button
                                                onClick={handleSubmit}
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 whitespace-nowrap"
                                            >
                                                Post
                                            </button>
                                        </div>

                                        <div className="space-y-4 max-h-[200px] overflow-y-auto">
                                            {comments.map((comment) => (
                                                <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                                                        <p className="font-semibold">{comment.username}</p>
                                                        {isCurrentUserComment(comment) && (
                                                            <button
                                                                onClick={() => deleteComments(comment._id)}
                                                                className="text-red-500 hover:text-red-600"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-700">{comment.comment}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
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
