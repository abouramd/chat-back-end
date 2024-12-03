import express from "express";
const router = express.Router();

router.get("/data", (req, res) => {
  res.status(200).json({ success: true, message: "My data", id: req.userId });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  res
    .status(200)
    .json({ success: true, message: "user id data", params: req.params });
});

router.get("/all", (req, res) => {
  const { page } = req.query;
  const limit = 20;
  const offset = (Number(page) - 1) * limit || 0;
  res.status(200).json({ success: true, message: "all users data" });
});

router.get("/search", (req, res) => {
  const { page, query } = req.query;
  res.status(200).json({
    success: true,
    message: "You have called search api",
    query: req.query,
  });
});

export default router;
