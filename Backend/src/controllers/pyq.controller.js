const Pyq = require('../models/Pyq.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadOnCloudinary } = require('../utils/cloudinaryUpload');

// 1. GET ALL PYQs (Public, filterable by exam & year)
const getAllPyqs = asyncHandler(async (req, res) => {
  const { exam, year } = req.query;
  const filter = {};

  if (exam && exam !== 'All') filter.exam = exam;
  if (year) filter.year = Number(year);

  const pyqs = await Pyq.find(filter).sort({ year: -1, title: 1 });

  return res.status(200).json(
    new ApiResponse(200, pyqs, 'Previous Year Papers fetched successfully.')
  );
});

// 2. CREATE PYQ (Admin Only with Cloudinary PDF support)
const createPyq = asyncHandler(async (req, res) => {
  const { title, exam, year, paperType } = req.body;

  if (!title || !exam || !year) {
    throw new ApiError(400, 'Title, Exam, and Year are required.');
  }

  let fileUrl = req.body.fileUrl || '';
  if (req.file?.path) {
    const uploadedPdf = await uploadOnCloudinary(req.file.path, 'rozer_that_pyq_pdfs');
    if (uploadedPdf?.url) {
      fileUrl = uploadedPdf.url;
    }
  }

  const pyq = await Pyq.create({
    title,
    exam,
    year: Number(year),
    paperType: paperType || 'Combined',
    fileUrl,
  });

  return res.status(201).json(
    new ApiResponse(201, pyq, 'PYQ paper uploaded successfully.')
  );
});

// 3. INCREMENT DOWNLOAD COUNT
const incrementDownloadCount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pyq = await Pyq.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } }, { new: true });

  if (!pyq) {
    throw new ApiError(404, 'PYQ paper not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, { downloadCount: pyq.downloadCount }, 'Download count updated.')
  );
});

// 4. DELETE PYQ (Admin Only)
const deletePyq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pyq = await Pyq.findByIdAndDelete(id);

  if (!pyq) {
    throw new ApiError(404, 'PYQ paper not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'PYQ paper deleted successfully.')
  );
});

module.exports = {
  getAllPyqs,
  createPyq,
  incrementDownloadCount,
  deletePyq,
};
