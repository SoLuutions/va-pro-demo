import React from 'react';
import { DateTime } from 'luxon';
import { X, Coffee, Square } from 'lucide-react';
import { getTaskTimeRemaining, formatTimeRemaining } from '../utils/timeWindow';

export default function FocusMode({
  task,
  client,
  timerSeconds,
  onBreak,
  onStop,
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

      <div className="max-w-4xl w-full px-8 text-center space-y-12">
        <div className="space-y-2">
          <div className="text-gray-400 text-sm font-medium">{currentDate}</div>
          <div className="text-white text-3xl font-mono font-semibold">{currentTime}</div>
        </div>

        {isOnBreak && (
          <div className="bg-yellow-500 text-yellow-900 py-3 px-6 rounded-lg inline-block">
            <div className="flex items-center space-x-2">
              <Coffee className="h-5 w-5" />
              <span className="font-semibold">On Break</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="text-center">
            <div className={`text-9xl font-mono font-bold mb-4 ${
              timeInfo.isOverrun ? 'text-red-400' : 'text-white'
            }`}>
              {displayTime}
            </div>
            {timeInfo.isOverrun && (
              <div className="text-red-400 text-xl font-semibold mb-2">
                ⚠️ Over Estimated Time
              </div>
            )}
            {task.estimatedMin && (
              <div className="text-gray-400 text-lg">
                {timeInfo.isOverrun
                  ? `+${formatTimeRemaining(timeInfo.overrunSeconds)} overtime`
                  : `Estimated: ${task.estimatedMin} min`
                }
              </div>
            )}
          </div>

          {task.estimatedMin && (
            <div className="w-full max-w-2xl mx-auto">
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    timeInfo.isOverrun ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, timeInfo.percentComplete)}%` }}
                />
              </div>
              <div className="text-gray-400 text-sm mt-2">
                {timeInfo.percentComplete.toFixed(0)}% complete
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-white text-4xl font-bold mb-2">{task.title}</div>
            {client && (
              <div className="text-blue-300 text-2xl font-medium mb-4">{client.name}</div>
            )}
            {task.description && (
              <div className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
                {task.description}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={onBreak}
            className={`px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-3 transition-all ${
              isOnBreak
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            <Coffee className="h-6 w-6" />
            <span>{isOnBreak ? 'Resume Work' : 'Take a Break'}</span>
          </button>

          <button
            onClick={onStop}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-lg flex items-center space-x-3 transition-all"
          >
            <Square className="h-6 w-6" />
            <span>Stop Timer</span>
          </button>
        </div>

        <div className="text-gray-500 text-sm">
          Press ESC to exit focus mode (timer will continue)
        </div>
      </div>
    </div>
  );
}
