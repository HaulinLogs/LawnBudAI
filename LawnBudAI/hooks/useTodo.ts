import { useEffect, useState } from 'react';
import { Todo } from '@/models/todo';

export function useTodo(name: string) {
  const [mowingTodo, setMowingTodo] = useState<Todo | null>(null);
  const [wateringTodo, setWateringTodo] = useState<Todo | null>(null);
  const [fertilizerTodo, setFertilizerTodo] = useState<Todo | null>(null);

  useEffect(() => {
    setMowingTodo({name: "Mowing", text: "more test"});
    setFertilizerTodo({name: "Fertilizer", text: "You need more nitrogen" });
    setWateringTodo({name: "Water soon", text: "no rain for 5 days and forecast..."});
    }, []);

  return { mowingTodo, wateringTodo, fertilizerTodo };
};
