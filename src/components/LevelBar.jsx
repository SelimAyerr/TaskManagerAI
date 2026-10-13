import {
  getLevelProgress,
  getCurrentTitle,
} from "../interfaces/gamification";

function LevelBar({ xp }) {
  const progress = getLevelProgress(xp);
  const title = getCurrentTitle(progress.level);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-xl text-white">
            {title.icon}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Level {progress.level}
            </p>

            <h3 className="font-bold text-gray-900">
              {title.title}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-gray-900">
            {xp.toLocaleString("tr-TR")} XP
          </p>

          <p className="text-xs text-gray-400">
            Sonraki: {progress.nextLevelXp.toLocaleString("tr-TR")} XP
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-gray-500">
            Level {progress.level}
          </span>

          <span className="font-semibold text-gray-700">
            {progress.current.toLocaleString("tr-TR")} /{" "}
            {progress.required.toLocaleString("tr-TR")} XP
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-700"
            style={{
              width: `${progress.percentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default LevelBar;