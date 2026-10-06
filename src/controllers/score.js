import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import Score from "../models/Score.js";
import Team from "../models/Team.js";
import getNextSequence from "../utils/nextSequence.js";
import socket from "../socket.js";

// @desc    get
// @route   GET /api/v1/scores
// @acess   public
const getAll = asyncHandler(async (req, res) => {
  const total = await Score.countDocuments();
  const team_count = await Team.countDocuments();

  if (total === 0 && team_count > 1) {
    const teams = await Team.find().sort({ createdAt: -1 }).limit(2);

    const team1 = teams[0];
    const team2 = teams[1];

    const sequencId = await getNextSequence("score");

    const newScore = await Score.create({
      current_set: 1,
      sets: [
        {
          set_number: 1,
          team1_score: 0,
          team2_score: 0,
        },
      ],
      sequenceId: sequencId,
      team1: team1._id,
      team2: team2._id,
    });
  }

  const data = await Score.find().sort({ createdAt: -1 }).exec();

  return res.status(200).json({
    success: true,
    data,
  });
});

// @desc    get by id
// @route   GET /api/v1/scores/:id
// @acess   private
const get = asyncHandler(async (req, res) => {
  const data = await Score.findOne({ sequenceId: req.params.id });

  res.status(201).json({
    success: true,
    data,
  });
});

// @desc    create
// @route   PUT /api/v1/create/scores
// @acess   private
const create = asyncHandler(async (req, res) => {
  const { current_set } = req.body;

  console.log("sequencId", req.body);

  res.status(201).json({
    success: true,
    data,
  });
});

// @desc    Update current set score
// @route   PUT /api/v1/scores/:id
// @access  private
const update = asyncHandler(async (req, res, next) => {
  const io = socket.getIO();
  const { current_set, team1_score, team2_score, team1, team2 } = req.body;

  const existingScore = await Score.findById(req.params.id);

  if (!existingScore) {
    return next(new ErrorResponse(`Score not found`, 404));
  }

  if (current_set > existingScore.current_set) {
    const data = await Score.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          current_set,
        },

        $push: {
          sets: {
            set_number: current_set,
            team1_score: 0,
            team2_score: 0,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!data) {
      return next(
        new ErrorResponse(`Score or set ${req.current_set} not found`, 404),
      );
    }

    io.emit("score:updated", {
      success: true,
      data,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  }

  if (current_set < existingScore.current_set) {
    const data = await Score.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          current_set,
        },

        // Remove the last set from the array
        $pop: {
          sets: 1,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!data) {
      return next(new ErrorResponse(`Score not found`, 404));
    }

    io.emit("score:updated", {
      success: true,
      data,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  }

  console.log(
    "Updating score:",
    req.params.id,
    current_set,
    team1_score,
    team2_score,
  );

  const data = await Score.findOneAndUpdate(
    {
      _id: req.params.id,
      "sets.set_number": current_set,
    },

    {
      $set: {
        "sets.$.team1_score": team1_score,
        "sets.$.team2_score": team2_score,

        current_set: current_set,
        team1: team1,
        team2: team2,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!data) {
    return next(
      new ErrorResponse(`Score or set ${req.current_set} not found`, 404),
    );
  }

  io.emit("score:updated", {
    success: true,
    data,
  });

  return res.status(200).json({
    success: true,
    data,
  });
});

// @desc    delete
// @route   DELETE /api/v1/scores/:id
// @acess   private
const deleteData = asyncHandler(async (req, res, next) => {
  const data = await Score.findById({
    _id: req.params.id,
  });

  if (!data) {
    return next(new ErrorResponse(`Data not found`, 404));
  }

  await data.softDelete();

  return res.status(204).send();
});

export { getAll, get, create, update, deleteData };
