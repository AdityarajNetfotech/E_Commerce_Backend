import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Student from "../models/Student.js";

// ✅ Place an Order (Stock Updates)
export const placeOrder = asyncHandler(async (req, res) => {
  const { school, orderItems, address } = req.body;
  const studentId = req.student._id;

  if (!school || !orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }
  
  if (
    !address ||
    !address.emailId ||
    !address.phoneNumber ||
    !address.addressLine1 ||
    !address.pincode ||
    !address.town ||
    !address.city ||
    !address.state
  ) {
    return res.status(400).json({ message: "Complete address details are required" });
  }

  let totalAmount = 0;
  let updatedOrderItems = [];

  for (let item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      return res.status(404).json({ message: `Product not found: ${item.product}` });
    }

    let price = 0;
    let stockQty = 0;
    let color = null;
    let size = null;

    // ✅ Fetch correct price & stock based on category
    if (product.category === "Uniform" && product.uniformDetails?.variations[0]?.subVariations[0]) {
      price = product.uniformDetails.variations[0].subVariations[0].price;
      stockQty = product.uniformDetails.variations[0].subVariations[0].stockQty;
      size = product.uniformDetails.variations[0].subVariations[0].subVariationType || "N/A";
      color = product.uniformDetails.variations[0].secondVariationInfo || "N/A";

    } else if (product.category === "Books" && product.bookDetails) {
      price = product.bookDetails.price;
      stockQty = product.bookDetails.stockQty;
    } else if (product.category === "Stationary" && product.stationaryDetails) {
      price = product.stationaryDetails.price;
      stockQty = product.stationaryDetails.stockQty;
    } else {
      return res.status(400).json({ message: `Product details missing for ${product.name}` });
    }

    // ✅ Check stock availability
    if (stockQty < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }

    // ✅ Update total amount
    totalAmount += price * item.quantity;

    // ✅ Store updated order item
    updatedOrderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      image: product.image.length > 0 ? product.image[0] : "", 
      price,
      size,
      color,
    });

    // ✅ Reduce stock dynamically
    if (product.category === "Uniform") {
      product.uniformDetails.variations[0].subVariations[0].stockQty -= item.quantity;
    } else if (product.category === "Books") {
      product.bookDetails.stockQty -= item.quantity;
    } else if (product.category === "Stationary") {
      product.stationaryDetails.stockQty -= item.quantity;
    }

    await product.save();
  }

  // ✅ Create new order
  const newOrder = new Order({
    student: studentId,
    school,
    address,
    orderItems: updatedOrderItems,
    totalAmount,
  });

  const createdOrder = await newOrder.save();

  // ✅ Push full order data to the student's orders array
  const student = await Student.findById(studentId);
  student.orders.push({
    orderItems: updatedOrderItems,
    school,
    address,
    totalAmount,
    paymentStatus: createdOrder.paymentStatus,
    orderStatus: createdOrder.orderStatus,
    createdAt: createdOrder.createdAt,
  });

  await student.save();


  res.status(201).json(createdOrder);
});

  

// ✅ Get all orders for logged-in student
export const getStudentOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ student: req.student._id })
    .populate("orderItems.product", "name image"); 

  res.json(orders);
});

// ✅ Get Order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("orderItems.product", "name image");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
});



export const getSchoolOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ school: req.school._id })
    .populate("orderItems.product", "name image"); 

  res.json(orders);
});


// ✅ Get all orders (Admin Only)
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("student", "name email") 
    .populate("school", "name") 
    .populate("orderItems.product", "name image"); 

  res.json(orders);
});



// ✅ Update Order Status (School only)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.school.toString() !== req.school._id.toString()) {
    return res.status(401).json({ message: "order not found with this order Id" });
  }

  order.orderStatus = orderStatus;
  await order.save();

  res.json(order); 
});

// ✅ Update Payment Status 
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  res.json({ message: "Payment status updated", paymentStatus: order.paymentStatus });
});



// ✅ Delete an order (Admin only)
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  await order.deleteOne();
  res.json({ message: "Order deleted successfully" });
});


// ✅ Get Last Used Address for Logged-In Student
export const getSavedAddress = asyncHandler(async (req, res) => {
  const latestOrder = await Order.findOne({ student: req.student._id })
    .sort({ createdAt: -1 })
    .select("address");

  if (!latestOrder) {
    return res.status(404).json({ message: "No address found. Place an order first." });
  }

  res.json(latestOrder.address);
});


// ✅ Update Address in the Latest Order (for reuse)
export const updateSavedAddress = asyncHandler(async (req, res) => {
  const {
    emailId,
    phoneNumber,
    addressLine1,
    addressLine2,
    pincode,
    town,
    city,
    state,
  } = req.body;


  if (!emailId || !phoneNumber || !addressLine1 || !pincode || !town || !city || !state) {
    return res.status(400).json({ message: "All required address fields must be filled" });
  }

  // Get latest order and update its address
  const latestOrder = await Order.findOne({ student: req.student._id })
    .sort({ createdAt: -1 });

  if (!latestOrder) {
    return res.status(404).json({ message: "No order found to update address. Place an order first." });
  }

  latestOrder.address = {
    emailId,
    phoneNumber,
    addressLine1,
    addressLine2,
    pincode,
    town,
    city,
    state,
  };

  await latestOrder.save();

  res.json({ message: "Address updated successfully", address: latestOrder.address });
});

