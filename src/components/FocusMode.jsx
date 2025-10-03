import React from 'react';
import { DateTime } from 'luxon';
import { X, Coffee, Square, CheckCircle } from 'lucide-react';
import { getTaskTimeRemaining, formatTimeRemaining } from '../utils/timeWindow';

export default function FocusMode({
  task,
  client,
  timerSeconds,
  onBreak,
  onStop,
  onMarkAsDone,
  onExit,
  isOnBreak
}) {
  if (!task) return null;

  const timeInfo = getTaskTimeRemaining(task, timerSeconds);
  const currentTime = DateTime.now().setZone('Asia/Manila').toFormat('h:mm:ss a');
  const currentDate = DateTime.now().setZone('Asia/Manila').toFormat('EEEE, MMMM d, yyyy');

  const displayTime = timeInfo.isOverrun
    ? formatTimeRemaining(timeInfo.overrunSeconds)
    : formatTimeRemaining(timeInfo.remainingSeconds);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 z-50 flex items-center justify-center">
      <button
        onClick={onExit}
        className="absolute top-6 right-6 p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
        title="Exit Focus Mode (timer continues)"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="max-w-4xl w-full px-8 text-center space-y-6">
        <div className="space-y-1">
          <div className="text-gray-400 text-xs font-medium">{currentDate}</div>
          <div className="text-white text-xl font-mono font-semibold">{currentTime}</div>
        </div>

        {isOnBreak && (
          <div className="bg-yellow-500 text-yellow-900 py-2 px-4 rounded-lg inline-block">
            <div className="flex items-center space-x-2">
              <Coffee className="h-4 w-4" />
              <span className="font-semibold text-sm">On Break</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-center">
            <div className={`text-7xl font-mono font-bold mb-2 ${
              timeInfo.isOverrun ? 'text-red-400' : 'text-white'
            }`}>
              {displayTime}
            </div>
            {timeInfo.isOverrun && (
              <div className="text-red-400 text-lg font-semibold mb-1">
                ⚠️ Over Estimated Time
              </div>
            )}
            {task.estimatedMin && (
              <div className="text-gray-400 text-base">
                {timeInfo.isOverrun
                  ? `+${formatTimeRemaining(timeInfo.overrunSeconds)} overtime`
                  : `Estimated: ${task.estimatedMin} min`
                }
              </div>
            )}
          </div>

          {task.estimatedMin && (
            <div className="w-full max-w-2xl mx-auto">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    timeInfo.isOverrun ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, timeInfo.percentComplete)}%` }}
                />
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {timeInfo.percentComplete.toFixed(0)}% complete
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-white text-2xl font-bold mb-1">{task.title}</div>
            {client && (
              <div className="text-blue-300 text-lg font-medium mb-2">{client.name}</div>
            )}
            {task.description && (
              <div className="text-gray-300 text-base max-w-2xl mx-auto leading-relaxed">
                {task.description}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onBreak}
            className={`px-6 py-3 rounded-lg font-semibold text-base flex items-center space-x-2 transition-all ${
              isOnBreak
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            <Coffee className="h-5 w-5" />
            <span>{isOnBreak ? 'End Break & Resume' : 'Take a Break'}</span>
          </button>

          <button
            onClick={onMarkAsDone}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-base flex items-center space-x-2 transition-all"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Mark as Done</span>
          </button>

          <button
            onClick={onStop}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-base flex items-center space-x-2 transition-all"
          >
            <Square className="h-5 w-5" />
            <span>Stop Timer</span>
          </button>
        </div>

        <div className="text-gray-500 text-xs">
          Press ESC to exit focus mode (timer will continue)
        </div>
      </div>
    </div>
  );
}
