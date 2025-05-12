const express = require("express")
const Product = require("../models/Product")
const { protect, admin } = require("../middleware/authMiddleware")
const {mongoose} = require('mongoose')

const router = express.Router();

// Create Product route
router.post("/", protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            display,
            condition,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;
        const product = new Product({
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            display,
            condition,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
            user: req.user._id,
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Update product Id
// access Private/admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            display,
            condition,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;

        const product = await Product.findById(req.params.id);
        //find product by id
        if (product) {
            //update product field
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.countInStock = countInStock || product.countInStock;
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.display = display || product.display;
            product.condition = condition || product.condition;
            product.images = images || product.images;
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.isPublished = isPublished !== undefined ? isPublished : product.isPublished;
            product.tags = tags || product.tags;
            product.dimensions = dimensions || product.dimensions;
            product.weight = weight || product.weight;
            product.sku = sku || product.sku;

            //Save updated product to database
            const updatedProduct = await product.save();
            res.json(updatedProduct);

        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");

    }
})

//Delete route by id
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: "Product removed" })
        } else {
            res.status(404).json({ message: "Product not found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
})

// Get all products
router.get("/", async (req, res) => {
    try {
        const {
            size,
            color,
            display,
            condition,
            category,
            brand,
            minPrice,
            maxPrice,
            sortBy,
            search,
            limit
        } = req.query;
        let query = {};

        //filter product

        if (category && category.toLocaleLowerCase() !== "all") {
            query.category = category
        }
        if (brand) { 
            // query.brand = brand;
            query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };           
        }
        if (size) {
            query.sizes = { $in: [size] };
        }
        if (color) {
            query.colors = { $in: [color] };
        }
        if (display) {
            query.display = { $in: [display] };
        }
        if (condition) {
            query.condition = { $in: [condition] };
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ]
        }

        let sort = {};
        if (sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sort = { price: 1 };
                    break;
                case "priceDesc":
                    sort = { price: -1 };
                    break;
                case "popularity":
                    sort = { rating: -1 };
                    break;
                default:
                    break;
            }
        }

        let products = await Product.find(query)
            .sort(sort)
            .limit(Number(limit) || 0);
        res.json(products)


    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");

    }
})


// Best Seller 
//Get product with highest rating
router.get("/best-seller", async (req, res) => {
    try {
        const bestSeller = await Product.findOne().sort({ rating: -1 });
        if (bestSeller) {
            res.json(bestSeller);
        } else {
            res.status(404).json({ message: "No best seller found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error")
    }
})

//New-arrivals
router.get("/new-arrivals", async (req, res) => {
    try {
        const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
        res.json(newArrivals)
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error")
    }
})
// GET /api/products/batch-details?ids=id1,id2,id3
// Fetches details for multiple products based on a list of IDs
router.get('/batch-details', async (req, res) => {
    try {
        let productIds = req.query.ids; // Expecting IDs as a comma-separated string or an array

        if (!productIds) {
            return res.status(400).json({ message: 'Product IDs are required.' });
        }

        // If productIds is a comma-separated string, convert it to an array
        if (typeof productIds === 'string') {
            productIds = productIds.split(',').map(id => id.trim());
        }

        // Validate ObjectIds (optional but good practice)
        const validProductIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));

        if (validProductIds.length === 0 && productIds.length > 0) {
            return res.status(400).json({ message: 'No valid product IDs provided.' });
        }
        if (validProductIds.length !== productIds.length) {
            console.warn('Some invalid product IDs were filtered out:', productIds.filter(id => !mongoose.Types.ObjectId.isValid(id)));
            // You might choose to inform the client or just proceed with valid ones
        }

        // Fetch products from the database
        // Using .lean() for better performance if you don't need Mongoose document methods
        const products = await Product.find({ '_id': { $in: validProductIds } }).lean();

        if (!products || products.length === 0) {
            return res.json([]);
        }
        res.json(products); 

    } catch (error) {
        console.error('Error fetching batch product details:', error);
        res.status(500).json({ message: 'Server error while fetching product details.' });
    }
});

// Get Products by ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product Not Found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
})


// Get similar products
router.get("/similar/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const similarProducts = await Product.find({
            _id: { $ne: id },
            brand: product.brand,
            category: product.category,
        }).limit(4);

        res.json(similarProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error")
    }
})


module.exports = router;