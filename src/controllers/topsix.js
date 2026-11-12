import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import TopSix from "../models/TopSix.js";
import getNextSequence from "../utils/nextSequence.js";

// @desc    get
// @route   GET /api/v1/topsix
// @acess   public
const getAll = asyncHandler(async (req, res) => {
  const total = await TopSix.countDocuments();

  const data = await TopSix.find().sort({ createdAt: -1 }).exec();

  return res.status(200).json({
    success: true,
    data,
  });
});

// @desc    get by id
// @route   GET /api/v1/topsix/:id
// @acess   private
const get = asyncHandler(async (req, res) => {
  const data = await TopSix.findOne({ sequenceId: req.params.id });

  res.status(201).json({
    success: true,
    data,
  });
});

// @desc    create
// @route   POST /api/v1/topsix
// @acess   private
const create = asyncHandler(async (req, res) => {
  const sequencId = await getNextSequence("topsix");
  req.body.sequenceId = sequencId;

  console.log("sequencId", req.body);

  const data = await TopSix.create(req.body);

  res.status(201).json({
    success: true,
    data,
  });
});

// @desc    update
// @route   PUT /api/v1/topsix/:id
// @acess   private
const update = asyncHandler(async (req, res, next) => {
  let data = await TopSix.findById({
    _id: req.params.id,
  });

  if (!data) {
    return next(new ErrorResponse(`Article not found`, 404));
  }

  data = await TopSix.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({ success: true, data });
});

// @desc    delete
// @route   DELETE /api/v1/topsix/:id
// @acess   private
const deleteData = asyncHandler(async (req, res, next) => {
  const data = await TopSix.findById({
    _id: req.params.id,
  });

  if (!data) {
    return next(new ErrorResponse(`Article not found`, 404));
  }

  await data.softDelete();

  return res.status(204).send();
});

export { getAll, get, create, update, deleteData };
