import { DateTime } from 'luxon';

const DEFAULT_TZ = 'Asia/Manila';

export function convertToDefaultTz(timeString, clientTz) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = DateTime.now().setZone(clientTz || DEFAULT_TZ);
  const clientTime = now.set({ hour: hours, minute: minutes, second: 0 });
  return clientTime.setZone(DEFAULT_TZ);
}

export function isWithinTimeSlot(client) {
  if (!client.enforceTimeSlots || !client.timeSlots || client.timeSlots.length === 0) {
    return { allowed: true, reason: null, nextSlotStart: null };
  }

  const nowInDefaultTz = DateTime.now().setZone(DEFAULT_TZ);
  
  for (const slot of client.timeSlots) {
    const startTime = convertToDefaultTz(slot.start, slot.tz || client.timezone);
    const endTime = convertToDefaultTz(slot.end, slot.tz || client.timezone);
    
    const todayStart = nowInDefaultTz.set({
      hour: startTime.hour,
      minute: startTime.minute,
      second: 0
    });
    const todayEnd = nowInDefaultTz.set({
      hour: endTime.hour,
      minute: endTime.minute,
      second: 0
    });

    if (nowInDefaultTz >= todayStart && nowInDefaultTz <= todayEnd) {
      return { allowed: true, reason: null, nextSlotStart: null };
    }
  }

  const nextSlot = getNextTimeSlot(client);
  return {
    allowed: false,
    reason: `Outside ${client.name}'s working hours`,
    nextSlotStart: nextSlot
  };
}

export function getNextTimeSlot(client) {
  if (!client.timeSlots || client.timeSlots.length === 0) {
    return null;
  }

  const nowInDefaultTz = DateTime.now().setZone(DEFAULT_TZ);
  let nextSlotStart = null;

  for (const slot of client.timeSlots) {
    const startTime = convertToDefaultTz(slot.start, slot.tz || client.timezone);
    const todayStart = nowInDefaultTz.set({
      hour: startTime.hour,
      minute: startTime.minute,
      second: 0
    });

    if (todayStart > nowInDefaultTz) {
      if (!nextSlotStart || todayStart < nextSlotStart) {
        nextSlotStart = todayStart;
      }
    } else {
      const tomorrowStart = todayStart.plus({ days: 1 });
      if (!nextSlotStart || tomorrowStart < nextSlotStart) {
        nextSlotStart = tomorrowStart;
      }
    }
  }

  return nextSlotStart ? nextSlotStart.toMillis() : null;
}

export function getClientDailyTimeLeft(client, timeEntries) {
  if (!client.dailyTimeLimitMin) {
    return { minutesLeft: Infinity, exceeded: false };
  }

  const today = DateTime.now().setZone(DEFAULT_TZ).toISODate();
  const todayEntries = timeEntries.filter(
    entry => entry.clientId === client.id && entry.date === today
  );

  const minutesUsed = todayEntries.reduce((sum, entry) => sum + (entry.duration * 60), 0);
  const minutesLeft = client.dailyTimeLimitMin - minutesUsed;

  return {
    minutesLeft: Math.max(0, minutesLeft),
    minutesUsed,
    exceeded: minutesUsed >= client.dailyTimeLimitMin
  };
}

export function canStartTimer(client, task, timeEntries) {
  if (!client) {
    return { allowed: true, reason: null };
  }

  const timeSlotCheck = isWithinTimeSlot(client);
  if (!timeSlotCheck.allowed) {
    return timeSlotCheck;
  }

  const dailyLimit = getClientDailyTimeLeft(client, timeEntries);
  if (dailyLimit.exceeded) {
    return {
      allowed: false,
      reason: `Daily time limit reached for ${client.name}`,
      dailyLimit
    };
  }

  return { allowed: true, reason: null, dailyLimit };
}

export function getTaskTimeRemaining(task, elapsedSeconds = 0) {
  if (!task.estimatedMin) {
    return { remainingSeconds: Infinity, isOverrun: false, percentComplete: 0 };
  }

  const totalUsedSeconds = (task.timeSpent * 3600) + elapsedSeconds;
  const estimatedSeconds = task.estimatedMin * 60;
  const remainingSeconds = estimatedSeconds - totalUsedSeconds;
  const isOverrun = remainingSeconds < 0;
  const percentComplete = Math.min(100, (totalUsedSeconds / estimatedSeconds) * 100);

  return {
    remainingSeconds: Math.max(0, remainingSeconds),
    overrunSeconds: isOverrun ? Math.abs(remainingSeconds) : 0,
    isOverrun,
    percentComplete,
    estimatedSeconds,
    totalUsedSeconds
  };
}

export function formatTimeRemaining(seconds) {
  const absSeconds = Math.abs(seconds);
  const h = Math.floor(absSeconds / 3600);
  const m = Math.floor((absSeconds % 3600) / 60);
  const s = Math.floor(absSeconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const DEFAULT_TIMEZONE = DEFAULT_TZ;
