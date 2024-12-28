const mongoose = require('mongoose');
const Product = require('../models/Product');
const Brand = require('../models/Brand');

// Create a new brand and associate it with a product
const createBrand = async (req, res) => {
  const { proId, brands } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(proId)) {
      return res.status(400).json({ error: 'Invalid Product ID' });
    }

    const product = await Product.findById(proId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingBrand = await Brand.findOne({ proId, brands });
    if (existingBrand) {
      return res.status(400).json({ error: 'Brand already exists for this product' });
    }

    const newBrand = new Brand({ proId, brands });
    await newBrand.save();

    res.status(201).json(newBrand);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all brands for a specific product by proId
const getBrandsByProductId = async (req, res) => {
  const { proId } = req.params;

  try {
    const brands = await Brand.find({ proId });
    if (brands.length === 0) {
      return res.status(404).json({ error: 'No brands found for this product' });
    }
    res.status(200).json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllBrands = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const brands = await Brand.find().skip(skip).limit(limit);
    const totalBrands = await Brand.countDocuments();
    const totalPages = Math.ceil(totalBrands / limit);

    res.json({
      brands,
      pagination: {
        currentPage: page,
        totalPages,
        totalBrands,
      },
    });
  } catch (error) {
    res.status(400).json({ error: 'Error fetching brands' });
  }
};

// Update a brand by its ID
const updateBrand = async (req, res) => {
  const { id } = req.params;
  const { proId, brands } = req.body;

  try {
    // Check if the brand exists
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Check if the product exists
    if (!mongoose.Types.ObjectId.isValid(proId)) {
      return res.status(400).json({ error: 'Invalid Product ID' });
    }

    const product = await Product.findById(proId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update the brand
    brand.proId = proId || brand.proId;
    brand.brands = brands || brand.brands;

    await brand.save();
    res.status(200).json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a brand by its ID
const deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.status(200).json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllBrandsForSelect = async (req, res) => {
  try {
    const products = await Brand.find({proId: req.params.brandId});
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching products' });
  }
};

module.exports = { createBrand, getBrandsByProductId, getAllBrands, updateBrand, deleteBrand, getAllBrandsForSelect };
