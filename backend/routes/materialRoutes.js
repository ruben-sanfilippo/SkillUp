const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const materialController = require("../controllers/materialController");
const { upload } = require("../middleware/uploadMiddleware");

router.post(
  "/upload",
  authMiddleware,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "anteprima", maxCount: 1 },
    { name: "copertina", maxCount: 1 },
  ]),
  materialController.uploadMaterial,
);
router.get("/purchased/me", authMiddleware, materialController.getPurchasedMaterials);
router.delete("/:id", authMiddleware, materialController.deleteMaterial);
router.get("/:id/download", authMiddleware, materialController.downloadMaterial);
router.post("/:id/purchase", authMiddleware, materialController.purchaseMaterial);

module.exports = router;
