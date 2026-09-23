const Notification = require('../models/Notification.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadOnCloudinary } = require('../utils/cloudinaryUpload');

// 1. GET ALL NOTIFICATIONS (Public)
const getAllNotifications = asyncHandler(async (req, res) => {
  const { exam } = req.query;
  const filter = exam && exam !== 'All' ? { exam } : {};

  const notifications = await Notification.find(filter).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, notifications, 'Notifications fetched successfully.')
  );
});

// 2. CREATE NOTIFICATION (Admin Only with Cloudinary PDF support)
const createNotification = asyncHandler(async (req, res) => {
  const { title, exam, eligibility, ageLimit, applyStart, applyEnd, officialLink } = req.body;

  if (!title || !exam) {
    throw new ApiError(400, 'Title and Exam category are required.');
  }

  let pdfUrl = req.body.pdfUrl || '';
  if (req.file?.path) {
    const uploadedPdf = await uploadOnCloudinary(req.file.path, 'rozer_that_notifications_pdfs');
    if (uploadedPdf?.url) {
      pdfUrl = uploadedPdf.url;
    }
  }

  const notification = await Notification.create({
    title,
    exam,
    eligibility: eligibility || '',
    ageLimit: ageLimit || '',
    applyStart: applyStart || '',
    applyEnd: applyEnd || '',
    officialLink: officialLink || '',
    pdfUrl,
  });

  return res.status(201).json(
    new ApiResponse(201, notification, 'Notification published successfully.')
  );
});

// 3. DELETE NOTIFICATION (Admin Only)
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByIdAndDelete(id);

  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Notification deleted successfully.')
  );
});

module.exports = {
  getAllNotifications,
  createNotification,
  deleteNotification,
};
