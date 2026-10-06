import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import Team from "../models/Team.js";
import getNextSequence from "../utils/nextSequence.js";

// @desc    get
// @route   GET /api/v1/teams
// @acess   public
const getAll = asyncHandler(async (req, res) => {
  const total = await Team.countDocuments();

  const data = await Team.find().sort({ createdAt: -1 }).exec();

  return res.status(200).json({
    success: true,
    data,
  });
});

// @desc    get by id
// @route   GET /api/v1/teams/:id
// @acess   private
const get = asyncHandler(async (req, res) => {
  const data = await Team.findOne({ sequenceId: req.params.id });

  res.status(201).json({
    success: true,
    data,
  });
});

// @desc    create
// @route   POST /api/v1/teams
// @acess   private
const create = asyncHandler(async (req, res) => {
  const sequencId = await getNextSequence("team");
  req.body.sequenceId = sequencId;

  console.log("sequencId", req.body);

  const data = await Team.create(req.body);

  res.status(201).json({
    success: true,
    data,
  });
});

// @desc    update
// @route   PUT /api/v1/teams/:id
// @acess   private
const update = asyncHandler(async (req, res, next) => {
  let data = await Team.findById({
    _id: req.params.id,
  });

  if (!data) {
    return next(new ErrorResponse(`Article not found`, 404));
  }

  data = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({ success: true, data });
});

// @desc    delete
// @route   DELETE /api/v1/teams/:id
// @acess   private
const deleteData = asyncHandler(async (req, res, next) => {
  const data = await Team.findById({
    _id: req.params.id,
  });

  if (!data) {
    return next(new ErrorResponse(`Article not found`, 404));
  }

  await data.softDelete();

  return res.status(204).send();
});

export { getAll, get, create, update, deleteData };
