import { useEffect, useState } from 'react';
import { Todo } from '@/models/todo';
import {
  getSeason,
  getMowingAdvice,
  getWateringAdvice,
  getFertilizerAdvice,
  type GrassType,
} from '@/lib/lawnAdvice';

export function useTodo(grassType: GrassType = 'cool_season') {
  const [mowingTodo, setMowingTodo] = useState<Todo | null>(null);
  const [wateringTodo, setWateringTodo] = useState<Todo | null>(null);
  const [fertilizerTodo, setFertilizerTodo] = useState<Todo | null>(null);

  useEffect(() => {
    const season = getSeason(new Date());
    setMowingTodo(getMowingAdvice(grassType, season));
    setWateringTodo(getWateringAdvice(grassType, season));
    setFertilizerTodo(getFertilizerAdvice(grassType, season));
  }, [grassType]);

  return { mowingTodo, wateringTodo, fertilizerTodo };
}
