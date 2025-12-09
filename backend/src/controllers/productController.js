import Product from "../models/Product.js";

// @desc    Create a new product (ADMIN)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      brand,
      images,
      isFeatured,
    } = req.body;

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({
        message: "Name, description, price, stock, category required",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      brand,
      images,
      isFeatured,
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (with search, filter, sort, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice
      ? Number(req.query.maxPrice)
      : Number.MAX_SAFE_INTEGER;
    const sortBy = req.query.sortBy || "createdAt"; // createdAt, price, rating
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // asc / desc

    // Build filter
    const filter = {
      price: { $gte: minPrice, $lte: maxPrice },
    };

    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" }; // case-insensitive
    }

    if (category) {
      filter.category = category;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by id
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (ADMIN)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      brand,
      images,
      isFeatured,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.isFeatured =
      typeof isFeatured === "boolean" ? isFeatured : product.isFeatured;

    if (images) {
      product.images = images; // later can handle upload logic
    }

    const updatedProduct = await product.save();

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (ADMIN)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};
