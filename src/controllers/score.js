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

  const setNumber = Number(current_set);
  const newTeam1Score = Number(team1_score);
  const newTeam2Score = Number(team2_score);

  const existingScore = await Score.findById(req.params.id);

  if (!existingScore) {
    return next(new ErrorResponse("Score not found", 404));
  }

  // Add a new set
  if (setNumber > existingScore.current_set) {
    const data = await Score.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          current_set: setNumber,
        },
        $push: {
          sets: {
            set_number: setNumber,
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

    io.emit("score:updated", { success: true, data });

    return res.status(200).json({ success: true, data });
  }

  // Remove the last set
  if (setNumber < existingScore.current_set) {
    const data = await Score.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          current_set: setNumber,
        },
        $pop: {
          sets: 1,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    io.emit("score:updated", { success: true, data });

    return res.status(200).json({ success: true, data });
  }

  // Find current set
  const currentSet = existingScore.sets.find(
    (set) => set.set_number === setNumber,
  );

  if (!currentSet) {
    return next(new ErrorResponse("Set not found", 404));
  }

  const oldTeam1Score = currentSet.team1_score;
  const oldTeam2Score = currentSet.team2_score;

  const updateQuery = {
    $set: {
      "sets.$.team1_score": newTeam1Score,
      "sets.$.team2_score": newTeam2Score,
      current_set: setNumber,
      team1,
      team2,
    },
  };

  // Determine which team's score changed
  let changedTeam = null;
  let changedScore = null;
  let isMinus = false;

  if (newTeam1Score !== oldTeam1Score) {
    changedTeam = team1;
    changedScore = newTeam1Score;
    isMinus = newTeam1Score < oldTeam1Score;
  } else if (newTeam2Score !== oldTeam2Score) {
    changedTeam = team2;
    changedScore = newTeam2Score;
    isMinus = newTeam2Score < oldTeam2Score;
  }

  if (changedTeam) {
    if (isMinus) {
      // Find the last point recorded for this team
      const lastIndex = existingScore.topTen.findLastIndex(
        (item) => String(item.team?._id ?? item.team) === String(changedTeam),
      );

      if (lastIndex !== -1) {
        // Remove the specific point using its subdocument _id
        const point = existingScore.topTen[lastIndex];

        updateQuery.$pull = {
          topTen: {
            _id: point._id,
          },
        };
      }
    } else {
      // Add new point
      const sequenceId = await getNextSequence("topTen");

      updateQuery.$push = {
        topTen: {
          sequenceId,
          score: changedScore,
          team: changedTeam,
        },
      };
    }
  }

  const data = await Score.findOneAndUpdate(
    {
      _id: req.params.id,
      "sets.set_number": setNumber,
    },
    updateQuery,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!data) {
    return next(new ErrorResponse("Score not found", 404));
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
