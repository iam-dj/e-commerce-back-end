const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!categoryData) {
      res.status(404).json({ message: "No Category found with that id!" });
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const categoryData = await Category.create(req.body);
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// router.put("/:id", (req, res) => {
//   // update a category by its `id` value
//   Category.update(
//     {
//       name: req.body.category_name,
//     },
//     {
//       where: {
//         id: req.params.id,
//       },
//     }
//   )
//     .then((editCategory) => {
//       if (!editCategory) {
//         res.status(404).json({ message: "Category not found" });
//         return;
//       }
//       res.status(200).json(editCategory);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({ msg: "error occurred", err });
//     });
// });

router.put('/:id', async (req, res) => {
  try {
    // update category data
    const categoryData = await Category.update(
      {
        category_name: req.body.category_name,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    // update associated products
    const updatedProducts = await Product.update(
      {
        category_id: req.params.id,
      },
      {
        where: {
          category_id: null, // only update products without a category
        },
      }
    );

    res.status(200).json({ message: 'Category updated successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error occurred', err });
  }
});


router.delete("/:id", async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!categoryData) {
      res.status(404).json({ message: "No Category found with that id!" });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
