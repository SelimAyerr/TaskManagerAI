export const createTask = (
  title,
  description,
  priority = "Orta"
) => {
  return {
    id: Date.now(),
    title,
    description,
    priority,
    completed: false,
  };
};