const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const prisma = new PrismaClient();
const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin not allowed"));
  },
}));
app.use(express.json());

const truecallerRate = new Map();


const ensureUser = async (userId) => {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: userId.includes("@") ? userId : null,
    },
  });
};

const hitRateLimit = (key, maxPerMinute = 10) => {
  const currentMinute = Math.floor(Date.now() / 60000);
  const state = truecallerRate.get(key);

  if (!state || state.minute !== currentMinute) {
    truecallerRate.set(key, { minute: currentMinute, count: 1 });
    return false;
  }

  if (state.count >= maxPerMinute) {
    return true;
  }

  state.count += 1;
  truecallerRate.set(key, state);
  return false;
};

app.get("/", (_req, res) => {
  res.json({ message: "Logic Looper backend is running 🚀" });
});

app.post("/auth/truecaller/dev-verify", (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone and otp are required" });
  }

  if (hitRateLimit(phone, 6)) {
    return res.status(429).json({ error: "Too many verification attempts. Try again shortly." });
  }

  const isDevMode = (process.env.NODE_ENV || "development") !== "production";
  const isDevOtp = /^\d{4}$/.test(otp);

  if (!(isDevMode ? isDevOtp : otp === "123456")) {
    return res.status(401).json({
      error: isDevMode ? "Enter any 4-digit otp in development mode" : "Invalid otp",
    });
  }

  const sanitizedPhone = phone.replace(/[^0-9+]/g, "");
  return res.json({
    uid: `tc-${sanitizedPhone}`,
    name: `Truecaller ${sanitizedPhone.slice(-4)}`,
    email: null,
  });
});

app.post("/users", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/daily-scores", async (req, res) => {
  try {
    const { userId, puzzleId, score, timeTaken, solvedAt } = req.body;

    if (!userId || !puzzleId || typeof score !== "number" || typeof timeTaken !== "number") {
      return res.status(400).json({ error: "Missing score payload fields" });
    }

    const solvedDate = solvedAt ? new Date(solvedAt) : new Date();
    const date = new Date(Date.UTC(solvedDate.getUTCFullYear(), solvedDate.getUTCMonth(), solvedDate.getUTCDate()));

    await ensureUser(userId);

    const savedScore = await prisma.dailyScore.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        score,
        timeTaken,
        puzzleId,
      },
      create: {
        userId,
        puzzleId,
        score,
        timeTaken,
        date,
      },
    });

    return res.json(savedScore);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/daily-scores/batch", async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || !records.length) {
      return res.status(400).json({ error: "records[] is required" });
    }

    const saved = [];
    for (const record of records) {
      const { userId, puzzleId, score, timeTaken, solvedAt } = record;
      if (!userId || !puzzleId || typeof score !== "number" || typeof timeTaken !== "number") {
        continue;
      }

      await ensureUser(userId);

      const solvedDate = solvedAt ? new Date(solvedAt) : new Date();
      const date = new Date(Date.UTC(solvedDate.getUTCFullYear(), solvedDate.getUTCMonth(), solvedDate.getUTCDate()));

      const row = await prisma.dailyScore.upsert({
        where: {
          userId_date: {
            userId,
            date,
          },
        },
        update: {
          score,
          timeTaken,
          puzzleId,
        },
        create: {
          userId,
          puzzleId,
          score,
          timeTaken,
          date,
        },
      });

      saved.push(row.id);
    }

    return res.json({ processed: saved.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/leaderboard/daily", async (_req, res) => {
  try {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const leaders = await prisma.dailyScore.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: [{ score: "desc" }, { timeTaken: "asc" }],
      take: 100,
      include: {
        user: {
          select: { email: true, id: true, streakCount: true },
        },
      },
    });

    const formatted = leaders.map((leader, idx) => ({
      rank: idx + 1,
      userId: leader.user.id,
      email: leader.user.email || "Anonymous",
      score: leader.score,
      timeTaken: leader.timeTaken,
      streak: leader.user.streakCount,
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/users/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stats: true,
        scores: {
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalSolves = user.scores.length;
    const avgTime = totalSolves > 0 
      ? Math.round(user.scores.reduce((acc, s) => acc + s.timeTaken, 0) / totalSolves)
      : 0;

    return res.json({
      id: user.id,
      email: user.email,
      streakCount: user.streakCount,
      lastPlayed: user.lastPlayed,
      totalPoints: user.totalPoints,
      stats: {
        puzzlesSolved: totalSolves,
        avgSolveTime: avgTime,
        recentScores: user.scores.slice(0, 10),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/users/:userId/streak", async (req, res) => {
  try {
    const { userId } = req.params;
    const { streak, lastPlayed, totalPoints } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: streak,
        lastPlayed: lastPlayed ? new Date(lastPlayed) : undefined,
        totalPoints: totalPoints || undefined,
      },
    });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
