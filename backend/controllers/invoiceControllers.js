import PDFDocument from "pdfkit";
import Order from "../models/order.js";

export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔐 Optional: ensure user owns the order
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // 🧾 HEADER
    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Customer: ${order.user.name}`);
    doc.text(`Email: ${order.user.email}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    // 📦 ITEMS
    doc.fontSize(14).text("Order Items");
    doc.moveDown(0.5);

    order.items.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${item.title}  |  ₹${item.price} x ${item.qty}`
        );
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, {
      align: "right",
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Invoice generation failed" });
  }
};
