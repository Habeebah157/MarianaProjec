const router = require("express").Router();
const pool = require("../db.js");
const {verifyToken} = require("../middleware/authorization.js");

// POST /businesses - Create new business
router.post("/", verifyToken, async (req, res) => {
  const { name, description, category, website, email, phone, address, hours, shipping } = req.body;
  const user_id = req.user.id;
  try {

    const businessResult = await pool.query(
  `INSERT INTO businesses (name, description, category, website, email, phone, address, hours, shipping)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   RETURNING *`,
  [
    name,
    description,
    category,
    website,
    email,
    phone,
    address,
    JSON.stringify(hours),  // stringify the hours object here
    shipping
  ]
);


    // Make creator an owner
    await pool.query(
      `INSERT INTO business_users (business_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [businessResult.rows[0].id, user_id, 'owner']
    );

    res.json({ success: true, data: businessResult.rows[0] });
  } catch (err) {
    console.error("Error creating business:", err);
    res.status(500).json({ success: false, message: "Failed to create business" });
  }
});

// GET /businesses - Get all businesses
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, 
       (SELECT COUNT(*) FROM business_users WHERE business_id = b.id) AS member_count
       FROM businesses b`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching businesses:", err);
    res.status(500).json({ success: false, message: "Failed to get businesses" });
  }
});

// // GET /businesses/:id - Get single business with members
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const businessPromise = pool.query(
//       `SELECT * FROM businesses WHERE id = $1`,
//       [id]
//     );

//     const membersPromise = pool.query(
//       `SELECT bu.*, u.user_name, u.user_email 
//        FROM business_users bu
//        JOIN users u ON bu.user_id = u.id
//        WHERE bu.business_id = $1`,
//       [id]
//     );

//     const [businessResult, membersResult] = await Promise.all([businessPromise, membersPromise]);

//     if (businessResult.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Business not found" });
//     }

//     res.json({ 
//       success: true, 
//       data: {
//         ...businessResult.rows[0],
//         members: membersResult.rows
//       }
//     });
//   } catch (err) {
//     console.error("Error fetching business:", err);
//     res.status(500).json({ success: false, message: "Failed to get business" });
//   }
// });

// // PUT /businesses/:id - Update business
// router.put("/:id", authorization, async (req, res) => {
//   const { id } = req.params;
//   const { name, description, industry, website, email, phone, address } = req.body;

//   try {
//     const result = await pool.query(
//       `UPDATE businesses 
//        SET name = $1, description = $2, industry = $3, website = $4, 
//            email = $5, phone = $6, address = $7, updated_at = CURRENT_TIMESTAMP
//        WHERE id = $8
//        RETURNING *`,
//       [name, description, industry, website, email, phone, address, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Business not found" });
//     }

//     res.json({ success: true, data: result.rows[0] });
//   } catch (err) {
//     console.error("Error updating business:", err);
//     res.status(500).json({ success: false, message: "Failed to update business" });
//   }
// });

// // DELETE /businesses/:id - Delete business
// router.delete("/:id", authorization, async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query(
//       `DELETE FROM businesses WHERE id = $1 RETURNING *`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Business not found" });
//     }

//     res.json({ success: true, message: "Business deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting business:", err);
//     res.status(500).json({ success: false, message: "Failed to delete business" });
//   }
// });

module.exports = router;