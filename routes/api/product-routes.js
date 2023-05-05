const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try{
    const productData = await Product.findAll();
    res.status(200).json(productData);
    }  catch(err){
      res.status(500).json(err);
    }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try{
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category},{model:Tag}],
    });

    if (!productData) {
      res.status(404).json({ message: 'No products found with that id!' });
      return;
    }
    res.status(200).json(productData);
  }  catch(err){
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', async (req, res) => {
  try {
    // find the product to update
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // update the product data
    await product.update(req.body);

    // update product tags
    if (req.body.tagIds) {
      const newTagIds = req.body.tagIds.map((id) => parseInt(id));
      const productTags = await product.getProductTags();

      // remove old product tags
      const tagsToRemove = productTags.filter(
        (tag) => !newTagIds.includes(tag.tag_id)
      );
      await Promise.all(
        tagsToRemove.map((tag) => ProductTag.destroy({ where: { id: tag.id } }))
      );

      // add new product tags
      const tagsToAdd = newTagIds.filter(
        (id) => !productTags.map((tag) => tag.tag_id).includes(id)
      );
      const productTagIdArr = tagsToAdd.map((tagId) => ({
        product_id: product.id,
        tag_id: tagId,
      }));
      const newProductTags = await ProductTag.bulkCreate(productTagIdArr);

      res.status(200).json({ product, newProductTags });
    } else {
      res.status(200).json(product);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});


router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
