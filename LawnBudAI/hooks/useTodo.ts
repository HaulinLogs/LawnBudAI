import { useEffect, useState } from 'react';
import { Todo } from '@/models/todo';
import {
  getSeason,
  getMowingAdvice,
  getWateringAdvice,
  getFertilizerAdvice,
  getOverseedingReminder,
  type GrassType,
  type OverseedingReminder,
} from '@/lib/lawnAdvice';

export function useTodo(grassType: GrassType = 'cool_season') {
  const [mowingTodo, setMowingTodo] = useState<Todo | null>(null);
  const [wateringTodo, setWateringTodo] = useState<Todo | null>(null);
  const [fertilizerTodo, setFertilizerTodo] = useState<Todo | null>(null);
  const [overseedingReminder, setOverseedingReminder] = useState<OverseedingReminder | null>(null);

  useEffect(() => {
    const now = new Date();
    const season = getSeason(now);
    setMowingTodo(getMowingAdvice(grassType, season));
    setWateringTodo(getWateringAdvice(grassType, season));
    setFertilizerTodo(getFertilizerAdvice(grassType, season));
    setOverseedingReminder(getOverseedingReminder(grassType, now));
  }, [grassType]);

  return { mowingTodo, wateringTodo, fertilizerTodo, overseedingReminder };
}
